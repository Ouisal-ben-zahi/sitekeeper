<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class notification extends Model
{
    use HasFactory;
    protected $fillable = ['client_id', 'message', 'type'];
    
    public function client()
    {
        return $this->belongsTo(Client::class);
    }
}
