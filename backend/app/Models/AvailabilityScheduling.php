<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AvailabilityScheduling extends Model
{
    // Define the associated table name
    protected $table = 'availability_schedulings';

    // Set the primary key column
    protected $primaryKey = 'availability_id';

    // Specify the fields that can be mass assigned
    protected $fillable = [
        'doctor_id',
        'available_date',
        'available_time',
        'status'
    ];

    // Disable Laravel's automatic timestamp columns
    public $timestamps = false;


    //Each availability schedule belongs to one doctor.
    public function doctor()
    {
        return $this->belongsTo(Doctor::class, 'doctor_id', 'doctor_id');
    }

    /**
     * Each availability schedule can have at most one appointment.
     * Returns the appointment booked for this availability slot, if any.
     */
    public function appointments()
    {
        return $this->hasOne(Appointment::class, 'availability_id', 'availability_id');
    }
}
