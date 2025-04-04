<?php

namespace App\Observers;

use App\Models\Domaine;
use App\Models\DomaineHistory;
use Illuminate\Support\Facades\Auth;

class DomaineObserver
{
    /**
     * Gère l'événement "updated" du modèle Domaine.
     */
    public function updated(Domaine $domaine)
    {
        // Vérifie si le statut a changé
        if ($domaine->isDirty('statut')) {
            $this->logStatusChange($domaine);
        }
    }

    /**
     * Enregistre le changement de statut dans l'historique.
     */
    protected function logStatusChange(Domaine $domaine)
{
    $userId = Auth::id();
    
    // Si pas d'utilisateur authentifié, c'est une action système
    $action = $userId ? 'status_change' : 'status_change';
    
    DomaineHistory::create([
        'domaine_id' => $domaine->id,
        'action' => $action,
        'old_value' => $domaine->getOriginal('statut'),
        'new_value' => $domaine->statut,
        'user_id' => $userId,
    ]);
}

    /**
     * Gère l'événement "created" du modèle Domaine.
     */
    public function created(Domaine $domaine)
    {
        DomaineHistory::create([
            'domaine_id' => $domaine->id,
            'action' => 'creation',
            'new_value' => $domaine->statut,
            'user_id' => Auth::id() ?? null,
        ]);
    }
}