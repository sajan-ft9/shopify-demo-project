<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateProductsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('shopify_id')->unique();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('handle')->unique();
            $table->string('status');
            $table->string('vendor')->nullable();
            $table->string('product_type')->nullable();
            $table->decimal('price', 10, 2)->nullable();
            $table->json('images')->nullable();
            $table->json('variants')->nullable();
            $table->string('shop_id')->index();
            $table->timestamp('synced_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('products');
    }
}
