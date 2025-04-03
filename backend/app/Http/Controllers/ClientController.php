<?php

namespace App\Http\Controllers;

use App\Models\Client;
use Illuminate\Http\Request;

class ClientController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $clients = Client::all();
        return response()->json(['success' => true, 'clients' => $clients], 200);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // Validation des données reçues
        $validatedData = $request->validate([
            'nom_entreprise' => 'required|max:255',
            'ice' => 'required|max:255|unique:clients,ice', // ICE doit être unique
            'ville' => 'required|max:255',
            'code_postal' => 'required|max:255',
            'nom_responsable' => 'required|max:255',
            'tel_responsable' => 'required|max:255',
            'email_responsable' => 'required|email|max:255',
        ]);

        // Création du client
        $client = Client::create($validatedData);

        // Retourner la réponse JSON
        return response()->json(['success' => true, 'client' => $client], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Client $client)
    {
        return response()->json(['success' => true, 'client' => $client], 200);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Client $client)
    {
        // Validation des données reçues
        $validatedData = $request->validate([
            'nom_entreprise' => 'required|string|max:255',
            'ice' => 'required|string|max:255|unique:clients,ice,' . $client->id,
            'ville' => 'required|string|max:255',
            'code_postal' => 'required|string|max:255',
            'nom_responsable' => 'required|string|max:255',
            'tel_responsable' => 'required|string|max:255',
            'email_responsable' => 'required|email|max:255',
        ], [
            'required' => 'Le champ :attribute est obligatoire.',
            'email' => 'L\'email doit être une adresse valide.',
            'unique' => 'Cette valeur est déjà utilisée pour un autre client.'
        ]);
    
        // Mise à jour du client
        $client->update($validatedData);
    
        return response()->json([
            'success' => true,
            'message' => 'Client mis à jour avec succès',
            'client' => $client
        ], 200);
    }
    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Client $client)
    {
        $client->delete();
        return response()->json(['success' => true, 'message' => 'Client supprimé avec succès'], 200);
    }
}