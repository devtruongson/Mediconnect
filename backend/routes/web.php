<?php

use Illuminate\Support\Facades\Route;
// use App\Models\MediUser; //- test

Route::get('/', function () {
    return view('welcome');
});

/* Test
Route::get('/test-user', function () {
    return MediUser::with('role')->first();
});
*/