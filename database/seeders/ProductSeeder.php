<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $products = [
            // Makanan
            ['category' => 'Makanan', 'name' => 'Nasi Goreng', 'price' => 25000, 'cost_price' => 15000, 'stock' => 50, 'min_stock' => 10, 'unit' => 'porsi'],
            ['category' => 'Makanan', 'name' => 'Mie Goreng', 'price' => 22000, 'cost_price' => 13000, 'stock' => 45, 'min_stock' => 10, 'unit' => 'porsi'],
            ['category' => 'Makanan', 'name' => 'Ayam Geprek', 'price' => 28000, 'cost_price' => 17000, 'stock' => 40, 'min_stock' => 8, 'unit' => 'porsi'],
            ['category' => 'Makanan', 'name' => 'Sate Ayam', 'price' => 30000, 'cost_price' => 18000, 'stock' => 35, 'min_stock' => 8, 'unit' => 'porsi'],
            ['category' => 'Makanan', 'name' => 'Soto Ayam', 'price' => 20000, 'cost_price' => 12000, 'stock' => 55, 'min_stock' => 10, 'unit' => 'porsi'],

            // Minuman
            ['category' => 'Minuman', 'name' => 'Es Teh Manis', 'price' => 5000, 'cost_price' => 2000, 'stock' => 100, 'min_stock' => 20, 'unit' => 'gelas'],
            ['category' => 'Minuman', 'name' => 'Es Jeruk', 'price' => 8000, 'cost_price' => 3500, 'stock' => 80, 'min_stock' => 15, 'unit' => 'gelas'],
            ['category' => 'Minuman', 'name' => 'Kopi Hitam', 'price' => 12000, 'cost_price' => 5000, 'stock' => 60, 'min_stock' => 10, 'unit' => 'gelas'],
            ['category' => 'Minuman', 'name' => 'Cappuccino', 'price' => 18000, 'cost_price' => 8000, 'stock' => 45, 'min_stock' => 10, 'unit' => 'gelas'],
            ['category' => 'Minuman', 'name' => 'Jus Mangga', 'price' => 15000, 'cost_price' => 7000, 'stock' => 50, 'min_stock' => 10, 'unit' => 'gelas'],

            // Snack
            ['category' => 'Snack', 'name' => 'Pisang Goreng', 'price' => 8000, 'cost_price' => 4000, 'stock' => 40, 'min_stock' => 10, 'unit' => 'porsi'],
            ['category' => 'Snack', 'name' => 'Tahu Crispy', 'price' => 7000, 'cost_price' => 3500, 'stock' => 35, 'min_stock' => 8, 'unit' => 'porsi'],
            ['category' => 'Snack', 'name' => 'Bakwan Jagung', 'price' => 6000, 'cost_price' => 3000, 'stock' => 30, 'min_stock' => 8, 'unit' => 'porsi'],

            // Dessert
            ['category' => 'Dessert', 'name' => 'Es Krim Vanilla', 'price' => 15000, 'cost_price' => 8000, 'stock' => 25, 'min_stock' => 5, 'unit' => 'porsi'],
            ['category' => 'Dessert', 'name' => 'Pudding Coklat', 'price' => 12000, 'cost_price' => 6000, 'stock' => 20, 'min_stock' => 5, 'unit' => 'porsi'],

            // Paket Hemat
            ['category' => 'Paket Hemat', 'name' => 'Paket Nasi + Es Teh', 'price' => 28000, 'cost_price' => 17000, 'stock' => 30, 'min_stock' => 5, 'unit' => 'paket'],
            ['category' => 'Paket Hemat', 'name' => 'Paket Mie + Es Jeruk', 'price' => 25000, 'cost_price' => 15000, 'stock' => 25, 'min_stock' => 5, 'unit' => 'paket'],
        ];

        foreach ($products as $productData) {
            $category = Category::where('name', $productData['category'])->first();
            if ($category) {
                Product::firstOrCreate(
                    ['slug' => \Illuminate\Support\Str::slug($productData['name'])],
                    [
                        'category_id' => $category->id,
                        'name' => $productData['name'],
                        'slug' => \Illuminate\Support\Str::slug($productData['name']),
                        'price' => $productData['price'],
                        'cost_price' => $productData['cost_price'],
                        'stock' => $productData['stock'],
                        'min_stock' => $productData['min_stock'],
                        'unit' => $productData['unit'],
                        'is_active' => true,
                    ]
                );
            }
        }
    }
}