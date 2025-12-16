<?php

namespace App\Services;

use App\Models\Collection;
use Shopify\Auth\Session;
use Illuminate\Pagination\LengthAwarePaginator;

class CollectionService
{
    protected ?Session $session;

    public function __construct(?Session $session = null)
    {
        $this->session = $session;
    }

    public function list(array $filters = [], int $perPage = 10): LengthAwarePaginator
    {
        $query = Collection::query();

        if (!empty($filters['search'])) {
            $query->where('title', 'like', '%' . $filters['search'] . '%');
        }

        if ($this->session) {
            $query->where('shop_id', $this->session->getShop());
        }

        return $query->paginate($perPage);
    }
}
