<!DOCTYPE html>
<html lang="id">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">
        @php
            $appSettings = \Illuminate\Support\Facades\Cache::get('app_settings', []);
            $storeName = $appSettings['store_name'] ?? 'GreenPOS';
            $storeIcon = $appSettings['store_icon'] ?? null;
        @endphp
        <title inertia>{{ $storeName }}</title>
        @if($storeIcon)
            <link id="favicon" rel="icon" type="image/png" href="{{ asset('storage/' . $storeIcon) }}">
        @else
            <link id="favicon" rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🍃</text></svg>">
        @endif
        
        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
        
        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.tsx'])
        @inertiaHead
    </head>
    <body class="bg-[#FDFBF7] font-sans antialiased text-stone-900">
        @inertia
    </body>
</html>