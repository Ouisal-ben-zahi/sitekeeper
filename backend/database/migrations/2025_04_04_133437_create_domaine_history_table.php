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
        Schema::create('domaine_history', function (Blueprint $table) {
            $table->id();
            $table->foreignId('domaine_id')->constrained()->onDelete('cascade');
            $table->string('action'); // 'status_change', 'technology_detection', 'deletion'
            $table->text('old_value')->nullable();
            $table->text('new_value')->nullable();
            $table->string('old_technology_name')->nullable();
            $table->string('old_technology_version')->nullable();
            $table->string('technology_name')->nullable();
            $table->string('technology_version')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('domaine_history');
    }
};
