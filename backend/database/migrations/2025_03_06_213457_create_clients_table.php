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
        Schema::create('clients', function (Blueprint $table) {
            $table->id(); 
            $table->string('nom_entreprise'); 
            $table->string('ice')->unique(); 
            $table->string('ville'); 
            $table->string('code_postal'); 
            $table->string('nom_responsable'); 
            $table->string('tel_responsable'); 
            $table->string('email_responsable'); 
            $table->timestamps(); 
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('clients');
    }
};
