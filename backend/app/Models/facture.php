<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class facture extends Model
{
    use HasFactory;
    protected $fillable = ['client_id', 'intervention_id', 'montant', 'statut_paiement', 'date_emission', 'date_paiement'];
    
    public function client()
    {
        return $this->belongsTo(Client::class);
    }
    
    public function intervention()
    {
        return $this->belongsTo(Intervention::class);
    }}
