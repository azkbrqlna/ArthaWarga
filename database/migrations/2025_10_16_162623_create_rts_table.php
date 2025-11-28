<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateRtsTable extends Migration
{
    public function up(): void {
    Schema::create('rt', function (Blueprint $table) {
        $table->id();
        $table->foreignId('rw_id')->constrained('rw')->cascadeOnDelete();
        $table->string('rt'); 
        $table->timestamps();
    });
}

    public function down()
    {
        Schema::dropIfExists('rt');
    }
}