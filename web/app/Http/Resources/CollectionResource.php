<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class CollectionResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'shopify_id' => $this->shopify_id,
            'title' => $this->title,
            'handle' => $this->handle,
            'description' => $this->description,
            'image' => $this->image,
            'sort_order' => $this->sort_order,
            'synced_at' => $this->synced_at?->toIso8601String(),
        ];
    }
}
