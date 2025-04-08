<?php

namespace App\Http\Controllers;

use App\Models\Domaine;
use App\Models\Client;
use App\Models\CertificatSSL;
use App\Models\ContratMaintenance;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use GuzzleHttp\Client as GuzzleClient;

class DomainController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $domaines=Domaine::all();
        $clientes=Client::all();
        return response()->json(["domaines"=>$domaines,"clientes"=>$clientes]);
    }

    

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
{
    $validated = $request->validate([
        'nom_domaine' => 'required|string|max:255|unique:domaines,nom_domaine',
        'client_id' => 'required|exists:clients,id'
    ]);

    $domain = $this->normalizeDomain($validated['nom_domaine']);
    $domainExpiration = $this->fetchDomainExpiration($domain);
    $sslExpiration = $this->fetchSSLExpiration($domain) ?? $validated['date_expiration_ssl'] ?? null;

    $domaine = Domaine::create([
        'nom_domaine' => $validated['nom_domaine'],
        'date_expiration' => $domainExpiration,
        'client_id' => $validated['client_id'],
        'statut' => 'actif',
    ]);

    $certificatSsl = CertificatSSL::create([
        'domaine_id' => $domaine->id,
        'date_expiration' => $sslExpiration,
        'statut' => 'valide',
    ]);

    return response()->json([
        'success' => true,
        'data' => [
            'domaine' => $domaine,
            'certificat_ssl' => $certificatSsl
        ],
        'meta' => [
            'expiration_source' => $domainExpiration === now()->addYear()->format('Y-m-d') ? 'default' : 'api',
            'domain_checked' => $domain
        ]
    ], 201);
}
private function fetchSSLExpiration(string $domain): ?string
{
    try {
        // Essayer d'abord avec l'API SSL Labs
        $sslExpiration = $this->trySSLLabsApi($domain);
        if ($sslExpiration) {
            return $sslExpiration;
        }

        // Si SSL Labs ne fonctionne pas, essayer une vérification OpenSSL locale
        return $this->tryLocalOpenSSL($domain);
    } catch (\Exception $e) {
        \Log::error("SSL expiration check failed for {$domain}: " . $e->getMessage());
        return null;
    }
}

private function trySSLLabsApi(string $domain): ?string
{
    try {
        $client = new \GuzzleHttp\Client([
            'timeout' => 15,
            'verify' => false
        ]);

        // Analyse initiale
        $response = $client->get("https://api.ssllabs.com/api/v3/analyze", [
            'query' => [
                'host' => $domain,
                'all' => 'done',
                'publish' => 'off'
            ]
        ]);

        $data = json_decode($response->getBody(), true);

        if (isset($data['endpoints'][0]['details']['cert']['notAfter'])) {
            return Carbon::parse($data['endpoints'][0]['details']['cert']['notAfter'])->format('Y-m-d');
        }

        \Log::warning("No SSL expiration found in SSL Labs response for {$domain}");
        return null;
    } catch (\Exception $e) {
        \Log::error("SSL Labs API error for {$domain}: " . $e->getMessage());
        return null;
    }
}

private function tryLocalOpenSSL(string $domain): ?string
{
    try {
        $g = stream_context_create([
            "ssl" => [
                "capture_peer_cert" => true,
                "verify_peer" => false,
                "verify_peer_name" => false,
            ]
        ]);

        $r = stream_socket_client(
            "ssl://{$domain}:443",
            $errno,
            $errstr,
            30,
            STREAM_CLIENT_CONNECT,
            $g
        );

        if (!$r) {
            \Log::warning("Failed to connect to {$domain}:443 for SSL check");
            return null;
        }

        $cont = stream_context_get_params($r);
        $certInfo = openssl_x509_parse($cont["options"]["ssl"]["peer_certificate"]);

        if (isset($certInfo['validTo_time_t'])) {
            return Carbon::createFromTimestamp($certInfo['validTo_time_t'])->format('Y-m-d');
        }
    } catch (\Exception $e) {
        \Log::error("Local SSL check failed for {$domain}: " . $e->getMessage());
    }

    return null;
}


private function normalizeDomain(string $domain): string
{
    $domain = strtolower(trim($domain));
    $domain = preg_replace('/^(https?:\/\/)?(www\.)?/', '', $domain);
    return explode('/', $domain)[0];
}

private function fetchDomainExpiration(string $domain): string
{
    $sources = [
        fn($d) => $this->tryWhoisFreaksApi($d),
        fn($d) => $this->tryLocalWhoisCommand($d)
    ];

    foreach ($sources as $source) {
        if ($expiration = $source($domain)) {
            return $expiration;
        }
    }

    return now()->addYear()->format('Y-m-d');
}

private function tryWhoisFreaksApi(string $domain): ?string
{
    try {
        $client = new \GuzzleHttp\Client([
            'timeout' => 8,
            'verify' => false // Désactive la vérification SSL pour les environnements de test
        ]);

        $response = $client->get('https://api.whoisfreaks.com/v1.0/whois', [
            'query' => [
                'whois' => 'live',
                'domainName' => $domain,
                'apiKey' => '77b87cc71b51481c9cdf91ad67f3edb8'
            ]
        ]);

        $data = json_decode($response->getBody(), true);

        \Log::debug('WhoisFreaks API Response', ['domain' => $domain, 'response' => $data]);

        // Gestion du format JSON spécifique
        if (isset($data['expiry_date'])) {
            return Carbon::parse($data['expiry_date'])->format('Y-m-d');
        }

        if (isset($data['whois_domain_expiry_date'])) {
            return Carbon::parse($data['whois_domain_expiry_date'])->format('Y-m-d');
        }

        // Vérification des formats alternatifs
        $dateKeys = ['expiry_date', 'expiration_date', 'registry_expiry_date', 'expires'];
        foreach ($dateKeys as $key) {
            if (isset($data[$key])) {
                return Carbon::parse($data[$key])->format('Y-m-d');
            }
        }

        \Log::warning('No expiration date found in WhoisFreaks response', ['domain' => $domain]);
    } catch (\Exception $e) {
        \Log::error('WhoisFreaks API error: ' . $e->getMessage(), ['domain' => $domain]);
    }

    return null;
}

private function tryLocalWhoisCommand(string $domain): ?string
{
    try {
        $output = shell_exec("whois $domain");
        
        // Patterns pour détecter la date d'expiration dans la sortie whois
        $patterns = [
            '/expir(y|ation) date:\s+(.+)/i',
            '/registrar registration expiration date:\s+(.+)/i',
            '/expires:\s+(.+)/i',
            '/expire on:\s+(.+)/i'
        ];

        foreach ($patterns as $pattern) {
            if (preg_match($pattern, $output, $matches)) {
                $dateStr = trim($matches[2] ?? $matches[1]);
                return Carbon::parse($dateStr)->format('Y-m-d');
            }
        }
    } catch (\Exception $e) {
        \Log::error('Local whois command failed: ' . $e->getMessage());
    }

    return null;
}
    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $request->validate([
            'nom_domaine' => 'sometimes|required|string|max:255|unique:domaines,nom_domaine,'.$id,
            'date_expiration' => 'sometimes|required|date',
            'statut' => 'sometimes|required|in:actif,inactif,expiré',
        ]);

        $domaine = Domaine::findOrFail($id);
        
        $domaine->update($request->only([
            'nom_domaine',
            'date_expiration',
            'statut'
        ]));

        return response()->json([
            'message' => 'Domaine mis à jour avec succès',
            'data' => $domaine
        ], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        try {
            // Delete the domain where the ID matches
            $deleted = Domaine::where('id', $id)->delete();
    
            if ($deleted) {
                // Return success response
                return response()->json(['message' => 'Domain deleted successfully'], 200);
            } else {
                // Return error response if domain not found
                return response()->json(['message' => 'Domain not found'], 404);
            }
        } catch (\Exception $e) {
            // Handle any errors
            return response()->json(['message' => 'Failed to delete domain', 'error' => $e->getMessage()], 500);
        }
    }


    public function import(Request $request)
    {
        // Validate the input data
        $validator = Validator::make($request->all(), [
            '*.nom_domaine' => 'required|string|unique:domaines,nom_domaine',
            '*.client_id' => 'required|exists:clients,id',
            '*.statut' => 'sometimes|string|in:actif,inactif,expiré',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        $domains = $request->all();
        $imported = [];
        $failed = [];

        foreach ($domains as $domainData) {
            try {
                $domain = $this->normalizeDomain($domainData['nom_domaine']);
                
                // Get domain expiration (try API first, then fallback to whois)
                $domainExpiration = $this->fetchDomainExpiration($domain);
                
                // Get SSL expiration (try API first, then fallback to local check)
                $sslExpiration = $this->fetchSSLExpiration($domain);

                // Create domain record
                $newDomain = Domaine::create([
                    'nom_domaine' => $domainData['nom_domaine'],
                    'client_id' => $domainData['client_id'],
                    'date_expiration' => $domainExpiration,
                    'statut' => $domainData['statut'] ?? 'actif',
                ]);

                // Create SSL certificate record
                $sslCert = CertificatSSL::create([
                    'domaine_id' => $newDomain->id,
                    'date_expiration' => $sslExpiration,
                    'statut' => $sslExpiration ? 'valide' : 'inconnu',
                ]);

                $imported[] = [
                    'domain' => $newDomain,
                    'ssl_cert' => $sslCert,
                    'expiration_source' => [
                        'domain' => $domainExpiration === now()->addYear()->format('Y-m-d') ? 'default' : 'external',
                        'ssl' => $sslExpiration ? 'detected' : 'not_detected'
                    ]
                ];
            } catch (\Exception $e) {
                $failed[] = [
                    'domain' => $domainData['nom_domaine'],
                    'error' => $e->getMessage()
                ];
                Log::error("Domain import failed for {$domainData['nom_domaine']}: " . $e->getMessage());
            }
        }

        return response()->json([
            'message' => 'Import completed',
            'imported_count' => count($imported),
            'failed_count' => count($failed),
            'imported' => $imported,
            'failed' => $failed,
        ], count($failed) === 0 ? 201 : 207); // 207 Multi-Status if some failed
    }
}