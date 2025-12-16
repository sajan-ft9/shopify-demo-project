<?php

namespace App\Services;

use App\Models\Order;
use Shopify\Auth\Session;
use Illuminate\Pagination\LengthAwarePaginator;

class OrderService
{
    protected ?Session $session;

    public function __construct(?Session $session = null)
    {
        $this->session = $session;
    }

    public function list(array $filters = [], int $perPage = 10): LengthAwarePaginator
    {
        $query = Order::query();

        if (!empty($filters['search'])) {
            $query->where('name', 'like', '%' . $filters['search'] . '%');
        }

        if (!empty($filters['financial_status'])) {
            $query->where('financial_status', $filters['financial_status']);
        }

        if ($this->session) {
            $query->where('shop_id', $this->session->getShop());
        }

        return $query->paginate($perPage);
    }
}
