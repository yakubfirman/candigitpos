<?php

namespace App\Http\Requests;

use App\Enums\PaymentMethod;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreTransactionRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'subtotal' => ['required', 'numeric', 'min:0'],
            'discount_amount' => ['nullable', 'numeric', 'min:0'],
            'tax_amount' => ['nullable', 'numeric', 'min:0'],
            'total' => ['required', 'numeric', 'min:0'],
            'payment_method' => ['required', Rule::enum(PaymentMethod::class)],
            'amount_paid' => ['required', 'numeric', 'min:' . $this->input('total', 0)],
            'customer_name' => ['nullable', 'string', 'max:255'],
            'table_number' => ['required_if:order_type,dine_in', 'nullable', 'string', 'max:50'],
            'order_type' => ['nullable', 'in:dine_in,take_away'],
            'notes' => ['nullable', 'string', 'max:1000'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'integer', 'exists:products,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
            'items.*.discount_percent' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'items.*.subtotal' => ['required', 'numeric', 'min:0'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'items.required' => 'Minimal harus ada 1 item dalam transaksi.',
            'items.min' => 'Minimal harus ada 1 item dalam transaksi.',
            'items.*.product_id.required' => 'Product ID harus diisi.',
            'items.*.product_id.exists' => 'Produk tidak ditemukan.',
            'items.*.quantity.required' => 'Jumlah harus diisi.',
            'items.*.quantity.min' => 'Jumlah minimal 1.',
            'payment_method.required' => 'Metode pembayaran harus dipilih.',
            'payment_method.Rule::enum' => 'Metode pembayaran tidak valid.',
            'amount_paid.required' => 'Jumlah pembayaran harus diisi.',
            'amount_paid.min' => 'Jumlah pembayaran kurang dari total.',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        $this->merge([
            'discount_amount' => $this->discount_amount ?? 0,
            'tax_amount' => $this->tax_amount ?? 0,
            'order_type' => $this->order_type ?? 'dine_in',
        ]);
    }
}