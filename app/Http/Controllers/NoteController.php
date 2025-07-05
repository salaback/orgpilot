<?php

namespace App\Http\Controllers;

use App\Models\Note;
use App\Models\Task;
use App\Models\Initiative;
use App\Models\Employee;
use App\Models\Tag;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class NoteController extends Controller
{
    /**
     * Store a note for an initiative.
     */
    public function storeForInitiative(Initiative $initiative, Request $request)
    {
        $validated = $request->validate([
            'title' => 'nullable|string|max:255',
            'content' => 'required|string',
            'tags' => 'nullable|array',
            'tags.*' => 'string|max:50',
            'mentions' => 'nullable|array',
        ]);

        // Manually validate and filter mentions to ensure only valid numeric IDs
        $mentionIds = [];
        if (!empty($validated['mentions'])) {
            foreach ($validated['mentions'] as $mention) {
                if (is_numeric($mention)) {
                    $mentionId = (int) $mention;
                    // Check if this ID exists in org_nodes table
                    if (Employee::where('id', $mentionId)->exists()) {
                        $mentionIds[] = $mentionId;
                    }
                }
            }
        }

        $note = Note::create([
            'title' => $validated['title'],
            'content' => $validated['content'],
            'notable_type' => 'App\\Models\\Initiative',
            'notable_id' => $initiative->id,
        ]);

        // Process and attach tags if they exist
        if (!empty($validated['tags'])) {
            $tagIds = [];
            foreach ($validated['tags'] as $tagName) {
                // Create or find the tag
                $tag = Tag::firstOrCreate(['name' => $tagName]);
                $tagIds[] = $tag->id;
            }

            // Attach tags to the note using the polymorphic relationship
            $note->tags()->attach($tagIds);
        }

        // Process and store mentions if they exist
        if (!empty($mentionIds)) {
            // You can store mentions in a separate table or as metadata
            // For now, we'll just log them or handle them as needed
            Log::info('Note mentions: ', $mentionIds);
        }

        return redirect()->route('initiative.show', $initiative)->with('success', 'Note created successfully');
    }

    /**
     * Store a note for a task.
     */
    public function storeForTask(Task $task, Request $request)
    {
        $validated = $request->validate([
            'title' => 'nullable|string|max:255',
            'content' => 'required|string',
            'tags' => 'nullable|array',
            'tags.*' => 'string|max:50',
        ]);

        $note = Note::create([
            'title' => $validated['title'],
            'content' => $validated['content'],
            'notable_type' => 'App\\Models\\Task',
            'notable_id' => $task->id,
        ]);

        // Process and attach tags if they exist
        if (!empty($validated['tags'])) {
            $tagIds = [];
            foreach ($validated['tags'] as $tagName) {
                $tag = Tag::firstOrCreate(['name' => $tagName]);
                $tagIds[] = $tag->id;
            }
            $note->tags()->attach($tagIds);
        }

        return redirect()->route('tasks.show', $task)->with('success', 'Note created successfully');
    }
}
