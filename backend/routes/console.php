<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;
use App\Console\Commands\CheckDomainName;
use App\Console\Commands\CheckContractStatus;
use App\Console\Commands\CheckSSLExpiration;
use App\Console\Commands\DetectDomainTechnologies;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Vérification du statut des noms de domaine chaque jour à 1h du matin
Schedule::command(CheckDomainName::class)->hourly()
    ->description('Vérification quotidienne du statut des domaines');

// Détection des technologies des domaines chaque jour à 1h du matin
Schedule::command('domain:detect-technologies --all')->dailyAt('01:00')
    ->description('Détection quotidienne des technologies utilisées sur les domaines');

// Vérification de l'expiration SSL chaque jour à 3h du matin
Schedule::command(CheckSSLExpiration::class)->dailyAt('03:00')
    ->description('Vérification quotidienne des certificats SSL');

// Vérification du statut des contrats chaque jour à minuit
Schedule::command(CheckContractStatus::class)->dailyAt('00:00')
    ->description('Vérification quotidienne du statut des contrats');