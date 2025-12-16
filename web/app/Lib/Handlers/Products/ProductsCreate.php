<?php

declare(strict_types=1);

namespace App\Lib\Handlers\Products;

use App\Models\Product;
use Illuminate\Support\Facades\Log;
use Shopify\Webhooks\Handler;

class ProductsCreate implements Handler
{
    public function handle(string $topic, string $shop, array $body): void
    {
        Log::info("Handling PRODUCTS_CREATE for $shop");

        try {
            $shopifyId = $body['id'];

            $productData = [
                'shopify_id' => $shopifyId,
                'title' => $body['title'] ?? '',
                'description' => $body['body_html'] ?? '',
                'handle' => $body['handle'] ?? '',
                'status' => $body['status'] ?? 'active',
                'vendor' => $body['vendor'] ?? '',
                'product_type' => $body['product_type'] ?? '',
                'price' => $body['variants'][0]['price'] ?? 0.00,
                'images' => $body['images'] ?? [],
                'variants' => $body['variants'] ?? [],
                'synced_at' => now(),
            ];

            Product::updateOrCreate(
                ['shopify_id' => $shopifyId],
                $productData
            );

            Log::debug("Product $shopifyId created locally.");
        } catch (\Exception $e) {
            Log::error("Failed to handle PRODUCTS_CREATE: " . $e->getMessage());
        }
    }
}
