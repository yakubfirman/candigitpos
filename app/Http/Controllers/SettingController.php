<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateSettingRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class SettingController extends Controller
{
    /**
     * Get a setting value with a default fallback.
     */
    private function getSetting(string $key, mixed $default = null): mixed
    {
        $settings = Cache::get('app_settings', []);
        return $settings[$key] ?? $default;
    }

    /**
     * Save settings to cache (persistent via file/database cache driver).
     */
    private function saveSetting(string $key, mixed $value): void
    {
        $settings = Cache::get('app_settings', []);
        $settings[$key] = $value;
        Cache::forever('app_settings', $settings);
    }

    /**
     * Get all feature toggle settings.
     */
    public static function getFeatureSettings(): array
    {
        $settings = Cache::get('app_settings', []);
        return [
            'feature_pos'              => (bool) ($settings['feature_pos'] ?? true),
            'feature_kitchen'          => (bool) ($settings['feature_kitchen'] ?? true),
            'feature_products'         => (bool) ($settings['feature_products'] ?? true),
            'feature_categories'       => (bool) ($settings['feature_categories'] ?? true),
            'feature_transactions'     => (bool) ($settings['feature_transactions'] ?? true),
            'feature_reports'          => (bool) ($settings['feature_reports'] ?? true),
            'feature_users_management' => (bool) ($settings['feature_users_management'] ?? true),
            'feature_discount_tax'     => (bool) ($settings['feature_discount_tax'] ?? true),
            'feature_whatsapp'         => (bool) ($settings['feature_whatsapp'] ?? true),
            'feature_order_type'       => (bool) ($settings['feature_order_type'] ?? true),
        ];
    }

    public function index()
    {
        $settings = [
            'store_name'     => $this->getSetting('store_name', config('app.name', 'GreenPOS')),
            'store_address'  => $this->getSetting('store_address', ''),
            'store_phone'    => $this->getSetting('store_phone', ''),
            'tax_rate'       => (float) $this->getSetting('tax_rate', 0),
            'discount_rate'  => (float) $this->getSetting('discount_rate', 0),
            'receipt_header' => $this->getSetting('receipt_header', ''),
            'receipt_footer' => $this->getSetting('receipt_footer', 'Terima kasih atas kunjungan Anda!\nBarang yang sudah dibeli tidak dapat ditukar/dikembalikan.'),
            'print_logo'     => (bool) $this->getSetting('print_logo', true),
            'paper_size'     => $this->getSetting('paper_size', '80'),
            'store_logo'     => $this->getSetting('store_logo', null),
            'store_icon'     => $this->getSetting('store_icon', null),
            'theme_color'    => $this->getSetting('theme_color', 'green'),
            'wa_engine_url'  => $this->getSetting('wa_engine_url', 'http://127.0.0.1:3001'),
        ];

        $featureSettings = self::getFeatureSettings();

        return Inertia::render('Settings/Index', [
            'settings'        => $settings,
            'featureSettings' => $featureSettings,
        ]);
    }

    public function update(UpdateSettingRequest $request)
    {
        $validated = $request->validated();

        if ($request->hasFile('store_logo')) {
            // Hapus logo lama jika ada
            $oldLogo = $this->getSetting('store_logo');
            if ($oldLogo && Storage::disk('public')->exists($oldLogo)) {
                Storage::disk('public')->delete($oldLogo);
            }

            // Simpan logo baru
            $path = $request->file('store_logo')->store('logos', 'public');
            $validated['store_logo'] = $path;
        } else {
            // Jangan timpa logo lama dengan null jika tidak ada upload baru
            unset($validated['store_logo']);
        }

        if ($request->hasFile('store_icon')) {
            // Hapus ikon lama jika ada
            $oldIcon = $this->getSetting('store_icon');
            if ($oldIcon && Storage::disk('public')->exists($oldIcon)) {
                Storage::disk('public')->delete($oldIcon);
            }

            // Simpan ikon baru
            $iconPath = $request->file('store_icon')->store('logos', 'public');
            $validated['store_icon'] = $iconPath;
        } else {
            // Jangan timpa ikon lama dengan null jika tidak ada upload baru
            unset($validated['store_icon']);
        }

        foreach ($validated as $key => $value) {
            $this->saveSetting($key, $value);
        }

        return redirect()->back()->with('success', 'Pengaturan berhasil disimpan.');
    }

    /**
     * Update feature toggles (super admin only).
     */
    public function updateFeatures(Request $request)
    {
        $user = $request->user();
        $role = is_object($user->role) ? $user->role->value : $user->role;

        if ($role !== 'super_admin') {
            abort(403, 'Hanya Super Admin yang dapat mengubah fitur.');
        }

        $validated = $request->validate([
            'feature_pos'              => 'required|boolean',
            'feature_kitchen'          => 'required|boolean',
            'feature_products'         => 'required|boolean',
            'feature_categories'       => 'required|boolean',
            'feature_transactions'     => 'required|boolean',
            'feature_reports'          => 'required|boolean',
            'feature_users_management' => 'required|boolean',
            'feature_discount_tax'     => 'required|boolean',
            'feature_whatsapp'         => 'required|boolean',
            'feature_order_type'       => 'required|boolean',
        ]);

        foreach ($validated as $key => $value) {
            $this->saveSetting($key, $value);
        }

        return redirect()->back()->with('success', 'Pengaturan fitur berhasil disimpan.');
    }
}