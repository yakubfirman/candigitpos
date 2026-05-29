<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Transaction;
use App\Models\TransactionItem;
use App\Models\Product;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Str;

class DummyTransactionSeeder extends Seeder
{
    public function run()
    {
        $admin = User::first();
        if (!$admin) {
            $this->command->error('No users found.');
            return;
        }

        $products = Product::all();
        if ($products->isEmpty()) {
            $this->command->error('No products found.');
            return;
        }

        $paymentMethods = ['cash', 'qris', 'transfer', 'kartu'];
        $statuses = ['completed', 'completed', 'completed', 'completed', 'cancelled'];

        // Generate data for the last 90 days
        $endDate = Carbon::now();
        $startDate = Carbon::now()->subDays(90);

        $currentDate = clone $startDate;

        $this->command->info('Generating dummy transactions...');

        while ($currentDate <= $endDate) {
            // Generate 1 to 5 transactions per day
            $dailyTransactions = rand(1, 5);

            for ($i = 0; $i < $dailyTransactions; $i++) {
                // Random time within the day (08:00 to 22:00)
                $transactionTime = $currentDate->copy()->addHours(rand(8, 21))->addMinutes(rand(0, 59));

                $status = $statuses[array_rand($statuses)];
                $paymentMethod = $paymentMethods[array_rand($paymentMethods)];
                
                // Invoice number format: INV-YYYYMMDD-XXXX
                $invoiceNumber = 'INV-' . $transactionTime->format('Ymd') . '-' . strtoupper(Str::random(4));

                $transaction = Transaction::create([
                    'user_id' => $admin->id,
                    'invoice_number' => $invoiceNumber,
                    'subtotal' => 0,
                    'tax_amount' => 0,
                    'discount_amount' => 0,
                    'total' => 0,
                    'amount_paid' => 0,
                    'change_amount' => 0,
                    'payment_method' => $paymentMethod,
                    'status' => $status,
                    'notes' => rand(1, 10) > 8 ? 'Pesanan dari Dummy Seeder' : null,
                    'created_at' => $transactionTime,
                    'updated_at' => $transactionTime,
                ]);

                // Generate 1 to 4 items per transaction
                $numItems = rand(1, 4);
                $selectedProducts = $products->random($numItems);
                $subtotal = 0;

                foreach ($selectedProducts as $product) {
                    $qty = rand(1, 3);
                    $price = $product->price;
                    $itemTotal = $price * $qty;
                    $subtotal += $itemTotal;

                    TransactionItem::create([
                        'transaction_id' => $transaction->id,
                        'product_id' => $product->id,
                        'product_name' => $product->name,
                        'product_price' => $price,
                        'quantity' => $qty,
                        'subtotal' => $itemTotal,
                        'created_at' => $transactionTime,
                        'updated_at' => $transactionTime,
                    ]);
                }

                // Update transaction totals
                $tax = $subtotal * 0.11; // Assuming 11% tax for realism, or we can leave it 0
                $tax = 0; // Let's keep it 0 as the system might not use tax yet
                $discount = rand(1, 10) > 8 ? ($subtotal * 0.05) : 0; // Occasional 5% discount
                $total = $subtotal + $tax - $discount;

                $amountPaid = $paymentMethod === 'cash' ? ceil($total / 50000) * 50000 : $total;
                if ($amountPaid < $total) $amountPaid = $total;

                $transaction->update([
                    'subtotal' => $subtotal,
                    'tax_amount' => $tax,
                    'discount_amount' => $discount,
                    'total' => $total,
                    'amount_paid' => $amountPaid,
                    'change_amount' => max(0, $amountPaid - $total),
                ]);
            }

            $currentDate->addDay();
        }

        $this->command->info('Dummy transactions generated successfully!');
    }
}
