<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DomaineHistory extends Model
{
    protected $table = 'domaine_history';
    
    protected $fillable = [
    'domaine_id',
    'action',
    'old_value',
    'new_value',
    'technology_name',
    'technology_version',
];

public function domaine()
{
    return $this->belongsTo(Domaine::class);
}

public function user()
{
    return $this->belongsTo(User::class);
}
}
