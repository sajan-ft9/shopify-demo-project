<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Services\ProductSyncService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Shopify\Auth\Session;

class ProductsController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::query();

        if ($request->filled('search')) {
            $query->where('title', 'like', '%' . $request->search . '%');
        }

        if ($request->filled('status') && in_array($request->status, ['active', 'draft', 'archived'])) {
            $query->where('status', $request->status);
        }

        /** @var Session $session */
        $session = $request->get('shopifySession');
        $query->where('shop_id', $session->getShop());

        $perPage = $request->get('per_page', 10);
        $products = $query->paginate($perPage);

        return response()->json([
            'data' => $products->items(),
            'meta' => [
                'current_page' => $products->currentPage(),
                'last_page' => $products->lastPage(),
                'total' => $products->total(),
                'per_page' => $products->perPage(),
            ],
        ]);
    }

    public function sync(Request $request)
    {
        try {
            /** @var Session $session */
            $session = $request->get('shopifySession');
            $service = new ProductSyncService($session);
            $result = $service->syncAll();

            return response()->json([
                'success' => true,
                'message' => "Synced {$result['synced_count']} products successfully.",
            ]);
        } catch (\Exception $e) {
            Log::error('Product sync failed: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Sync failed: ' . $e->getMessage(),
            ], 500);
        }
    }
}
