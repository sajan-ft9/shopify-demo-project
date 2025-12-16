<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'shopify_id',
        'title',
        'description',
        'handle',
        'status',
        'vendor',
        'product_type',
        'price',
        'images',
        'variants',
        'shop_id',
        'synced_at',
    ];

    protected $casts = [
        'images' => 'array',
        'variants' => 'array',
        'synced_at' => 'datetime',
        'price' => 'decimal:2',
    ];

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeDraft($query)
    {
        return $query->where('status', 'draft');
    }

    public function scopeArchived($query)
    {
        return $query->where('status', 'archived');
    }
}
