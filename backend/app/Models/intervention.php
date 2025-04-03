<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class intervention extends Model
{
    use HasFactory;
    protected $fillable = ['domaine_id', 'technicien_id', 'description', 'statut', 'date_debut', 'date_fin'];
    
    public function domaine()
    {
        return $this->belongsTo(Domaine::class);
    }
    
    public function technicien()
    {
        return $this->belongsTo(User::class, 'technicien_id');
    }
}
