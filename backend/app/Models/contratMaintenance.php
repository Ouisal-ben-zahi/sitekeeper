<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ContratMaintenance extends Model
{
    use HasFactory;
    protected $fillable = ['client_id', 'date_debut', 'date_fin', 'statut'];
    
    public function client()
    {
        return $this->belongsTo(Client::class);
    }
}
