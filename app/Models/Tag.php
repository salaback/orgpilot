<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphToMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Tag extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'customer_id',
    ];

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function initiatives(): MorphToMany
    {
        return $this->morphedByMany(Initiative::class, 'taggable');
    }

    public function goals(): MorphToMany
    {
        return $this->morphedByMany(Goal::class, 'taggable');
    }

    public function orgNodes(): MorphToMany
    {
        return $this->morphedByMany(OrgNode::class, 'taggable');
    }
}

