<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateNotificationsTable extends Migration
{
    public function up()
    {
        Schema::create('notifications', function (Blueprint $table) {
    $table->id();
    $table->unsignedBigInteger('doctor_id');
    $table->unsignedBigInteger('patient_id')->nullable();
    $table->unsignedBigInteger('appointment_id')->nullable();
    $table->enum('type', ['booking', 'reschedule', 'cancel']);
    $table->text('message')->nullable();
    $table->boolean('is_read')->default(false);
    $table->timestamps();

    // Đúng tên cột khóa chính của bảng doctors
    $table->foreign('doctor_id')->references('doctor_id')->on('doctors')->onDelete('cascade');
    $table->foreign('patient_id')->references('patient_id')->on('patients')->onDelete('set null');
    $table->foreign('appointment_id')->references('appointment_id')->on('appointments')->onDelete('set null');
});
    }

    public function down()
    {
        Schema::dropIfExists('notifications');
    }
}
