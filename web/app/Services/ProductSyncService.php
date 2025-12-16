<?php

namespace App\Services;

use App\Models\Product;
use Shopify\Auth\Session;
use Shopify\Clients\Graphql;

class ProductSyncService
{
    protected Graphql $client;
    protected Session $session;

    public function __construct(Session $session)
    {
        $this->session = $session;
        $this->client = new Graphql($session->getShop(), $session->getAccessToken());
    }

    public function syncAll(): array
    {

        $products = [];
        $after = null;
        $hasNextPage = true;

        $query = <<<'GRAPHQL'
        query ($first: Int!, $after: String) {
            products(first: $first, after: $after) {
                edges {
                    node {
                        id
                        title
                        handle
                        descriptionHtml
                        status
                        vendor
                        productType
                        images(first: 5) {
                            edges {
                                node {
                                    url
                                }
                            }
                        }
                        variants(first: 1) {
                            edges {
                                node {
                                    price
                                }
                            }
                        }
                    }
                }
                pageInfo {
                    hasNextPage
                    endCursor
                }
            }
        }
        GRAPHQL;

        while ($hasNextPage) {
            $response = $this->client->query([
                "query" => $query,
                "variables" => [
                    "first" => 50,
                    "after" => $after,
                ],
            ])->getDecodedBody();

            $edges = $response['data']['products']['edges'] ?? [];
            $pageInfo = $response['data']['products']['pageInfo'] ?? [];

            foreach ($edges as $edge) {
                $node = $edge['node'];
                $products[] = $this->upsertProduct($node);
            }

            $hasNextPage = $pageInfo['hasNextPage'] ?? false;
            $after = $pageInfo['endCursor'] ?? null;
        }

        return ['synced_count' => count($products)];
    }

    protected function upsertProduct(array $node): Product
    {
        $shopifyId = $node['id'];
        $price = $node['variants']['edges'][0]['node']['price'] ?? null;
        $images = collect($node['images']['edges'])->pluck('node.url')->toArray();

        return Product::updateOrCreate(
            ['shopify_id' => $shopifyId],
            [
                'title' => $node['title'],
                'handle' => $node['handle'],
                'description' => strip_tags($node['descriptionHtml']),
                'status' => strtolower($node['status']),
                'vendor' => $node['vendor'],
                'product_type' => $node['productType'],
                'price' => $price,
                'images' => $images,
                'shop_id' => $this->session->getShop(),
                'synced_at' => now(),
            ]
        );
    }
}
