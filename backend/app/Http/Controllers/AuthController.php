<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class AuthController extends Controller
{

public function register(Request $request)
{
    // Validation des champs
    $fields = $request->validate([
        'name' => 'required|string|max:255',
        'email' => 'required|email|unique:users',
        'password' => 'required|min:8|confirmed',
        'telephone' => 'nullable|string|max:20',
        'adresse' => 'nullable|string',
        'role' => 'required|in:admin,technicien,client',
        'client_id' => 'nullable|exists:clients,id',
    ]);

    // Création de l'utilisateur
    $user = User::create([
        'name' => $fields['name'],
        'email' => $fields['email'],
        'telephone' => $fields['telephone'] ?? null,
        'adresse' => $fields['adresse'] ?? null,
        'role' => $fields['role'],
        'client_id' => $fields['client_id'] ?? null,
        'password' => Hash::make($fields['password']), // Hash du mot de passe
    ]);

    // Génération du token (si Laravel Sanctum est utilisé)
    $token = $user->createToken('authToken')->plainTextToken;

    // Réponse JSON avec l'utilisateur créé et son token
    return response()->json([
        'message' => 'User created successfully',
        'user' => [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'telephone' => $user->telephone,
            'adresse' => $user->adresse,
            'role' => $user->role,
            'client_id' => $user->client_id,
        ],
        'token' => $token
    ], 201);
}


public function login(Request $request)
{
    // Validation des données envoyées
    $fields = $request->validate([
        'email' => 'required|email|exists:users,email',
        'password' => 'required|string',
    ]);

    // Recherche de l'utilisateur avec l'email donné
    $user = User::where('email', $request->email)->first();

    // Vérification si l'utilisateur existe et si le mot de passe est correct
    if (!$user || !Hash::check($request->password, $user->password)) {
        return response()->json(['error' => 'Identifiants invalides'], 401);
    }

    // Création du token
    $token = $user->createToken('authToken')->plainTextToken;

    // Réponse JSON avec le token et les informations utilisateur
    return response()->json([
        'token' => $token,
        'user' => [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role // Assurez-vous que la colonne 'role' existe dans la table users
        ]
    ], 200);
}

// Dans le contrôleur AuthController
public function logout(Request $request)
{
    // Supprimer le token de l'utilisateur actuel
    $request->user()->currentAccessToken()->delete();

    // Retourner une réponse indiquant que l'utilisateur a été déconnecté
    return response()->json(['message' => 'User logged out successfully'], 200);
}

}
