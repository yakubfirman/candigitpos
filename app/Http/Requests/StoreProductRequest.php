<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreProductRequest extends FormRequest
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
        $productId = $this->route('product')?->id;

        return [
            'category_id' => ['required', 'integer', 'exists:categories,id'],
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', 'unique:products,slug' . ($productId ? ",$productId" : '')],
            'barcode' => ['nullable', 'string', 'max:100', 'unique:products,barcode' . ($productId ? ",$productId" : '')],
            'description' => ['nullable', 'string'],
            'price' => ['required', 'numeric', 'min:0', 'max:999999999999'],
            'cost_price' => ['nullable', 'numeric', 'min:0', 'max:999999999999'],
            'stock' => ['nullable', 'integer', 'min:0'],
            'min_stock' => ['nullable', 'integer', 'min:0'],
            'unit' => ['nullable', 'string', 'max:50'],
            'image' => ['nullable', 'image', 'mimes:jpeg,png,jpg,gif,webp', 'max:2048'],
            'is_active' => ['nullable', 'boolean'],
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
            'category_id.required' => 'Kategori harus dipilih.',
            'category_id.exists' => 'Kategori yang dipilih tidak valid.',
            'name.required' => 'Nama produk harus diisi.',
            'price.required' => 'Harga harus diisi.',
            'price.numeric' => 'Harga harus berupa angka.',
            'barcode.unique' => 'Barcode sudah digunakan.',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        $this->merge([
            'is_active' => $this->boolean('is_active'),
            'stock' => $this->stock ?? 0,
            'min_stock' => $this->min_stock ?? 5,
            'cost_price' => $this->cost_price ?? 0,
            'unit' => $this->unit ?? 'pcs',
        ]);
    }
}