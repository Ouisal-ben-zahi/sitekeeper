<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Domaine;
use App\Models\Technologie;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\RequestException;

class DetectDomainTechnologies extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'domain:detect-technologies {domaine_id?} {--all}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Détecte les technologies utilisées sur un domaine ou tous les domaines sans utiliser d\'API externe.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        if ($this->option('all')) {
            // Traiter tous les domaines
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
            // Traiter un seul domaine
            $domaineId = $this->argument('domaine_id');

            if (!$domaineId) {
                $this->error("Veuillez spécifier un ID de domaine ou utiliser l'option --all pour traiter tous les domaines.");
                return;
            }

            $this->processDomaine($domaineId);
        }
    }

    /**
     * Traite un domaine spécifique
     *
     * @param int $domaineId
     */
    protected function processDomaine($domaineId)
    {
        // Récupérer le domaine
        $domaine = Domaine::find($domaineId);

        if (!$domaine) {
            $this->error("Domaine introuvable avec l'ID : $domaineId");
            return;
        }

        $this->info("Détection des technologies pour le domaine : {$domaine->nom_domaine}");

        // Récupérer le contenu HTML du site
        $htmlContent = $this->fetchHtmlContent($domaine->nom_domaine);

        if (!$htmlContent) {
            $this->error("Impossible de récupérer le contenu du site.");
            return;
        }

        // Détecter les technologies frontend et backend
        $technologies = $this->detectTechnologies($htmlContent);

        if (empty($technologies)) {
            $this->error("Aucune technologie détectée pour ce domaine.");
            return;
        }

        // Vérifier si le domaine existe déjà dans la table technologie
        $existingTechnologies = Technologie::where('domaine_id', $domaine->id)->get();

        if ($existingTechnologies->isEmpty()) {
            // Si le domaine n'existe pas, insérer les nouvelles technologies
            foreach ($technologies as $tech) {
                Technologie::create([
                    'domaine_id' => $domaine->id,
                    'nom_technologie' => $tech['name'],
                    'version' => $tech['version'] ?? 'Inconnue',
                    'statut' => 'à jour',
                ]);
            }
            $this->info("Technologies enregistrées avec succès pour le domaine : {$domaine->nom_domaine}");
        } else {
            // Si le domaine existe, mettre à jour les technologies existantes
            foreach ($technologies as $tech) {
                $existingTech = $existingTechnologies->where('nom_technologie', $tech['name'])->first();

                if ($existingTech) {
                    // Mettre à jour la technologie existante
                    $existingTech->update([
                        'version' => $tech['version'] ?? 'Inconnue',
                        'statut' => 'à jour',
                    ]);
                } else {
                    // Insérer une nouvelle technologie si elle n'existe pas
                    Technologie::create([
                        'domaine_id' => $domaine->id,
                        'nom_technologie' => $tech['name'],
                        'version' => $tech['version'] ?? 'Inconnue',
                        'statut' => 'à jour',
                    ]);
                }
            }
            $this->info("Technologies mises à jour avec succès pour le domaine : {$domaine->nom_domaine}");
        }
    }

    /**
     * Récupérer le contenu HTML du site.
     *
     * @param string $domain
     * @return string|null
     */
    protected function fetchHtmlContent($domain)
    {
        $client = new Client();

        try {
            $response = $client->get("https://$domain", [
                'verify' => false, // Désactive la vérification SSL
                'headers' => [
                    'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
                ],
                'timeout' => 10, // Timeout de 10 secondes
                'allow_redirects' => true, // Suivre les redirections
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

    /**
     * Détecter les technologies frontend et backend.
     *
     * @param string $htmlContent
     * @return array
     */
    protected function detectTechnologies($htmlContent)
    {
        $technologies = [];

        // Détecter les technologies frontend
        $technologies = array_merge($technologies, $this->detectFrontendTechnologies($htmlContent));

        // Détecter les technologies backend
        $technologies = array_merge($technologies, $this->detectBackendTechnologies($htmlContent));

        return $technologies;
    }

    /**
     * Détecter les technologies frontend.
     *
     * @param string $htmlContent
     * @return array
     */
    protected function detectFrontendTechnologies($htmlContent)
    {
        $technologies = [];

        // Détecter WordPress
        if (strpos($htmlContent, 'wp-content') !== false) {
            $technologies[] = ['name' => 'WordPress', 'version' => $this->detectWordPressVersion($htmlContent)];
        }

        // Détecter jQuery
        if (strpos($htmlContent, 'jquery') !== false) {
            $technologies[] = ['name' => 'jQuery', 'version' => $this->detectJqueryVersion($htmlContent)];
        }

        // Détecter Bootstrap
        if (strpos($htmlContent, 'bootstrap') !== false) {
            $technologies[] = ['name' => 'Bootstrap', 'version' => $this->detectBootstrapVersion($htmlContent)];
        }

        // Détecter Tailwind CSS
        if (strpos($htmlContent, 'tailwind') !== false || strpos($htmlContent, 'tailwindcss') !== false) {
            $technologies[] = ['name' => 'Tailwind CSS', 'version' => 'Inconnue'];
        }

        // Détecter React
        if (strpos($htmlContent, 'react') !== false || strpos($htmlContent, 'ReactDOM') !== false) {
            $technologies[] = ['name' => 'React', 'version' => 'Inconnue'];
        }

        // Détecter Vue.js
        if (strpos($htmlContent, 'vue') !== false || strpos($htmlContent, 'Vue.js') !== false) {
            $technologies[] = ['name' => 'Vue.js', 'version' => 'Inconnue'];
        }

        // Détecter Angular
        if (strpos($htmlContent, 'angular') !== false || strpos($htmlContent, 'ng-') !== false) {
            $technologies[] = ['name' => 'Angular', 'version' => 'Inconnue'];
        }

        // Détecter HTML
        if (strpos($htmlContent, '<html') !== false || strpos($htmlContent, '<!DOCTYPE html>') !== false) {
            $technologies[] = ['name' => 'HTML', 'version' => 'Inconnue'];
        }

        // Détecter JavaScript
        if (strpos($htmlContent, '<script') !== false || strpos($htmlContent, '.js') !== false) {
            $technologies[] = ['name' => 'JavaScript', 'version' => 'Inconnue'];
        }

        // Détecter TypeScript
        if (strpos($htmlContent, 'typescript') !== false || strpos($htmlContent, '.ts') !== false) {
            $technologies[] = ['name' => 'TypeScript', 'version' => 'Inconnue'];
        }

        return $technologies;
    }

    /**
     * Détecter les technologies backend.
     *
     * @param string $htmlContent
     * @return array
     */
    protected function detectBackendTechnologies($htmlContent)
    {
        $technologies = [];

        // Détecter Laravel
        if (strpos($htmlContent, 'laravel_session') !== false) {
            $technologies[] = ['name' => 'Laravel', 'version' => 'Inconnue'];
        }

        // Détecter PHP
        if (strpos($htmlContent, 'php') !== false || strpos($htmlContent, '.php') !== false) {
            $technologies[] = ['name' => 'PHP', 'version' => 'Inconnue'];
        }

        // Détecter Node.js
        if (strpos($htmlContent, 'node.js') !== false || strpos($htmlContent, 'express') !== false) {
            $technologies[] = ['name' => 'Node.js', 'version' => 'Inconnue'];
        }

        // Détecter Django
        if (strpos($htmlContent, 'django') !== false || strpos($htmlContent, 'csrfmiddlewaretoken') !== false) {
            $technologies[] = ['name' => 'Django', 'version' => 'Inconnue'];
        }

        // Détecter Ruby on Rails
        if (strpos($htmlContent, 'rails') !== false || strpos($htmlContent, 'ruby') !== false) {
            $technologies[] = ['name' => 'Ruby on Rails', 'version' => 'Inconnue'];
        }

        return $technologies;
    }

    /**
     * Détecter la version de WordPress.
     *
     * @param string $htmlContent
     * @return string
     */
    protected function detectWordPressVersion($htmlContent)
    {
        if (preg_match('/<meta name="generator" content="WordPress (\d+\.\d+\.\d+)" \/>/i', $htmlContent, $matches)) {
            return $matches[1];
        }
        return 'Inconnue';
    }

    /**
     * Détecter la version de jQuery.
     *
     * @param string $htmlContent
     * @return string
     */
    protected function detectJqueryVersion($htmlContent)
    {
        if (preg_match('/jquery\.js\?ver=(\d+\.\d+\.\d+)/i', $htmlContent, $matches)) {
            return $matches[1];
        }
        return 'Inconnue';
    }

    /**
     * Détecter la version de Bootstrap.
     *
     * @param string $htmlContent
     * @return string
     */
    protected function detectBootstrapVersion($htmlContent)
    {
        if (preg_match('/bootstrap\.css\?ver=(\d+\.\d+\.\d+)/i', $htmlContent, $matches)) {
            return $matches[1];
        }
        return 'Inconnue';
    }
}


