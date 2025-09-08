<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Content extends Model
{
    // Define the associated table name
    protected $table = 'contents';

    // Set the primary key column
    protected $primaryKey = 'content_id';

    // Define the fields that are mass assignable
    protected $fillable = [
        'category_id',
        'created_by',
        'title',
        'description',
        'image',
        "name"
    ];


    //Disable default timestamps
    public $timestamps = false;


    //Each content belongs to one category
    public function category()
    {
        return $this->belongsTo(Category::class, 'category_id', 'category_id');
    }

    //Each content is created by one user
    public function creator()
    {
        return $this->belongsTo(MediUser::class, 'created_by', 'user_id');
    }
}
