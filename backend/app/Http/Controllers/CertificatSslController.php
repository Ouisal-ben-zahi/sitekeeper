<?php

namespace App\Http\Controllers;

use App\Models\CertificatSSL;
use App\Models\Domaine;
use Illuminate\Http\Request;

class CertificatSslController extends Controller
{
    /**
     * Affiche la liste des certificats SSL.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        $certificatsSsl = CertificatSSL::all();
        $domaines=Domaine::all();
        return response()->json(["certificatsSsl" => $certificatsSsl,"domaines" => $domaines]);
    }

    /**
     * Affiche le formulaire de création d'un certificat SSL.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        // Retourne une vue pour créer un nouveau certificat SSL
    }

    /**
     * Enregistre un nouveau certificat SSL.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $request->validate([
            'domaine_id' => 'required|exists:domaines,id',
            'date_expiration' => 'required|date',
            'statut' => 'required|in:valide,expiré',
        ]);

        $certificatSsl = CertificatSSL::create($request->all());
        return response()->json(["certificatSsl" => $certificatSsl], 201);
    }

    /**
     * Affiche les détails d'un certificat SSL spécifique.
     *
     * @param  string  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(string $id)
    {
        $certificatSsl = CertificatSSL::findOrFail($id);
        return response()->json(["certificatSsl" => $certificatSsl]);
    }

    /**
     * Affiche le formulaire d'édition d'un certificat SSL.
     *
     * @param  string  $id
     * @return \Illuminate\Http\Response
     */
    public function edit(string $id)
    {
        // Retourne une vue pour éditer un certificat SSL
    }

    /**
     * Met à jour un certificat SSL spécifique.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  string  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, string $id)
    {
        $request->validate([
            'domaine_id' => 'sometimes|exists:domaines,id',
            'date_expiration' => 'sometimes|date',
            'statut' => 'sometimes|in:valide,expiré',
        ]);

        $certificatSsl = CertificatSSL::findOrFail($id);
        $certificatSsl->update($request->all());
        return response()->json(["certificatSsl" => $certificatSsl]);
    }

    /**
     * Supprime un certificat SSL spécifique.
     *
     * @param  string  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy(string $id)
    {
        $certificatSsl = CertificatSSL::findOrFail($id);
        $certificatSsl->delete();
        return response()->json(null, 204);
    }
}