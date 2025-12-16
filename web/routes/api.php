<?php

use App\Http\Controllers\Api\ProductsController;
use Illuminate\Support\Facades\Route;

/*
|-----------------------------------------------------use App\Http\Controllers\;
---------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::get('/', function () {
    return "Hello API";
});


Route::middleware(['shopify.auth'])->group(function () {
    Route::get('products', [ProductsController::class, 'index']);
    Route::post('products/sync', [ProductsController::class, 'sync']);

    Route::get('orders', [App\Http\Controllers\Api\OrdersController::class, 'index']);
    Route::post('orders/sync', [App\Http\Controllers\Api\OrdersController::class, 'sync']);

    Route::get('collections', [App\Http\Controllers\Api\CollectionsController::class, 'index']);
    Route::post('collections/sync', [App\Http\Controllers\Api\CollectionsController::class, 'sync']);
});
