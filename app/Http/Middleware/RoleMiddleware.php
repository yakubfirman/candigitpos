<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        if (!$request->user()) {
            return redirect()->route('login');
        }

        $userRole = $request->user()->role;
        $userRoleValue = is_object($userRole) ? $userRole->value : $userRole;

        if (!in_array($userRoleValue, $roles) && $userRoleValue !== 'admin' && $userRoleValue !== 'super_admin') {
            abort(403, 'Anda tidak memiliki akses ke halaman ini.');
        }

        return $next($request);
    }
}