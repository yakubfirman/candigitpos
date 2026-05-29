<?php

namespace App\Enums;

enum TransactionStatus: string
{
    case COMPLETED = 'completed';
    case CANCELLED = 'cancelled';

    public function label(): string
    {
        return match ($this) {
            self::COMPLETED => 'Selesai',
            self::CANCELLED => 'Dibatalkan',
        };
    }

    public function color(): string
    {
        return match ($this) {
            self::COMPLETED => 'green',
            self::CANCELLED => 'red',
        };
    }
}