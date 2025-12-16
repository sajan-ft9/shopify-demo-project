<?php

declare(strict_types=1);

namespace App\Lib\Handlers\Products;

use App\Models\Product;
use Illuminate\Support\Facades\Log;
use Shopify\Webhooks\Handler;

class ProductsDelete implements Handler
{
    public function handle(string $topic, string $shop, array $body): void
    {
        Log::debug("Handling PRODUCTS_DELETE for $shop");

        try {
            $shopifyId = $body['id'];

            Product::where('shopify_id', $shopifyId)->delete();

            Log::debug("Product $shopifyId deleted locally.");
        } catch (\Exception $e) {
            Log::error("Failed to handle PRODUCTS_DELETE: " . $e->getMessage());
        }
    }
}
