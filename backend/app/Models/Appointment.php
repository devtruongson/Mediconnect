<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Appointment extends Model
{
    // Define the associated table
    protected $table = 'appointments';

    // Define the primary key of the table
    protected $primaryKey = 'appointment_id';

    // Specify which fields are mass assignable
    protected $fillable = [
        'patient_id',
        'availability_id',
        'status',
    ];

    //Enable timestamps
    public $timestamps = true;

    /**
     * Each appointment belongs to one patient
     */
    public function patient()
    {
        return $this->belongsTo(Patient::class, 'patient_id', 'patient_id');
    }

    /**
     * Each appointment belongs to one available time slot
     */
    public function availability()
    {
        return $this->belongsTo(AvailabilityScheduling::class, 'availability_id', 'availability_id');
    }
}
