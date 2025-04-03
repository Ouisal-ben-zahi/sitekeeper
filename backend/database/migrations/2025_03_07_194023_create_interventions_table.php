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
        Schema::create('interventions', function (Blueprint $table) {
            $table->id(); 
            $table->unsignedBigInteger('domaine_id');  
            $table->unsignedBigInteger('technicien_id'); 
            $table->text('description'); 
            $table->enum('statut', ['a faire', 'en cours', 'terminé', 'annulé'])->default('a faire');  
            $table->dateTime('date_debut');  
            $table->dateTime('date_fin')->nullable();  
            $table->integer('duree')->virtualAs('TIMESTAMPDIFF(MINUTE, date_debut, date_fin)');  
            $table->timestamps();
            $table->foreign('domaine_id')->references('id')->on('domaines')->onDelete('cascade');
            $table->foreign('technicien_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('interventions');
    }
};
