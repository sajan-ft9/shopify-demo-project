<?php

namespace App\Services;

use App\Models\Collection;
use Shopify\Auth\Session;
use Shopify\Clients\Graphql;

class CollectionSyncService
{
    protected Graphql $client;
    protected Session $session;

    public function __construct(Session $session)
    {
        $this->session = $session;
        $this->client = new Graphql($session->getShop(), $session->getAccessToken());
    }

    public function syncAll(): int
    {
        $syncedCount = 0;
        $after = null;
        $hasNextPage = true;

        $query = <<<'GRAPHQL'
        query ($first: Int!, $after: String) {
            collections(first: $first, after: $after) {
                edges {
                    node {
                        id
                        title
                        handle
                        descriptionHtml
                        sortOrder
                        image {
                            url
                        }
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

            $edges = $response['data']['collections']['edges'] ?? [];
            $pageInfo = $response['data']['collections']['pageInfo'] ?? [];

            foreach ($edges as $edge) {
                $this->upsertCollection($edge['node']);
                $syncedCount++;
            }

            $hasNextPage = $pageInfo['hasNextPage'] ?? false;
            $after = $pageInfo['endCursor'] ?? null;
        }

        return $syncedCount;
    }

    protected function upsertCollection(array $node)
    {
        $shopifyId = $node['id'];
        $image = data_get($node, 'image.url');

        return Collection::updateOrCreate(
            ['shopify_id' => $shopifyId, 'shop_id' => $this->session->getShop()],
            [
                'title' => $node['title'],
                'handle' => $node['handle'],
                'description' => strip_tags($node['descriptionHtml']),
                'sort_order' => $node['sortOrder'],
                'image' => $image,
                'synced_at' => now(),
            ]
        );
    }
}
