<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\CertificatSSL;
use Carbon\Carbon;

class CheckSSLExpiration extends Command
{
    /**
     * Le nom et la signature de la commande.
     *
     * @var string
     */
    protected $signature = 'ssl:check-expiration';

    /**
     * La description de la commande.
     *
     * @var string
     */
    protected $description = 'Vérifie les certificats SSL expirés et met à jour leur statut.';

    /**
     * Exécuter la commande.
     *
     * @return int
     */
    public function handle()
    {
        while (true) {
        // Récupérer la date actuelle
        $now = Carbon::now();

        // Récupérer tous les certificats SSL qui ne sont pas encore marqués comme expirés
        $certificats = CertificatSSL::where('statut', '!=', 'expiré')->get();

        foreach ($certificats as $certificat) {
            // Vérifier si la date d'expiration est passée
            if ($now->greaterThan($certificat->date_expiration)) {
                // Mettre à jour le statut du certificat
                $certificat->statut = 'expiré';
                $certificat->save();

                $this->info("Le certificat pour le domaine {$certificat->domaine_id} a expiré et a été marqué comme expiré.");
            }
        }

        $this->info('Vérification des certificats SSL expirés terminée.');

    }
    }
}