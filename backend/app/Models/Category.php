<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    // Define the associated table
    protected $table = 'categories';

    // Set the primary key column
    protected $primaryKey = 'category_id';


    // Specify mass assignable fields
    protected $fillable = ['category_name'];

    //Disable default timestamps
    public $timestamps = false;


    
    //A category can have many contents.
    public function contents()
    {
        return $this->hasMany(Content::class, 'category_id', 'category_id');
    }
}
