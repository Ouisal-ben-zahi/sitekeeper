<?php

namespace App\Http\Controllers;
use App\Models\Domaine;
use App\Models\Client;
use App\Models\CertificatSSL;
use App\Models\ContratMaintenance;
use Illuminate\Http\Request;
use Illuminate\Http\Technologie;
use Illuminate\Support\Facades\Validator;
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
        // Validation des données
        $request->validate([
            'nom_domaine' => 'required|string|max:255|unique:domaines,nom_domaine', // Assure que le nom de domaine est unique
            'date_expiration' => 'required|date', // Validation de la date
            'statut' => 'required|in:actif,inactif,expiré', // Validation de l'enum
            'client_id' => 'required|exists:clients,id', // Vérifie que le client existe
            'date_expirationSsl' => 'required|date|after_or_equal:today', // Validation de la date d'expiration du certificat SSL

    ]);    
        // Création du domaine
        $domaine = Domaine::create([
            'nom_domaine' => $request->nom_domaine, // Correction du nom du champ
            'date_expiration' => $request->date_expiration, // Correction du nom du champ
            'statut' => 'actif', // Correction du nom du champ
            'client_id' => $request->client_id,
        ]);
        // Création du certificat SSL
        $certificatSsl = CertificatSSL::create([
            'domaine_id' => $domaine->id,
            'date_expiration' => $request->date_expirationSsl,
            'statut' => 'valide',
        ]);
        
        
          // Retourner une réponse JSON
        return response()->json(['domaine' => $domaine, 'message' => 'Domaine créé avec succès'], 201);
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
        // Valider les données reçues
        $validator = Validator::make($request->all(), [
            '*.nom_domaine' => 'required|string|unique:domaines,nom_domaine',
            '*.client_id' => 'required|exists:clients,id', // Vérifie que le client existe
            '*.date_expiration' => 'required|date',
            '*.date_expirationSsl' => 'required|date',
            '*.statut' => 'sometimes|string|in:actif,inactif,expiré', // Optionnel
        ]);
    
        if ($validator->fails()) {
            return response()->json([
                'message' => 'Erreur de validation',
                'errors' => $validator->errors(),
            ], 422); // Code HTTP 422 : Unprocessable Entity
        }
    
        // Récupérer les données validées
        $domaines = $request->all();
    
        // Enregistrer les domaines dans la base de données
        try {
            foreach ($domaines as $domaine) {
                // Création du domaine
                $nouveauDomaine = Domaine::create([
                    'nom_domaine' => $domaine['nom_domaine'],
                    'client_id' => $domaine['client_id'],
                    'date_expiration' => $domaine['date_expiration'],
                    'statut' => $domaine['statut'] ?? 'actif', // Par défaut "actif"
                ]);
    
                // Création du certificat SSL
                CertificatSSL::create([
                    'domaine_id' => $nouveauDomaine->id,
                    'date_expiration' => $domaine['date_expirationSsl'],
                    'statut' => 'valide',
                ]);
    
                
            }
    
            return response()->json([
                'message' => 'Domaines importés avec succès',
                'count' => count($domaines),
            ], 201); // Code HTTP 201 : Created
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de l\'importation des domaines',
                'error' => $e->getMessage(),
            ], 500); // Code HTTP 500 : Internal Server Error
        }
    }
}