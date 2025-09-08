<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Doctor;
use Illuminate\Support\Facades\Storage;

class DoctorProfileController extends Controller
{
    public function update(Request $request)
    {
        \Log::info('✅ Đã vào DoctorProfileController@update');

        $mediUser = $request->user();
        $doctor = Doctor::where('user_id', $mediUser->user_id)->first();
        
        if (!$doctor) {
            return response()->json(['error' => 'Doctor not found'], 404);
        }

        $fields = [
            'name', 'email', 'qualification', 'experience',
            'phone', 'specialization', 'gender', 'dob', 'city_id'
        ];

        foreach ($fields as $field) {
            if ($request->filled($field)) {
                $doctor->$field = $request->input($field);
            }
        }

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('avatars', 'public');
            $doctor->image = '/storage/' . $path;
        }

        $doctor->save();

        return response()->json(['message' => 'Doctor updated successfully.']);
    }
}
