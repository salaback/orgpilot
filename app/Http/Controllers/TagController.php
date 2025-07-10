<?php
namespace App\Http\Controllers;

use App\Models\Tag;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\JsonResponse;

class TagController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $customer = $request->user()->customer;
        if (!$customer) {
            return response()->json(['error' => 'No customer found for user'], 403);
        }
        $tags = Tag::where('customer_id', $customer->id)->get();
        return response()->json($tags);
    }

    public function store(Request $request)
    {
        $customer = $request->user()->customer;
        if (!$customer) {
            if ($request->expectsJson()) {
                return response()->json(['error' => 'No customer found for user'], 403);
            }
            return redirect()->back()->with('error', 'No customer found for user');
        }
        $validated = $request->validate([
            'name' => 'required|string|max:255',
        ]);
        // Store original casing, but search in lowercase for uniqueness
        $tagName = mb_strtolower($validated['name']);
        $tag = Tag::where('customer_id', $customer->id)
            ->whereRaw('LOWER(name) = ?', [$tagName])
            ->first();
        if (!$tag) {
            $tag = Tag::create([
                'customer_id' => $customer->id,
                'name' => $validated['name'], // store original casing
            ]);
        }
        if ($request->expectsJson()) {
            return response()->json($tag, 201);
        }
        return redirect()->back()->with('tag', $tag);
    }

    public function attach(Request $request, $type, $id): JsonResponse
    {
        $customer = $request->user()->customer;
        $validated = $request->validate([
            'tag_id' => 'required|exists:tags,id',
        ]);
        $model = $this->resolveTaggable($type, $id, $customer->id);
        $model->tags()->syncWithoutDetaching([$validated['tag_id']]);
        return response()->json(['success' => true]);
    }

    public function detach(Request $request, $type, $id): JsonResponse
    {
        $customer = $request->user()->customer;
        $validated = $request->validate([
            'tag_id' => 'required|exists:tags,id',
        ]);
        $model = $this->resolveTaggable($type, $id, $customer->id);
        $model->tags()->detach($validated['tag_id']);
        return response()->json(['success' => true]);
    }

    public function show(Request $request, $type, $id): JsonResponse
    {
        $customer = $request->user()->customer;
        $model = $this->resolveTaggable($type, $id, $customer->id);
        $tags = $model->tags()->where('customer_id', $customer->id)->get();
        return response()->json($tags);
    }

    private function resolveTaggable($type, $id, $customerId): Model
    {
        $map = [
            'initiative' => \App\Models\Initiative::class,
            'goal' => \App\Models\Goal::class,
            'orgnode' => \App\Models\Employee::class, // Updated to use Employee instead of OrgNode
            'employee' => \App\Models\Employee::class, // Added new key for explicit 'employee' references
        ];
        $type = strtolower($type);
        if (!isset($map[$type])) {
            abort(404, 'Invalid taggable type');
        }
        $model = $map[$type]::where('id', $id)
            ->where('org_structure_id', $customerId)
            ->firstOrFail();
        return $model;
    }
}
