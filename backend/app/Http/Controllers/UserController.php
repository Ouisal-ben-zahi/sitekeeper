<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User; 

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $users = User::all();
        return response()->json(["users" => $users]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        // Généralement, cette méthode est utilisée pour retourner une vue de formulaire de création.
        // Dans une API, cette méthode peut ne pas être nécessaire.
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // Validation des données
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'telephone' => 'nullable|string|max:20',
            'adresse' => 'nullable|string|max:255',
            'role' => 'nullable|string|max:50',
            'client_id' => 'nullable|exists:clients,id',
        ]);

        // Création de l'utilisateur
        $user = User::create([
            'name' => $validatedData['name'],
            'email' => $validatedData['email'],
            'password' => bcrypt($validatedData['password']),
            'telephone' => $validatedData['telephone'],
            'adresse' => $validatedData['adresse'],
            'role' => $validatedData['role'],
            'client_id' => $validatedData['client_id'],
        ]);

        return response()->json(['user' => $user], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $user = User::findOrFail($id);
        return response()->json(['user' => $user]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        // Généralement, cette méthode est utilisée pour retourner une vue de formulaire d'édition.
        // Dans une API, cette méthode peut ne pas être nécessaire.
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        // Validation des données
        $validatedData = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|string|email|max:255|unique:users,email,' . $id,
            'password' => 'sometimes|string|min:8',
            'telephone' => 'nullable|string|max:20',
            'adresse' => 'nullable|string|max:255',
            'role' => 'nullable|string|max:50',
            'client_id' => 'nullable|exists:clients,id',
        ]);

        // Recherche de l'utilisateur
        $user = User::findOrFail($id);

        // Mise à jour de l'utilisateur
        if (isset($validatedData['password'])) {
            $validatedData['password'] = bcrypt($validatedData['password']);
        }

        $user->update($validatedData);

        return response()->json(['user' => $user]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $user = User::findOrFail($id);
        $user->delete();

        return response()->json(['message' => 'User deleted successfully']);
    }
}