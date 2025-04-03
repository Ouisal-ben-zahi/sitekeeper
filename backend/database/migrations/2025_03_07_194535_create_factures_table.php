<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('factures', function (Blueprint $table) {
            $table->id(); 
            $table->unsignedBigInteger('client_id');  
            $table->unsignedBigInteger('intervention_id');  
            $table->decimal('montant', 10, 2);  
            $table->enum('statut_paiement', ['payé', 'impayé'])->default('impayé');  
            $table->date('date_emission'); 
            $table->date('date_paiement')->nullable();  
            $table->timestamps();
            $table->foreign('client_id')->references('id')->on('clients')->onDelete('cascade');
            $table->foreign('intervention_id')->references('id')->on('interventions')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('factures');
    }
};
