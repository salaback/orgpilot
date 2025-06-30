<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Note;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class NoteController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Note::query();

        // Filter by entity if provided
        if ($request->has('notable_type') && $request->has('notable_id')) {
            $query->where('notable_type', $request->notable_type)
                  ->where('notable_id', $request->notable_id);
        }

        $notes = $query->orderBy('created_at', 'desc')->get();

        return response()->json($notes);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'title' => 'nullable|string|max:255',
                'content' => 'required|string',
                'notable_type' => 'required|string',
                'notable_id' => 'required|integer',
            ]);

            $note = Note::create($validated);

            // If this is an Inertia request, redirect back with success
            if ($request->header('X-Inertia')) {
                return redirect()->back()->with('success', 'Note created successfully');
            }

            return response()->json($note, 201);
        } catch (ValidationException $e) {
            if ($request->header('X-Inertia')) {
                return redirect()->back()->withErrors($e->errors());
            }
            return response()->json(['errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            if ($request->header('X-Inertia')) {
                return redirect()->back()->withErrors(['error' => 'Failed to create note']);
            }
            return response()->json(['error' => 'Failed to create note'], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Note $note): JsonResponse
    {
        return response()->json($note);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Note $note): JsonResponse
    {
        try {
            $validated = $request->validate([
                'title' => 'nullable|string|max:255',
                'content' => 'required|string',
            ]);

            $note->update($validated);

            return response()->json($note);
        } catch (ValidationException $e) {
            return response()->json(['errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to update note'], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Note $note): JsonResponse
    {
        try {
            $note->delete();
            return response()->json(['message' => 'Note deleted successfully']);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to delete note'], 500);
        }
    }
}
