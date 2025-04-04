<?php

namespace App\Http\Controllers;

use App\Models\DomaineHistory;
use Illuminate\Http\Request;

class DomaineHistoryController extends Controller
{
    public function index()
    {
        $history = DomaineHistory::with(['domaine', 'user'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'history' => $history,
            'message' => 'Historique récupéré avec succès'
        ]);
    }

    public function show($id)
    {
        $history = DomaineHistory::with(['domaine', 'user'])
            ->where('domaine_id', $id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'history' => $history,
            'message' => 'Historique du domaine récupéré avec succès'
        ]);
    }
}