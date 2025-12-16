<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Services\ProductService;
use App\Services\ProductSyncService;
use Illuminate\Http\Request;
use App\Http\Responses\ApiResponse;
use Shopify\Auth\Session;
use Illuminate\Support\Facades\Log;

class ProductsController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        try {
            /** @var Session $session */
            $session = $request->get('shopifySession');
            if (!$session) {
                return $this->error('Shopify session not found', 401);
            }

            $service = new ProductService($session);

            $filters = $request->only(['search', 'status']);
            $perPage = (int) $request->get('per_page', 10);

            $products = $service->list($filters, $perPage);

            $productsTransformed = ProductResource::collection($products);

            return $this->paginated($products, 'Products fetched successfully.', $productsTransformed);
        } catch (\Exception $e) {
            Log::error('Fetching products failed: ' . $e->getMessage());

            return $this->error('Failed to fetch products: ' . $e->getMessage(), 500);
        }
    }


    public function sync(Request $request)
    {
        try {
            /** @var Session $session */
            $session = $request->get('shopifySession');
            if (!$session) {
                return $this->error('Shopify session not found', 401);
            }

            $syncService = new ProductSyncService($session);
            $syncedCount = $syncService->syncAll();

            return $this->success(
                ['synced_count' => $syncedCount],
                $syncedCount . ' Products synced successfully.'
            );
        } catch (\Exception $e) {
            Log::error('Product sync failed', [
                'error' => $e->getMessage(),
            ]);

            return $this->error('Sync failed: ' . $e->getMessage(), 500);
        }
    }
}
