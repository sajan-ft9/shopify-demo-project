<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Services\OrderService;
use App\Services\OrderSyncService;
use Illuminate\Http\Request;
use App\Http\Responses\ApiResponse;
use Shopify\Auth\Session;
use Illuminate\Support\Facades\Log;

class OrdersController extends Controller
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

            $service = new OrderService($session);

            $filters = $request->only(['search', 'financial_status']);
            $perPage = (int) $request->get('per_page', 10);

            $orders = $service->list($filters, $perPage);

            $ordersTransformed = OrderResource::collection($orders);

            return $this->paginated($orders, 'Orders fetched successfully.', $ordersTransformed);
        } catch (\Exception $e) {
            Log::error('Fetching orders failed: ' . $e->getMessage());

            return $this->error('Failed to fetch orders: ' . $e->getMessage(), 500);
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

            $syncService = new OrderSyncService($session);
            $result = $syncService->syncAll();

            return $this->success([
                'synced_count' => $result,
            ], $result . " Orders synced successfully.");
        } catch (\Exception $e) {
            Log::error('Order sync failed: ' . $e->getMessage());

            return $this->error('Sync failed: ' . $e->getMessage(), 500);
        }
    }
}
