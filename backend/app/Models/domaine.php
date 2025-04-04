<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class domaine extends Model
{
    use HasFactory;
    protected $fillable = ['client_id', 'nom_domaine', 'date_expiration', 'statut'];
    
    public function client()
    {
        return $this->belongsTo(Client::class);
    }
    public function history()
{
    return $this->hasMany(DomaineHistory::class);
}
}
