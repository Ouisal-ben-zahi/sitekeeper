<?php

namespace App\Console\Commands;

use App\Models\Domaine;
use App\Models\User;
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

    // ID d'un utilisateur système ou null
    $systemUserId = optional(User::where('email', 'system@domain.com')->first())->id;

    Domaine::chunk(50, function ($domaines) use ($systemUserId) {
        foreach ($domaines as $domaine) {
            $previousStatus = $domaine->statut;

            try {
                $response = Http::timeout(10)
                    ->withOptions([
                        'allow_redirects' => true,
                        'verify' => false,
                    ])
                    ->get("https://" . $domaine->nom_domaine);

                $newStatus = $response->successful() ? "actif" : "inactif";
                
                // Ne sauvegarder que si le statut a changé
                if ($newStatus !== $previousStatus) {
                    $domaine->statut = $newStatus;
                    $domaine->save();
                }

            } catch (RequestException $e) {
                Log::error("HTTP error checking domain {$domaine->nom_domaine}: " . $e->getMessage());
                if ("inactif" !== $previousStatus) {
                    $domaine->statut = "inactif";
                    $domaine->save();
                }
            } catch (\Exception $e) {
                Log::error("Error checking domain {$domaine->nom_domaine}: " . $e->getMessage());
                if ("inactif" !== $previousStatus) {
                    $domaine->statut = "inactif";
                    $domaine->save();
                }
            }
        }
    });

    Log::info('Fin de la vérification des domaines.');
    $this->info('Domain status check completed.');
}
}