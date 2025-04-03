<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CertificatSSL extends Model
{
    use HasFactory;
    protected $table = 'certificats_ssl';
    /**
     * Les attributs qui sont mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'domaine_id', // ID du domaine associé
        'date_expiration', // Date d'expiration du certificat
        'statut', // Statut du certificat (valide/expiré)
    ];
}