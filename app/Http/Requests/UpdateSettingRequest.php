<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateSettingRequest extends FormRequest
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
            'store_name' => ['nullable', 'string', 'max:255'],
            'store_address' => ['nullable', 'string', 'max:500'],
            'store_phone' => ['nullable', 'string', 'max:20'],
            'tax_rate' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'discount_rate' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'receipt_header' => ['nullable', 'string', 'max:500'],
            'receipt_footer' => ['nullable', 'string', 'max:500'],
            'print_logo' => ['nullable', 'boolean'],
            'paper_size' => ['nullable', 'string', 'in:58,80'],
            'store_logo' => ['nullable', 'image', 'mimes:jpeg,png,jpg,svg', 'max:2048'],
            'store_icon' => ['nullable', 'image', 'mimes:jpeg,png,jpg,svg', 'max:2048'],
            'theme_color' => ['nullable', 'string', 'in:green,blue,violet,rose,orange,slate,teal'],
            'wa_engine_url' => ['nullable', 'string', 'max:255'],
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        $this->merge([
            'tax_rate' => $this->tax_rate ?? 0,
            'discount_rate' => $this->discount_rate ?? 0,
            'print_logo' => $this->boolean('print_logo'),
        ]);
    }
}