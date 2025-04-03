<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $table = 'users'; // Nom de la table

    protected $fillable = [
        'name',
        'email',
        'telephone',
        'adresse',
        'role',
        'client_id',
        'password',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    // Relation avec Client (Un utilisateur peut être associé à un client)
    public function client()
    {
        return $this->belongsTo(Client::class);
    }
    public function getJWTIdentifier()
    {
        return $this->getKey(); // The unique identifier for the user (typically the id)
    }
    public function getJWTCustomClaims()
    {
        return []; // You can add custom claims if needed, like user roles, etc.
    }}