<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Laravel\Sanctum\HasApiTokens;

class MediUser extends Model
{
    use HasApiTokens;
    
    // Define the associated table name
    protected $table = 'medi_users';

    // Set the primary key column
    protected $primaryKey = 'user_id';

    // Define the fields that are mass assignable
    protected $fillable = [
        'username',
        'password',
        'role_id',
    ];

    //Disable default timestamps
    public $timestamps = false;

    /*Many-to-one relationship with roles table
     Each user belongs to one role
     */
    public function role()
    {
        return $this->belongsTo(Role::class, 'role_id', 'role_id');
    }

    /**
     * One user may have one doctor profile
     */
    public function doctor()
    {
        return $this->hasOne(Doctor::class, 'user_id', 'user_id');
    }

    /**
     * One user may have one patient profile
     */
    public function patient()
    {
        return $this->hasOne(Patient::class, 'user_id', 'user_id');
    }

    /**
     * One user (admin) can create many contents
     */
    public function contents()
    {
        return $this->hasMany(Content::class, 'created_by', 'user_id');
    }
}
