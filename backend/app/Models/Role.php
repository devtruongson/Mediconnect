<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Role extends Model
{
    // Define the associated table name
    protected $table = 'roles';

    // Set the primary key column
    protected $primaryKey = 'role_id';

    // Define the fields that are mass assignable
    protected $fillable = ['role_name'];

    //Disable default timestamps
    public $timestamps = false;

    //One role can be assigned to many users (MediUser)
    public function users()
    {
        return $this->hasMany(MediUser::class, 'role_id', 'role_id');
    }

    //Disable update/insert trong Role Model
    public static function boot()
    {
        parent::boot();

        static::creating(function () {
            throw new \Exception("Creating roles is not allowed.");
        });

        static::updating(function () {
            throw new \Exception("Updating roles is not allowed.");
        });

        static::deleting(function () {
            throw new \Exception("Deleting roles is not allowed.");
        });
    }
}
