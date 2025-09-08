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
        Schema::create('contents', function (Blueprint $table) {
            $table->id('content_id');
            $table->unsignedBigInteger('category_id');
            $table->unsignedBigInteger('created_by');
            $table->string('title');
            $table->text('description');
            $table->string('image')->nullable();
            $table->text('name');
            $table->foreign('category_id')->references('category_id')->on('categories');
            $table->foreign('created_by')->references('user_id')->on('medi_users');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('contents');
    }
};
