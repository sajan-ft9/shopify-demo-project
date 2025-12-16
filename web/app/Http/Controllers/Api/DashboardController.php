<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\Collection;
use Illuminate\Http\Request;
use App\Http\Responses\ApiResponse;

class DashboardController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        $productsCount = Product::count();
        $collectionsCount = Collection::count();
        $ordersCount = Order::count();
        $total_revenue = Order::sum('total_price');

        $lastProductSync = Product::latest('updated_at')->first()?->updated_at?->format('Y-m-d H:i:s');
        $lastCollectionSync = Collection::latest('updated_at')->first()?->updated_at?->format('Y-m-d H:i:s');
        $lastOrderSync = Order::latest('updated_at')->first()?->updated_at?->format('Y-m-d H:i:s');

        return $this->success([
            'products' => [
                'count' => $productsCount,
                'last_synced_at' => $lastProductSync,
            ],
            'collections' => [
                'count' => $collectionsCount,
                'last_synced_at' => $lastCollectionSync,
            ],
            'orders' => [
                'count' => $ordersCount,
                'last_synced_at' => $lastOrderSync,
            ],
            'total_revenue' => $total_revenue,
        ]);
    }
}
