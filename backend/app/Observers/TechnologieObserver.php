<?php

namespace App\Observers;

use App\Models\Technologie;
use App\Models\DomaineHistory;

class TechnologieObserver
{
    /**
     * Handle the Technologie "created" event.
     */
    public function created(Technologie $technologie): void
    {
        DomaineHistory::create([
            'domaine_id' => $technologie->domaine_id,
            'action' => 'technology_detection',
            'old_value' => null,
            'new_value' => null,
            'old_technology_name' => null,
            'old_technology_version' => null,
            'technology_name' => $technologie->nom_technologie,
            'technology_version' => $technologie->version,
        ]);
    }

    /**
     * Handle the Technologie "updated" event.
     */
    public function updated(Technologie $technologie): void
    {
        // Vérifier si le nom ou la version a changé
        if ($technologie->isDirty('nom_technologie') || $technologie->isDirty('version')) {
            $oldName = $technologie->getOriginal('nom_technologie');
            $oldVersion = $technologie->getOriginal('version');
            $newName = $technologie->nom_technologie;
            $newVersion = $technologie->version;

            DomaineHistory::create([
                'domaine_id' => $technologie->domaine_id,
                'action' => 'technology_change',
                'old_value' => null,
                'new_value' =>null,
                'old_technology_name' => $oldName,
                'old_technology_version' => $oldVersion,
                'technology_name' => $newName,
                'technology_version' => $newVersion,
            ]);
        }
    }

    /**
     * Handle the Technologie "deleted" event.
     */
    public function deleted(Technologie $technologie): void
    {
        DomaineHistory::create([
            'domaine_id' => $technologie->domaine_id,
            'action' => 'technology_deletion',
            'old_value' => null,
            'new_value' => null,
            'old_technology_name' => $technologie->nom_technologie,
            'old_technology_version' => $technologie->version,
            'technology_name' => null,
            'technology_version' => null,
        ]);
    }
}