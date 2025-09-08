<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ContactMessage extends Model
{
    // Define the associated table name
    protected $table = 'contact_messages';

    // Set the primary key column
    protected $primaryKey = 'message_id';

    // Specify mass assignable fields
    protected $fillable = [
        'name',
        'email',
        'phone',
        'message',
        'status',
    ];

    public $timestamps = false;
    const CREATED_AT = 'created_at';
}
