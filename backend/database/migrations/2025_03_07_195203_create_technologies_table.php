<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::create('technologies', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('domaine_id');
            $table->string('nom_technologie');
            $table->string('version')->default('Inconnue');
            $table->string('statut')->default('à jour');
            $table->timestamps();
    
            $table->foreign('domaine_id')->references('id')->on('domaines')->onDelete('cascade');
        });
    }
    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('technologies');
    }
};