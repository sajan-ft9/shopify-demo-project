<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'shopify_id' => $this->shopify_id,
            'name' => $this->name,
            'email' => $this->email,
            'total_price' => $this->total_price ? (float) $this->total_price : null,
            'currency' => $this->currency,
            'financial_status' => $this->financial_status,
            'fulfillment_status' => $this->fulfillment_status,
            'created_at_shopify' => $this->created_at_shopify?->toIso8601String(),
            'synced_at' => $this->synced_at?->toIso8601String(),
        ];
    }
}
