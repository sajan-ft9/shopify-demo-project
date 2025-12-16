<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\CollectionResource;
use App\Services\CollectionService;
use App\Services\CollectionSyncService;
use Illuminate\Http\Request;
use App\Http\Responses\ApiResponse;
use Shopify\Auth\Session;
use Illuminate\Support\Facades\Log;

class CollectionsController extends Controller
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

            $service = new CollectionService($session);

            $filters = $request->only(['search']);
            $perPage = (int) $request->get('per_page', 10);

            $collections = $service->list($filters, $perPage);

            $collectionsTransformed = CollectionResource::collection($collections);

            return $this->paginated($collections, 'Collections fetched successfully.', $collectionsTransformed);
        } catch (\Exception $e) {
            Log::error('Fetching collections failed: ' . $e->getMessage());

            return $this->error('Failed to fetch collections: ' . $e->getMessage(), 500);
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

            $syncService = new CollectionSyncService($session);
            $syncedCount = $syncService->syncAll();

            return $this->success(
                ['synced_count' => $syncedCount],
                $syncedCount . ' Collections synced successfully.'
            );
        } catch (\Exception $e) {
            Log::error('Collection sync failed', [
                'error' => $e->getMessage(),
            ]);

            return $this->error('Sync failed: ' . $e->getMessage(), 500);
        }
    }
}
