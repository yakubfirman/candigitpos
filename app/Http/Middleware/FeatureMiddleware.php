<?php

namespace App\Http\Middleware;

use App\Http\Controllers\SettingController;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class FeatureMiddleware
{
    /**
     * Handle an incoming request.
     * Checks if a feature is enabled before allowing access.
     *
     * Usage in routes: ->middleware('feature:feature_kitchen')
     */
    public function handle(Request $request, Closure $next, string $featureKey): Response
    {
        // Super admin always has access
        $user = $request->user();
        if ($user) {
            $role = is_object($user->role) ? $user->role->value : $user->role;
            if ($role === 'super_admin') {
                return $next($request);
            }
        }

        $features = SettingController::getFeatureSettings();

        if (!($features[$featureKey] ?? true)) {
            abort(403, 'Fitur ini sedang dinonaktifkan oleh administrator.');
        }

        return $next($request);
    }
}
