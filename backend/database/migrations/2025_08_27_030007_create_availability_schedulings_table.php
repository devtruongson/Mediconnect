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
         Schema::create('availability_schedulings', function (Blueprint $table) {
            $table->id('availability_id');
            $table->unsignedBigInteger('doctor_id');
            $table->date('available_date');
            $table->time('available_time');
            $table->enum('status', ['available', 'booked'])->nullable();
            $table->foreign('doctor_id')->references('doctor_id')->on('doctors')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('availability_schedulings');
    }
};
