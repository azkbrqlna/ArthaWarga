<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateRwsTable extends Migration
{
    public function up(): void {
    Schema::create('rw', function (Blueprint $table) {
        $table->id();
        $table->foreignId('kelurahan_id')->constrained('kelurahan')->cascadeOnDelete();
        $table->string('rw'); 
        $table->timestamps();
    });
}

    public function down()
    {
        Schema::dropIfExists('rw');
    }
}