<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use App\Models\MediUser;
use App\Models\Doctor;
use App\Models\Role;
use App\Models\City;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Register a new doctor
     */
    public function register(Request $request)
    {
        $request->validate([
            'username' => 'required|string|max:255|unique:medi_users',
            'password' => 'required|string|min:6|confirmed',
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:doctors',
            'phone' => 'required|string|max:20|unique:doctors',
            'specialization' => 'required|string|max:255',
            'qualification' => 'required|string|max:255',
            'experience' => 'required|integer|min:0',
            'gender' => 'required|in:Male,Female,Other',
            'dob' => 'required|date',
            'city_id' => 'required|exists:cities,city_id',
            'description' => 'nullable|string'
        ]);

        // Create MediUser
        $mediUser = MediUser::create([
            'username' => $request->username,
            'password' => Hash::make($request->password),
            'role_id' => 1, // Doctor role
        ]);

        // Create Doctor profile
        $doctor = Doctor::create([
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'specialization' => $request->specialization,
            'qualification' => $request->qualification,
            'experience' => $request->experience,
            'gender' => $request->gender,
            'dob' => $request->dob,
            'city_id' => $request->city_id,
            'description' => $request->description ?? '',
            'user_id' => $mediUser->user_id,
        ]);

        // Create token
        $token = $mediUser->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Doctor registered successfully',
            'access_token' => $token,
            'token_type' => 'Bearer',
            'doctor' => $doctor->load('city')
        ], 201);
    }

    /**
     * Login doctor
     */
    public function login(Request $request)
    {
        $request->validate([
            'username' => 'required|string',
            'password' => 'required|string'
        ]);

        $mediUser = MediUser::where('username', $request->username)->first();

        if (!$mediUser || !Hash::check($request->password, $mediUser->password)) {
            throw ValidationException::withMessages([
                'username' => ['The provided credentials are incorrect.'],
            ]);
        }

        // Check if user is locked
        if ($mediUser->locked_until && now()->lt($mediUser->locked_until)) {
            $remainingTime = $mediUser->locked_until->diffInMinutes(now());
            throw ValidationException::withMessages([
                'username' => ["Account is locked. Try again in {$remainingTime} minutes."],
            ]);
        }

        // Reset login attempts on successful login
        $mediUser->update([
            'login_attempts' => 0,
            'locked_until' => null
        ]);

        // Get doctor profile
        $doctor = Doctor::where('user_id', $mediUser->user_id)->with('city')->first();

        if (!$doctor) {
            throw ValidationException::withMessages([
                'username' => ['Doctor profile not found.'],
            ]);
        }

        // Create token
        $token = $mediUser->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Login successful',
            'access_token' => $token,
            'token_type' => 'Bearer',
            'doctor' => $doctor
        ]);
    }

    /**
     * Logout doctor
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logout successful'
        ]);
    }

    /**
     * Get current authenticated doctor
     */
    public function me(Request $request)
    {
        $mediUser = $request->user();
        $doctor = Doctor::where('user_id', $mediUser->user_id)->with('city')->first();

        return response()->json($doctor);
    }

    /**
     * Get available cities for registration
     */
    public function getCities()
    {
        $cities = City::all();
        return response()->json($cities);
    }
}
