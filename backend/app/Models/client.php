<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class client extends Model
{
    /** @use HasFactory<\Database\Factories\ClientFactory> */
    use HasFactory;
    protected $table = 'clients'; // Nom de la table dans la base de données

    protected $fillable = [
        'nom_entreprise',
        'ice',
        'ville',
        'code_postal',
        'nom_responsable',
        'tel_responsable',
        'email_responsable',
    ];}
