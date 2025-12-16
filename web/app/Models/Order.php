<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'shopify_id',
        'name',
        'email',
        'total_price',
        'currency',
        'financial_status',
        'fulfillment_status',
        'created_at_shopify',
        'shop_id',
        'synced_at',
    ];

    protected $casts = [
        'total_price' => 'decimal:2',
        'created_at_shopify' => 'datetime',
        'synced_at' => 'datetime',
    ];

    public function scopePaid($query)
    {
        return $query->where('financial_status', 'PAID');
    }

    public function scopePending($query)
    {
        return $query->where('financial_status', 'PENDING');
    }
}
