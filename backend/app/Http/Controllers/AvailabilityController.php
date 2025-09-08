<?php

namespace App\Http\Controllers;

use App\Models\AvailabilityScheduling;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AvailabilityController extends Controller
{
    /**
     * Get availabilities for a doctor
     */
    public function index(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'doctor_id' => 'required|exists:doctors,doctor_id'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 400);
        }

        $availabilities = AvailabilityScheduling::where('doctor_id', $request->doctor_id)
            ->orderBy('available_date')
            ->orderBy('available_time')
            ->get();

        return response()->json($availabilities);
    }

    /**
     * Create new availability slot
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'doctor_id' => 'required|exists:doctors,doctor_id',
            'available_date' => 'required|date|after_or_equal:today',
            'available_time' => 'required|date_format:H:i',
            'status' => 'nullable|in:available,booked'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 400);
        }

        // Check if slot already exists
        $existing = AvailabilityScheduling::where('doctor_id', $request->doctor_id)
            ->where('available_date', $request->available_date)
            ->where('available_time', $request->available_time)
            ->first();

        if ($existing) {
            return response()->json([
                'success' => false,
                'message' => 'This time slot already exists'
            ], 400);
        }

        $availability = AvailabilityScheduling::create([
            'doctor_id' => $request->doctor_id,
            'available_date' => $request->available_date,
            'available_time' => $request->available_time,
            'status' => $request->status ?? 'available'
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Availability slot created successfully',
            'data' => $availability
        ]);
    }

    /**
     * Update availability slot
     */
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'available_date' => 'sometimes|date|after_or_equal:today',
            'available_time' => 'sometimes|date_format:H:i',
            'status' => 'sometimes|in:available,booked'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 400);
        }

        $availability = AvailabilityScheduling::findOrFail($id);
        
        // Check if this availability belongs to the authenticated doctor
        $doctorId = $request->user()->doctor->doctor_id;
        if ($availability->doctor_id !== $doctorId) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized to update this availability'
            ], 403);
        }

        $availability->update($request->only(['available_date', 'available_time', 'status']));

        return response()->json([
            'success' => true,
            'message' => 'Availability slot updated successfully',
            'data' => $availability
        ]);
    }

    /**
     * Delete availability slot
     */
    public function destroy(Request $request, $id)
    {
        $availability = AvailabilityScheduling::findOrFail($id);
        
        // Check if this availability belongs to the authenticated doctor
        $doctorId = $request->user()->doctor->doctor_id;
        if ($availability->doctor_id !== $doctorId) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized to delete this availability'
            ], 403);
        }

        // Check if slot is booked
        if ($availability->status === 'booked') {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete a booked slot'
            ], 400);
        }

        $availability->delete();

        return response()->json([
            'success' => true,
            'message' => 'Availability slot deleted successfully'
        ]);
    }
}