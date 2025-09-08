<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Patient extends Model
{
    // Define the associated table name
    protected $table = 'patients';

    // Set the primary key column
    protected $primaryKey = 'patient_id';

    // Define the fields that are mass assignable
    protected $fillable = [
        'name',
        'address',
        'phone',
        'dob',
        'email',
        'gender',
        'image',
        'user_id',
    ];

    //Disable default timestamps
    public $timestamps = false;

    //Each patient belongs to one user
    public function user()
    {
        return $this->belongsTo(MediUser::class, 'user_id', 'user_id');
    }

    /**
     * One-to-many relationship with appointments table
     * One patient can have many appointments
     */
    public function appointments()
    {
        return $this->hasMany(Appointment::class, 'patient_id', 'patient_id');
    }
}
