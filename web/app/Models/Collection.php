<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Collection extends Model
{
    use HasFactory;

    protected $fillable = [
        'shopify_id',
        'title',
        'description',
        'handle',
        'image',
        'sort_order',
        'shop_id',
        'synced_at',
    ];

    protected $casts = [
        'synced_at' => 'datetime',
    ];
}
