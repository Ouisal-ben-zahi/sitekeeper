<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Technologie extends Model
{
    use HasFactory;
    protected $table = 'technologies';

    protected $fillable = ['domaine_id', 'nom_technologie', 'version', 'statut'];
    
    public function domaine()
    {
        return $this->belongsTo(Domaine::class);
    }
}