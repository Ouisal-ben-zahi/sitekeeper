<?php

namespace App\Providers;
use App\Models\Domaine;
use App\Observers\DomaineObserver;
use Illuminate\Support\ServiceProvider;
use App\Models\Technologie;
use App\Observers\TechnologieObserver;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Domaine::observe(DomaineObserver::class);
        Technologie::observe(TechnologieObserver::class);
    }
}
