<?php

namespace App\Http\Controllers;
use App\Models\Technologie;
use Illuminate\Http\Request;

class TechnologieController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $technologies= Technologie::all();
        return response()->json(["technologies" => $technologies]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
{
    $request->validate([
        'domaine_id' => 'required|exists:domaines,id',
        'nom_technologie' => 'required|string|max:255',
        'version' => 'nullable|string|max:50',
        'statut' => 'required|in:à jour,obsolète,vulnérable',
    ]);

    try {
        $technologie = Technologie::create([
            'domaine_id' => $request->domaine_id,
            'nom_technologie' => $request->nom_technologie,
            'version' => $request->version,
            'statut' => $request->statut,
        ]);

        return response()->json(['message' => 'Technologie créée avec succès', 'data' => $technologie], 201);
    } catch (\Exception $e) {
        return response()->json(['message' => 'Erreur lors de la création de la technologie', 'error' => $e->getMessage()], 500);
    }
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
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
