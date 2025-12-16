<?php

namespace App\Http\Responses;

use Illuminate\Http\JsonResponse;

trait ApiResponse
{
    public function success($data = [], $message = 'Success', $status = 200)
    {
        return response()->json(array_merge([
            'success' => true,
            'message' => $message,
        ], is_array($data) ? $data : ['data' => $data]), $status);
    }

    public function error($message = 'Error', $status = 400, $data = [])
    {
        return response()->json(array_merge([
            'success' => false,
            'message' => $message,
        ], $data), $status);
    }

    public function paginated($paginator, $message = ''): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => $paginator->items(),
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
            ],
        ]);
    }
}
