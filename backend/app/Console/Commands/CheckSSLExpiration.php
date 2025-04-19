<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\CertificatSSL;
use App\Models\Domaine;
use Carbon\Carbon;
use GuzzleHttp\Client as GuzzleClient;
use Illuminate\Support\Facades\Log;

class CheckSSLExpiration extends Command
{
    protected $signature = 'ssl:check-expiring';
    protected $description = 'Vérifie les certificats SSL expirés ou expirant dans moins d\'une semaine';

    public function handle()
    {
        $now = Carbon::now();
        $threshold = $now->copy()->addWeek();

        // Récupérer les certificats avec la relation domaine
        $certificats = CertificatSSL::with('domaine')
            ->where(function($query) use ($now, $threshold) {
                $query->where('date_expiration', '<=', $threshold)
                      ->orWhereNull('date_expiration');
            })
            ->where('statut', '!=', 'expiré')
            ->get();

        foreach ($certificats as $certificat) {
            try {
                // Vérifier si la relation domaine existe
                if (!$certificat->domaine) {
                    $this->error("Domaine non trouvé pour le certificat ID: {$certificat->id}");
                    continue;
                }

                $domain = $certificat->domaine->nom_domaine;
                $this->info("Vérification du domaine: {$domain}");

                $apiExpiration = $this->fetchSSLExpiration($domain);
                
                if (!$apiExpiration) {
                    $this->warn("Impossible de récupérer la date d'expiration pour {$domain}");
                    continue;
                }

                $apiExpirationDate = Carbon::parse($apiExpiration);
                $certificat->date_expiration = $apiExpiration;

                if ($now->greaterThan($apiExpirationDate)) {
                    $certificat->statut = 'expiré';
                    $this->warn("CERTIFICAT EXPIRÉ: {$domain} (expiré le {$apiExpiration})");
                } elseif ($apiExpirationDate->lessThanOrEqualTo($threshold)) {
                    $certificat->statut = 'à renouveler';
                    $this->warn("CERTIFICAT À RENOUVELER: {$domain} (expire le {$apiExpiration})");
                } else {
                    $certificat->statut = 'valide';
                    $this->info("Certificat valide: {$domain} (expire le {$apiExpiration})");
                }

                $certificat->save();

            } catch (\Exception $e) {
                Log::error("Erreur SSL pour le certificat ID {$certificat->id}: " . $e->getMessage());
                $this->error("Erreur: " . $e->getMessage());
            }
        }

        $this->info('Vérification terminée.');
        return 0;
    }

    private function fetchSSLExpiration(string $domain): ?string
    {
        try {
            // Essayer d'abord avec l'API SSL Labs
            $sslExpiration = $this->trySSLLabsApi($domain);
            if ($sslExpiration) {
                return $sslExpiration;
            }

            // Fallback local
            return $this->tryLocalOpenSSL($domain);
        } catch (\Exception $e) {
            Log::error("Échec vérification SSL pour {$domain}: " . $e->getMessage());
            return null;
        }
    }

    private function trySSLLabsApi(string $domain): ?string
    {
        try {
            $client = new GuzzleClient(['timeout' => 15, 'verify' => false]);
            $normalizedDomain = $this->normalizeDomain($domain);

            $response = $client->get("https://api.ssllabs.com/api/v3/analyze", [
                'query' => [
                    'host' => $normalizedDomain,
                    'all' => 'done',
                    'publish' => 'off'
                ]
            ]);

            $data = json_decode($response->getBody(), true);

            if (isset($data['endpoints'][0]['details']['cert']['notAfter'])) {
                return Carbon::parse($data['endpoints'][0]['details']['cert']['notAfter'])->format('Y-m-d');
            }

            return null;
        } catch (\Exception $e) {
            Log::error("API SSL Labs erreur pour {$domain}: " . $e->getMessage());
            return null;
        }
    }

    private function tryLocalOpenSSL(string $domain): ?string
    {
        try {
            $context = stream_context_create([
                "ssl" => [
                    "capture_peer_cert" => true,
                    "verify_peer" => false,
                    "verify_peer_name" => false,
                ]
            ]);

            $socket = @stream_socket_client(
                "ssl://{$domain}:443",
                $errno,
                $errstr,
                30,
                STREAM_CLIENT_CONNECT,
                $context
            );

            if (!$socket) {
                return null;
            }

            $params = stream_context_get_params($socket);
            $certInfo = openssl_x509_parse($params["options"]["ssl"]["peer_certificate"]);

            return isset($certInfo['validTo_time_t'])
                ? Carbon::createFromTimestamp($certInfo['validTo_time_t'])->format('Y-m-d')
                : null;
        } catch (\Exception $e) {
            Log::error("Vérification SSL locale échouée pour {$domain}: " . $e->getMessage());
            return null;
        }
    }

    private function normalizeDomain(string $domain): string
    {
        $domain = strtolower(trim($domain));
        $domain = preg_replace('/^(https?:\/\/)?(www\.)?/', '', $domain);
        return explode('/', $domain)[0];
    }
}