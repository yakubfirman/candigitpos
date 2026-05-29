<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('barcode')->nullable()->unique();
            $table->text('description')->nullable();
            $table->decimal('price', 12, 2);
            $table->decimal('cost_price', 12, 2)->default(0);
            $table->integer('stock')->default(0);
            $table->integer('min_stock')->default(5);
            $table->string('unit', 50)->default('pcs');
            $table->string('image')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['category_id', 'is_active']);
            $table->index(['stock', 'min_stock']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};