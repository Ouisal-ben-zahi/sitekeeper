<?php

namespace App\Console\Commands;

use App\Models\Domaine;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use GuzzleHttp\Exception\RequestException;

class CheckDomainName extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'domain:check-status';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Check the status of domains and update their status in the database.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        Log::info('Début de la vérification des domaines.');

        Domaine::chunk(50, function ($domaines) {
            foreach ($domaines as $domaine) {
                // Sauvegarder l'ancien statut avant de le modifier
                $previousStatus = $domaine->statut;

                try {
                    // Vérifier le statut du domaine
                    $response = Http::timeout(10)
                        ->withOptions([
                            'allow_redirects' => true,
                            'verify' => false, // Désactiver temporairement la vérification SSL
                        ])
                        ->get("https://" . $domaine->nom_domaine);

                    // Mettre à jour le statut du domaine
                    $domaine->statut = $response->successful() ? "actif" : "inactif";
                } catch (RequestException $e) {
                    Log::error("HTTP error checking domain {$domaine->nom_domaine}: " . $e->getMessage());
                    $domaine->statut = "inactif";
                } catch (\Exception $e) {
                    Log::error("Error checking domain {$domaine->nom_domaine}: " . $e->getMessage());
                    $domaine->statut = "inactif";
                }

                // Sauvegarder le statut du domaine
                $domaine->save();

                
            }
        });

        Log::info('Fin de la vérification des domaines.');
        $this->info('Domain status check completed.');
    }
}