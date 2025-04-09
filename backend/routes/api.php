<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DomainController;
use App\Http\Controllers\TechnologieController;
use App\Http\Controllers\CertificatSslController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\DomaineHistoryController;
use Illuminate\Support\Facades\Artisan;



// Route par défaut
Route::get('/', function () {
    return 'API';
});

// Routes des clients avec apiResource
Route::apiResource('users', UserController::class);
Route::apiResource('clients', ClientController::class);
Route::apiResource('domaines', DomainController::class);
Route::apiResource('technologies', TechnologieController::class);
Route::apiResource('certificatSsl', CertificatSslController::class);
Route::post('/domaines/import', [DomainController::class,"import"]);
Route::apiResource('history', DomaineHistoryController::class);

// Routes pour l'authentification
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return response()->json([
        'id' => $request->user()->id,
        'name' => $request->user()->name,
        'email' => $request->user()->email,
        'role' => $request->user()->role,
    ]);
});





Route::post('/run-detect-technologies', function () {
    try {
        $exitCode = Artisan::call('domain:detect-technologies', [
            '--all' => true,
        ]);
        
        return response()->json([
            'success' => $exitCode === 0,
            'message' => $exitCode === 0 ? 'Commande exécutée avec succès !' : 'Erreur lors de l\'exécution de la commande',
            'output' => Artisan::output(),
        ]);
        
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => "Erreur lors de l'exécution de la commande",
            'error' => $e->getMessage()
        ], 500);
    }
});

Route::post('/run-detect-technologies/{domaine_id}', function ($domaine_id) {
    try {
        $exitCode = Artisan::call('domain:detect-technologies', [
            'domaine_id' => $domaine_id
        ]);
        
        return response()->json([
            'success' => $exitCode === 0,
            'message' => $exitCode === 0 
                ? "Détection des technologies exécutée pour le domaine ID: $domaine_id" 
                : "Erreur lors du traitement du domaine ID: $domaine_id",
            'output' => Artisan::output(),
        ]);
        
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => "Erreur lors de l'exécution de la commande",
            'error' => $e->getMessage()
        ], 500);
    }
});



Route::post('/run-detect-statusDomain', function () {
    try {
        $exitCode = Artisan::call('domain:check-status');
        
        return response()->json([
            'success' => $exitCode === 0,
            'message' => $exitCode === 0 ? 'Commande exécutée avec succès !' : 'Erreur lors de l\'exécution de la commande',
            'output' => Artisan::output(),
        ]);
        
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => "Erreur lors de l'exécution de la commande",
            'error' => $e->getMessage()
        ], 500);
    }
});
