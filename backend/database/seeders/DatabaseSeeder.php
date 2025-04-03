<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\{Client, User, Domaine, ContratMaintenance, Intervention, Facture, Notification, Technologie};
use App\Models\CertificatSSL;

class DatabaseSeeder extends Seeder
{
    public function run()
    {
        // Seed Clients
        $client = Client::create([
            'nom_entreprise' => 'Tech Solutions',
            'ice' => '1234567890',
            'ville' => 'Casablanca',
            'code_postal' => '20000',
            'nom_responsable' => 'Ahmed Karim',
            'tel_responsable' => '0612345678',
            'email_responsable' => 'ahmed.karim@example.com',
        ]);

        // Seed Users
        $admin = User::create([
            'name' => 'Admin',
            'email' => 'admin@example.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'client_id' => $client->id
        ]);

        $technicien = User::create([
            'name' => 'Technicien',
            'email' => 'technicien@example.com',
            'password' => Hash::make('password'),
            'role' => 'technicien',
            'client_id' => $client->id
        ]);

        // Seed Domaines
        $domaine = Domaine::create([
            'client_id' => $client->id,
            'nom_domaine' => 'techsolutions.com',
            'date_expiration' => now()->addYear(),
            'statut' => 'actif'
        ]);

        // Seed Contrat Maintenance
        ContratMaintenance::create([
            'client_id' => $client->id,
            'date_debut' => now(),
            'date_fin' => now()->addYear(),
            'statut' => 'actif'
        ]);

        
        // Seed Interventions
        $intervention = Intervention::create([
            'domaine_id' => $domaine->id,
            'technicien_id' => $technicien->id,
            'description' => 'Mise à jour de sécurité',
            'statut' => 'en cours',
            'date_debut' => now(),
            'date_fin' => now()->addHours(2)
        ]);

        // Seed Factures
        Facture::create([
            'client_id' => $client->id,
            'intervention_id' => $intervention->id,
            'montant' => 500.00,
            'statut_paiement' => 'impayé',
            'date_emission' => now()
        ]);

        // Seed Notifications
        Notification::create([
            'client_id' => $client->id,
            'message' => 'Votre facture est en attente de paiement.',
            'type' => 'alerte'
        ]);

        // Seed Technologies
        Technologie::create([
            'domaine_id' => $domaine->id,
            'nom_technologie' => 'Laravel',
            'version' => '9.x',
            'statut' => 'à jour'
        ]);
    }
}
