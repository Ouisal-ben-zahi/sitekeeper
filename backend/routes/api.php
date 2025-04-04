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
