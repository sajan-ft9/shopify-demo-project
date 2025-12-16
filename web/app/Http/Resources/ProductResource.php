<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'shopify_id' => $this->shopify_id,
            'title' => $this->title,
            'handle' => $this->handle,
            'description' => $this->description,
            'status' => $this->status,
            'vendor' => $this->vendor,
            'product_type' => $this->product_type,
            'price' => $this->price ? (float) $this->price : null,
            'images' => $this->images ?? [],
            'synced_at' => $this->synced_at?->toIso8601String(),
        ];
    }
}
