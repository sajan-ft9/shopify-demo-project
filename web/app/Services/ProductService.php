<?php

namespace App\Services;

use App\Models\Product;
use Shopify\Auth\Session;
use Illuminate\Pagination\LengthAwarePaginator;

class ProductService
{
    protected ?Session $session;

    public function __construct(?Session $session = null)
    {
        $this->session = $session;
    }

    public function list(array $filters = [], int $perPage = 10): LengthAwarePaginator
    {
        $query = Product::query();

        if (!empty($filters['search'])) {
            $query->where('title', 'like', '%' . $filters['search'] . '%');
        }

        if (!empty($filters['status']) && in_array($filters['status'], ['active', 'draft', 'archived'])) {
            $query->where('status', $filters['status']);
        }

        if ($this->session) {
            $query->where('shop_id', $this->session->getShop());
        }

        return $query->paginate($perPage);
    }
}
