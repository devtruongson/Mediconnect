<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use App\Models\Doctor;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $mediUser = $request->user();
        $doctor = Doctor::where('user_id', $mediUser->user_id)->first();
        
        if (!$doctor) {
            return response()->json(['error' => 'Doctor not found'], 404);
        }
        
        $notifications = Notification::where('doctor_id', $doctor->doctor_id)
            ->latest()
            ->get(['id', 'message', 'type', 'is_read', 'created_at']);

        return response()->json([
            'success' => true,
            'data' => $notifications
        ]);
    }

    public function markAsRead(Request $request, $notificationId)
    {
        $mediUser = $request->user();
        $doctor = Doctor::where('user_id', $mediUser->user_id)->first();
        
        if (!$doctor) {
            return response()->json(['error' => 'Doctor not found'], 404);
        }

        $notification = Notification::where('id', $notificationId)
            ->where('doctor_id', $doctor->doctor_id)
            ->first();

        if (!$notification) {
            return response()->json(['error' => 'Notification not found'], 404);
        }

        $notification->update(['is_read' => true]);

        return response()->json([
            'success' => true,
            'message' => 'Notification marked as read'
        ]);
    }

    public function markAllAsRead(Request $request)
    {
        $mediUser = $request->user();
        $doctor = Doctor::where('user_id', $mediUser->user_id)->first();
        
        if (!$doctor) {
            return response()->json(['error' => 'Doctor not found'], 404);
        }

        Notification::where('doctor_id', $doctor->doctor_id)
            ->where('is_read', false)
            ->update(['is_read' => true]);

        return response()->json([
            'success' => true,
            'message' => 'All notifications marked as read'
        ]);
    }
}
