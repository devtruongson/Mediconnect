<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\AvailabilityScheduling;
use App\Models\Notification;
use App\Models\Doctor;
use App\Models\Patient;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class BookingController extends Controller
{
    /**
     * Get available time slots for a specific doctor and date
     */
    public function getAvailableSlots(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'doctor_id' => 'required|exists:doctors,doctor_id',
            'date' => 'required|date|after_or_equal:today'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 400);
        }

        $availableSlots = AvailabilityScheduling::where('doctor_id', $request->doctor_id)
            ->where('available_date', $request->date)
            ->where('status', 'available')
            ->orderBy('available_time')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $availableSlots
        ]);
    }

    /**
     * Book an appointment
     */
    public function bookAppointment(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'patient_id' => 'required|exists:patients,patient_id',
            'availability_id' => 'required|exists:availability_schedulings,availability_id'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 400);
        }

        try {
            DB::beginTransaction();

            // Check if the slot is still available
            $availability = AvailabilityScheduling::where('availability_id', $request->availability_id)
                ->where('status', 'available')
                ->first();

            if (!$availability) {
                return response()->json([
                    'success' => false,
                    'message' => 'This time slot is no longer available'
                ], 400);
            }

            // Create appointment with pending status
            $appointment = Appointment::create([
                'patient_id' => $request->patient_id,
                'availability_id' => $request->availability_id,
                'status' => 'pending'
            ]);

            // Update availability status to booked
            $availability->update(['status' => 'booked']);

            // Get doctor and patient info for notification
            $doctor = Doctor::find($availability->doctor_id);
            $patient = Patient::find($request->patient_id);

            // Create notification for doctor
            Notification::create([
                'doctor_id' => $availability->doctor_id,
                'title' => 'New Appointment Request',
                'message' => "Patient {$patient->name} has requested an appointment for {$availability->available_date} at {$availability->available_time}",
                'type' => 'appointment_request',
                'is_read' => false
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Appointment booked successfully',
                'data' => $appointment->load(['patient', 'availability.doctor'])
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to book appointment',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get appointments for a doctor
     */
    public function getDoctorAppointments(Request $request)
    {
        $doctorId = $request->user()->doctor->doctor_id;
        
        $appointments = Appointment::whereHas('availability', function($query) use ($doctorId) {
                $query->where('doctor_id', $doctorId);
            })
            ->with(['patient', 'availability'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $appointments
        ]);
    }

    /**
     * Update appointment status (for doctor)
     */
    public function updateAppointmentStatus(Request $request, $appointmentId)
    {
        $validator = Validator::make($request->all(), [
            'status' => 'required|in:pending,confirmed,completed,cancelled_by_doctor,no_show,rescheduled'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 400);
        }

        try {
            $appointment = Appointment::findOrFail($appointmentId);
            $doctorId = $request->user()->doctor->doctor_id;

            // Check if this appointment belongs to the doctor
            if ($appointment->availability->doctor_id !== $doctorId) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized to update this appointment'
                ], 403);
            }

            $appointment->update(['status' => $request->status]);

            // Create notification for patient
            $patient = $appointment->patient;
            $statusMessage = $this->getStatusMessage($request->status);
            
            Notification::create([
                'doctor_id' => $doctorId,
                'patient_id' => $patient->patient_id,
                'message' => "Your appointment status has been updated to: {$statusMessage}",
                'type' => 'appointment_update',
                'is_read' => false
            ]);

            // If cancelled or rescheduled, make the slot available again
            if (in_array($request->status, ['cancelled_by_doctor', 'rescheduled'])) {
                $appointment->availability->update(['status' => 'available']);
            }

            return response()->json([
                'success' => true,
                'message' => 'Appointment status updated successfully',
                'data' => $appointment->load(['patient', 'availability'])
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update appointment status',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get status message for notifications
     */
    private function getStatusMessage($status)
    {
        $messages = [
            'pending' => 'Pending Confirmation',
            'confirmed' => 'Confirmed',
            'completed' => 'Completed',
            'cancelled_by_doctor' => 'Cancelled by Doctor',
            'cancelled_by_patient' => 'Cancelled by Patient',
            'no_show' => 'No Show',
            'rescheduled' => 'Rescheduled'
        ];

        return $messages[$status] ?? $status;
    }
}
