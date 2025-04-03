<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\ContratMaintenance;
use Carbon\Carbon;

class CheckContractStatus extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'contract:check-status';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Vérifie les contrats de maintenance et met à jour leur statut en fonction de la date de fin.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        // Boucle infinie pour exécuter la vérification chaque jour
        while (true) {
            // Obtenir la date actuelle
            $now = Carbon::now();

            // Obtenir la fin du mois courant
            $endOfMonth = $now->copy()->endOfMonth();

            // Récupérer les contrats actifs
            $contrats = ContratMaintenance::where('statut', 'actif')->get();

            foreach ($contrats as $contrat) {
                // Vérifier si la date de fin du contrat est dépassée
                if ($contrat->date_fin <= $now) {
                    $contrat->statut = 'expiré';
                    $contrat->save();
                    $this->info("Contrat ID {$contrat->id} : Statut mis à jour à 'expiré'.");
                }
                // Vérifier si la date de fin du contrat est à la fin du mois courant
                elseif ($contrat->date_fin <= $endOfMonth) {
                    $contrat->statut = 'inactif';
                    $contrat->save();
                    $this->info("Contrat ID {$contrat->id} : Statut mis à jour à 'inactif' (fin du mois approchante).");
                }
            }

            $this->info('Vérification des contrats terminée pour le ' . $now->toDateString() . '.');

        }
    }
}