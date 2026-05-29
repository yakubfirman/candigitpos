<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Enums\UserRole;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class UserController extends Controller
{
    /**
     * Display a listing of the users.
     */
    public function index()
    {
        $query = User::orderBy('name');
        
        // Hide super_admin users if the current user is not a super_admin
        if (auth()->user()->role !== UserRole::SUPER_ADMIN) {
            $query->where('role', '!=', UserRole::SUPER_ADMIN);
        }

        $users = $query->get();
        
        return Inertia::render('Users/Index', [
            'users' => $users
        ]);
    }

    /**
     * Store a newly created user in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'username' => 'required|string|max:255|unique:users',
            'password' => 'required|string|min:8',
            'role' => ['required', Rule::enum(UserRole::class)],
        ]);

        User::create([
            'name' => $validated['name'],
            'username' => $validated['username'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
        ]);

        return redirect()->back()->with('success', 'Pengguna berhasil ditambahkan.');
    }

    /**
     * Update the specified user in storage.
     */
    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'username' => ['required', 'string', 'max:255', Rule::unique('users')->ignore($user->id)],
            'password' => 'nullable|string|min:8',
            'role' => ['required', Rule::enum(UserRole::class)],
        ]);

        $data = [
            'name' => $validated['name'],
            'username' => $validated['username'],
            'role' => $validated['role'],
        ];

        if (!empty($validated['password'])) {
            $data['password'] = Hash::make($validated['password']);
        }

        // Prevent downgrading the last admin
        if ($user->role === UserRole::ADMIN && $validated['role'] !== 'admin') {
            $adminCount = User::where('role', 'admin')->count();
            if ($adminCount <= 1) {
                return redirect()->back()->withErrors(['role' => 'Tidak dapat mengubah peran admin terakhir.']);
            }
        }

        $user->update($data);

        return redirect()->back()->with('success', 'Pengguna berhasil diperbarui.');
    }

    /**
     * Remove the specified user from storage.
     */
    public function destroy(User $user)
    {
        if ($user->id === auth()->id()) {
            return redirect()->back()->withErrors(['error' => 'Anda tidak dapat menghapus akun Anda sendiri.']);
        }

        if ($user->role === UserRole::ADMIN) {
            // Admin cannot delete other admins
            if (auth()->user()->role !== UserRole::SUPER_ADMIN) {
                return redirect()->back()->withErrors(['error' => 'Anda tidak dapat menghapus pengguna dengan role Admin.']);
            }
            
            $adminCount = User::where('role', 'admin')->count();
            if ($adminCount <= 1) {
                return redirect()->back()->withErrors(['error' => 'Tidak dapat menghapus admin terakhir.']);
            }
        }

        $user->delete();

        return redirect()->back()->with('success', 'Pengguna berhasil dihapus.');
    }
}
