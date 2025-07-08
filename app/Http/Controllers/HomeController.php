<?php

namespace App\Http\Controllers;

use App\Models\Goal;
use App\Models\Initiative;
use App\Models\Meeting;
use App\Models\Task;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    /**
     * Display the welcome page.
     */
    public function index()
    {
        if (auth()->check()) {
            return redirect()->route('dashboard');
        }
        return redirect()->route('login');
    }

    /**
     * Display the dashboard.
     */
    public function dashboard(): Response
    {
        $user = Auth::user();

        // Get today's one-on-one meetings (both as manager and direct report)
        $today = Carbon::today();
        $tomorrow = Carbon::tomorrow();

        $meetings = Meeting::with(['createdBy', 'participants'])
            ->where('type', Meeting::TYPE_ONE_ON_ONE)
            ->where(function($query) use ($user) {
                $query->where('created_by', $user->id)
                      ->orWhereHas('participants', function($q) use ($user) {
                          $q->where('users.id', $user->id);
                      });
            })
            ->whereBetween('meeting_time', [$today, $tomorrow])
            ->where('status', Meeting::STATUS_SCHEDULED)
            ->orderBy('meeting_time')
            ->get();

        // Get action items due soon (next 7 days) or overdue
        // Get tasks assigned to employees in the user's organization structures
        $actionItems = Task::with('assignedTo')
            ->whereHas('assignedTo', function($query) use ($user) {
                $query->whereHas('orgStructure', function($q) use ($user) {
                    $q->where('user_id', $user->id);
                });
            })
            ->where('status', '!=', 'completed')
            ->where(function($query) use ($today) {
                $query->where('due_date', '<=', $today->copy()->addDays(7))
                      ->orWhere('due_date', '<', $today);
            })
            ->orderBy('due_date')
            ->limit(5)
            ->get();

        // Get active goals from employees in the user's organization structures
        $goals = Goal::whereHas('employee', function($query) use ($user) {
                $query->whereHas('orgStructure', function($q) use ($user) {
                    $q->where('user_id', $user->id);
                });
            })
            ->where('status', 'active')
            ->orderBy('due_date')
            ->limit(3)
            ->get();

        // Get initiatives from the user's organization structures
        $initiatives = Initiative::whereHas('orgStructure', function($query) use ($user) {
                $query->where('user_id', $user->id);
            })
            ->orderBy('updated_at', 'desc')
            ->limit(3)
            ->get();



        return Inertia::render('dashboard', [
            'meetings' => $meetings,
            'actionItems' => $actionItems,
            'goals' => $goals,
            'initiatives' => $initiatives
        ]);
    }
}
