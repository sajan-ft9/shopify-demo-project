<?php

namespace App\Services;

use App\Models\Order;
use Shopify\Auth\Session;
use Shopify\Clients\Graphql;

class OrderSyncService
{
    protected Graphql $client;
    protected Session $session;

    public function __construct(Session $session)
    {
        $this->session = $session;
        $this->client = new Graphql($session->getShop(), $session->getAccessToken());
    }

    /**
     * Sync all orders from Shopify and return count
     */
    public function syncAll(): int
    {
        $syncedCount = 0;
        $after = null;
        $hasNextPage = true;

        $query = <<<'GRAPHQL'
        query ($first: Int!, $after: String) {
            orders(first: $first, after: $after) {
                edges {
                    node {
                        id
                        name
                        email
                        totalPriceSet {
                            shopMoney {
                                amount
                                currencyCode
                            }
                        }
                        displayFinancialStatus
                        displayFulfillmentStatus
                        createdAt
                    }
                }
                pageInfo { hasNextPage endCursor }
            }
        }
        GRAPHQL;

        while ($hasNextPage) {
            $response = $this->client->query([
                'query' => $query,
                'variables' => ['first' => 50, 'after' => $after],
            ])->getDecodedBody();

            $edges = $response['data']['orders']['edges'] ?? [];
            $pageInfo = $response['data']['orders']['pageInfo'] ?? [];

            foreach ($edges as $edge) {
                $this->upsertOrder($edge['node']);
                $syncedCount++;
            }

            $hasNextPage = $pageInfo['hasNextPage'] ?? false;
            $after = $pageInfo['endCursor'] ?? null;
        }

        return $syncedCount;
    }

    protected function upsertOrder(array $node)
    {
        $shopifyId = $node['id'];
        $amount = data_get($node, 'totalPriceSet.shopMoney.amount');
        $currency = data_get($node, 'totalPriceSet.shopMoney.currencyCode');

        return Order::updateOrCreate(
            ['shopify_id' => $shopifyId, 'shop_id' => $this->session->getShop()],
            [
                'name' => $node['name'],
                'email' => $node['email'],
                'total_price' => $amount,
                'currency' => $currency,
                'financial_status' => $node['displayFinancialStatus'],
                'fulfillment_status' => $node['displayFulfillmentStatus'],
                'created_at_shopify' => $node['createdAt'],
                'synced_at' => now(),
            ]
        );
    }
}
