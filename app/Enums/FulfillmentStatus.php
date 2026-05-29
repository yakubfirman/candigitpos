<?php

namespace App\Enums;

enum FulfillmentStatus: string
{
    case PENDING = 'pending';
    case PROCESSING = 'processing';
    case READY = 'ready';

    public function label(): string
    {
        return match ($this) {
            self::PENDING => 'Baru Masuk',
            self::PROCESSING => 'Sedang Dimasak',
            self::READY => 'Siap Diantar',
        };
    }

    public function color(): string
    {
        return match ($this) {
            self::PENDING => 'stone',
            self::PROCESSING => 'amber',
            self::READY => 'green',
        };
    }
}
