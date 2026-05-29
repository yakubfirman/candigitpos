<?php

namespace App\Enums;

enum UserRole: string
{
    case ADMIN = 'admin';
    case SUPER_ADMIN = 'super_admin';
    case KASIR = 'kasir';
    case DAPUR = 'dapur';

    public function label(): string
    {
        return match ($this) {
            self::ADMIN => 'Administrator',
            self::SUPER_ADMIN => 'Super Admin',
            self::KASIR => 'Kasir',
            self::DAPUR => 'Dapur',
        };
    }

    public function color(): string
    {
        return match ($this) {
            self::ADMIN => 'green',
            self::SUPER_ADMIN => 'purple',
            self::KASIR => 'blue',
            self::DAPUR => 'orange',
        };
    }

    public function isAdmin(): bool
    {
        return $this === self::ADMIN || $this === self::SUPER_ADMIN;
    }

    public function isSuperAdmin(): bool
    {
        return $this === self::SUPER_ADMIN;
    }
}