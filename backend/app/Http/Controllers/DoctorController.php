<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Doctor;
use App\Models\Appointment;
use App\Models\Notification;
use App\Models\AvailabilityScheduling;
use App\Models\Patient;

class DoctorController extends Controller
{
    
    public function me(Request $request)
    {
        $mediUser = $request->user();
        $doctor = Doctor::where('user_id', $mediUser->user_id)->with('city')->first();

        if (!$doctor) {
            return response()->json(['error' => 'Doctor not found'], 404);
        }

        return response()->json($doctor); 
    }

  
    public function uploadAvatar(Request $request)
    {
        if ($request->hasFile('avatar')) {
            $file = $request->file('avatar');
            $path = $file->store('avatars', 'public');

            $mediUser = $request->user();
            $doctor = Doctor::where('user_id', $mediUser->user_id)->first();
            
            if (!$doctor) {
                return response()->json(['error' => 'Doctor not found'], 404);
            }
            
            $doctor->image = "/storage/$path";
            $doctor->save();

            return response()->json([
                'avatar' => $doctor->image
            ]);
        }

        return response()->json(['error' => 'No file uploaded'], 400);
    }

    public function dashboard(Request $request)
    {
        $mediUser = $request->user();
        $doctor = Doctor::where('user_id', $mediUser->user_id)->first();

        if (!$doctor) {
            return response()->json(['error' => 'Doctor not found'], 404);
        }

        // Get today's appointments
        $todayAppointments = Appointment::whereHas('availability', function($query) use ($doctor) {
            $query->where('doctor_id', $doctor->doctor_id);
        })
        ->whereHas('availability', function($query) {
            $query->where('available_date', now()->format('Y-m-d'));
        })
        ->with(['patient', 'availability'])
        ->get();

        // Get upcoming appointments (next 7 days)
        $upcomingAppointments = Appointment::whereHas('availability', function($query) use ($doctor) {
            $query->where('doctor_id', $doctor->doctor_id);
        })
        ->whereHas('availability', function($query) {
            $query->where('available_date', '>=', now()->format('Y-m-d'))
                  ->where('available_date', '<=', now()->addDays(7)->format('Y-m-d'));
        })
        ->with(['patient', 'availability'])
        ->get();

        // Get unread notifications count
        $unreadNotificationsCount = Notification::where('doctor_id', $doctor->doctor_id)
            ->where('is_read', false)
            ->count();

        // Get total appointments count
        $totalAppointments = Appointment::whereHas('availability', function($query) use ($doctor) {
            $query->where('doctor_id', $doctor->doctor_id);
        })->count();

        // Get available slots count
        $availableSlotsCount = AvailabilityScheduling::where('doctor_id', $doctor->doctor_id)
            ->where('status', 'available')
            ->count();

        // Get booked slots count
        $bookedSlotsCount = AvailabilityScheduling::where('doctor_id', $doctor->doctor_id)
            ->where('status', 'booked')
            ->count();

        return response()->json([
            'success' => true,
            'data' => [
                'doctor' => $doctor,
                'stats' => [
                    'total_appointments' => $totalAppointments,
                    'available_slots' => $availableSlotsCount,
                    'booked_slots' => $bookedSlotsCount,
                    'unread_notifications' => $unreadNotificationsCount
                ],
                'today_appointments' => $todayAppointments,
                'upcoming_appointments' => $upcomingAppointments
            ]
        ]);
    }

    public function getPatients(Request $request)
    {
        $mediUser = $request->user();
        $doctor = Doctor::where('user_id', $mediUser->user_id)->first();

        if (!$doctor) {
            return response()->json(['error' => 'Doctor not found'], 404);
        }

        // Get patients who have appointments with this doctor
        $patients = Patient::whereHas('appointments.availability', function($query) use ($doctor) {
            $query->where('doctor_id', $doctor->doctor_id);
        })
        ->with(['appointments' => function($query) use ($doctor) {
            $query->whereHas('availability', function($q) use ($doctor) {
                $q->where('doctor_id', $doctor->doctor_id);
            });
        }])
        ->get();

        return response()->json([
            'success' => true,
            'data' => $patients
        ]);
    }

    public function getStats(Request $request)
    {
        $mediUser = $request->user();
        $doctor = Doctor::where('user_id', $mediUser->user_id)->first();

        if (!$doctor) {
            return response()->json(['error' => 'Doctor not found'], 404);
        }

        // Get appointments by status
        $appointmentsByStatus = Appointment::whereHas('availability', function($query) use ($doctor) {
            $query->where('doctor_id', $doctor->doctor_id);
        })
        ->selectRaw('status, COUNT(*) as count')
        ->groupBy('status')
        ->pluck('count', 'status');

        // Get appointments by month (last 6 months)
        $appointmentsByMonth = Appointment::whereHas('availability', function($query) use ($doctor) {
            $query->where('doctor_id', $doctor->doctor_id);
        })
        ->where('created_at', '>=', now()->subMonths(6))
        ->selectRaw('DATE_FORMAT(created_at, "%Y-%m") as month, COUNT(*) as count')
        ->groupBy('month')
        ->orderBy('month')
        ->get();

        // Get availability slots by status
        $slotsByStatus = AvailabilityScheduling::where('doctor_id', $doctor->doctor_id)
            ->selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status');

        return response()->json([
            'success' => true,
            'data' => [
                'appointments_by_status' => $appointmentsByStatus,
                'appointments_by_month' => $appointmentsByMonth,
                'slots_by_status' => $slotsByStatus
            ]
        ]);
    }
}
