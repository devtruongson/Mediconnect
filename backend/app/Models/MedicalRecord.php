<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MedicalRecord extends Model
{
    // Define the associated table name
    protected $table = 'medical_records';

    // Set the primary key column
    protected $primaryKey = 'record_id';

    // Define the fields that are mass assignable
    protected $fillable = [
        'appointment_id',
        'diagnosis',
        'notes',
        'date',
    ];

    //Disable default timestamps
    public $timestamps = false;

    //Each record belongs to one appointment
    public function appointment()
    {
        return $this->belongsTo(Appointment::class, 'appointment_id', 'appointment_id');
    }
}
