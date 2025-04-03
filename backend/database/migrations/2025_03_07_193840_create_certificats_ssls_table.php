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
        Schema::create('certificats_ssl', function (Blueprint $table) {
            $table->id();  
            $table->unsignedBigInteger('domaine_id'); 
            $table->date('date_expiration');
            $table->enum('statut', ['valide', 'expiré'])->default('valide'); 
            $table->timestamps();  
            $table->foreign('domaine_id')->references('id')->on('domaines')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('certificats_ssls');
    }
};
