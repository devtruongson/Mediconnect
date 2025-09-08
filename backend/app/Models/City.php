<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class City extends Model
{
    // Define the associated table
    protected $table = 'cities';

    // Set the primary key column
    protected $primaryKey = 'city_id';


    // Specify mass assignable fields
    protected $fillable = ['city_name'];

    //Disable default timestamps
    public $timestamps = false;

    //A city can have many doctors.
    
    public function doctors()
    {
        return $this->hasMany(Doctor::class, 'city_id', 'city_id');
    }
}
