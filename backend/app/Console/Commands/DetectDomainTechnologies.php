<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Domaine;
use App\Models\Technologie;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\RequestException;

class DetectDomainTechnologies extends Command
{
    protected $signature = 'domain:detect-technologies {domaine_id?} {--all}';
    protected $description = 'Détecte les technologies utilisées sur un domaine ou tous les domaines';

    public function handle()
    {
        if ($this->option('all')) {
            $domaines = Domaine::all();
            
            if ($domaines->isEmpty()) {
                $this->error("Aucun domaine trouvé dans la base de données.");
                return;
            }

            foreach ($domaines as $domaine) {
                $this->processDomaine($domaine->id);
            }

            $this->info("Tous les domaines ont été traités avec succès.");
        } else {
            $domaineId = $this->argument('domaine_id');

            if (!$domaineId) {
                $this->error("Veuillez spécifier un ID de domaine ou utiliser l'option --all.");
                return;
            }

            $this->processDomaine($domaineId);
        }
    }

    protected function processDomaine($domaineId)
    {
        $domaine = Domaine::find($domaineId);

        if (!$domaine) {
            $this->error("Domaine introuvable avec l'ID : $domaineId");
            return;
        }

        $this->info("Détection des technologies pour le domaine : {$domaine->nom_domaine}");

        $htmlContent = $this->fetchHtmlContent($domaine->nom_domaine);

        if (!$htmlContent) {
            $this->error("Impossible de récupérer le contenu du site.");
            return;
        }

        $technologies = $this->detectTechnologies($htmlContent);

        if (empty($technologies)) {
            $this->error("Aucune technologie détectée pour ce domaine.");
            return;
        }

        $this->updateTechnologies($domaine, $technologies);
        $this->info("Technologies détectées et enregistrées avec succès pour le domaine : {$domaine->nom_domaine}");
    }

    protected function updateTechnologies($domaine, $technologies)
    {
        $existingTechnologies = Technologie::where('domaine_id', $domaine->id)->get();

        if ($existingTechnologies->isEmpty()) {
            foreach ($technologies as $tech) {
                Technologie::create([
                    'domaine_id' => $domaine->id,
                    'nom_technologie' => $tech['name'],
                    'version' => $tech['version'] ?? 'Inconnue',
                    'statut' => 'à jour',
                ]);
            }
        } else {
            foreach ($technologies as $tech) {
                $existingTech = $existingTechnologies->where('nom_technologie', $tech['name'])->first();

                if ($existingTech) {
                    $existingTech->update([
                        'version' => $tech['version'] ?? 'Inconnue',
                        'statut' => 'à jour',
                    ]);
                } else {
                    Technologie::create([
                        'domaine_id' => $domaine->id,
                        'nom_technologie' => $tech['name'],
                        'version' => $tech['version'] ?? 'Inconnue',
                        'statut' => 'à jour',
                    ]);
                }
            }
        }
    }

    protected function fetchHtmlContent($domain)
    {
        $client = new Client();

        try {
            $response = $client->get("https://$domain", [
                'verify' => false,
                'headers' => [
                    'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
                ],
                'timeout' => 10,
                'allow_redirects' => true,
            ]);
            return $response->getBody()->getContents();
        } catch (RequestException $e) {
            if ($e->getResponse() && $e->getResponse()->getStatusCode() === 403) {
                $this->error("Erreur 403 : Accès refusé. Le serveur a bloqué la requête.");
            } else {
                $this->error("Erreur lors de la récupération du contenu du site : " . $e->getMessage());
            }
            return null;
        }
    }

    protected function detectTechnologies($htmlContent)
    {
        $technologies = [];
        $technologies = array_merge($technologies, $this->detectFrontendTechnologies($htmlContent));
        $technologies = array_merge($technologies, $this->detectBackendTechnologies($htmlContent));
        return $technologies;
    }

    protected function detectFrontendTechnologies($htmlContent)
    {
        $technologies = [];

        if (strpos($htmlContent, 'wp-content') !== false) {
            $technologies[] = ['name' => 'WordPress', 'version' => $this->detectWordPressVersion($htmlContent)];
        }

        if (strpos($htmlContent, 'jquery') !== false) {
            $technologies[] = ['name' => 'jQuery', 'version' => $this->detectJqueryVersion($htmlContent)];
        }

        if (strpos($htmlContent, 'bootstrap') !== false) {
            $technologies[] = ['name' => 'Bootstrap', 'version' => $this->detectBootstrapVersion($htmlContent)];
        }

        if (strpos($htmlContent, 'tailwind') !== false || strpos($htmlContent, 'tailwindcss') !== false) {
            $technologies[] = ['name' => 'Tailwind CSS', 'version' => 'Inconnue'];
        }

        if (strpos($htmlContent, 'react') !== false || strpos($htmlContent, 'ReactDOM') !== false) {
            $technologies[] = ['name' => 'React', 'version' => 'Inconnue'];
        }

        if (strpos($htmlContent, 'vue') !== false || strpos($htmlContent, 'Vue.js') !== false) {
            $technologies[] = ['name' => 'Vue.js', 'version' => 'Inconnue'];
        }

        if (strpos($htmlContent, 'angular') !== false || strpos($htmlContent, 'ng-') !== false) {
            $technologies[] = ['name' => 'Angular', 'version' => 'Inconnue'];
        }

        if (strpos($htmlContent, '<html') !== false || strpos($htmlContent, '<!DOCTYPE html>') !== false) {
            $technologies[] = ['name' => 'HTML', 'version' => 'Inconnue'];
        }

        if (strpos($htmlContent, '<script') !== false || strpos($htmlContent, '.js') !== false) {
            $technologies[] = ['name' => 'JavaScript', 'version' => 'Inconnue'];
        }

        if (strpos($htmlContent, 'typescript') !== false || strpos($htmlContent, '.ts') !== false) {
            $technologies[] = ['name' => 'TypeScript', 'version' => 'Inconnue'];
        }

        return $technologies;
    }

    protected function detectBackendTechnologies($htmlContent)
    {
        $technologies = [];

        if (strpos($htmlContent, 'laravel_session') !== false) {
            $technologies[] = ['name' => 'Laravel', 'version' => 'Inconnue'];
        }

        if (strpos($htmlContent, 'php') !== false || strpos($htmlContent, '.php') !== false) {
            $technologies[] = ['name' => 'PHP', 'version' => 'Inconnue'];
        }

        if (strpos($htmlContent, 'node.js') !== false || strpos($htmlContent, 'express') !== false) {
            $technologies[] = ['name' => 'Node.js', 'version' => 'Inconnue'];
        }

        if (strpos($htmlContent, 'django') !== false || strpos($htmlContent, 'csrfmiddlewaretoken') !== false) {
            $technologies[] = ['name' => 'Django', 'version' => 'Inconnue'];
        }

        if (strpos($htmlContent, 'rails') !== false || strpos($htmlContent, 'ruby') !== false) {
            $technologies[] = ['name' => 'Ruby on Rails', 'version' => 'Inconnue'];
        }

        return $technologies;
    }

    protected function detectWordPressVersion($htmlContent)
    {
        if (preg_match('/<meta name="generator" content="WordPress (\d+\.\d+\.\d+)" \/>/i', $htmlContent, $matches)) {
            return $matches[1];
        }
        return 'Inconnue';
    }

    protected function detectJqueryVersion($htmlContent)
    {
        if (preg_match('/jquery\.js\?ver=(\d+\.\d+\.\d+)/i', $htmlContent, $matches)) {
            return $matches[1];
        }
        return 'Inconnue';
    }

    protected function detectBootstrapVersion($htmlContent)
    {
        if (preg_match('/bootstrap\.css\?ver=(\d+\.\d+\.\d+)/i', $htmlContent, $matches)) {
            return $matches[1];
        }
        return 'Inconnue';
    }
}