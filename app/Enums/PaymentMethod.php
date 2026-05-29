<?php

namespace App\Enums;

enum PaymentMethod: string
{
    case CASH = 'cash';
    case QRIS = 'qris';
    case TRANSFER = 'transfer';
    case KARTU = 'kartu';

    public function label(): string
    {
        return match ($this) {
            self::CASH => 'Tunai',
            self::QRIS => 'QRIS',
            self::TRANSFER => 'Transfer',
            self::KARTU => 'Kartu',
        };
    }

    public function icon(): string
    {
        return match ($this) {
            self::CASH => '💵',
            self::QRIS => '📱',
            self::TRANSFER => '🏦',
            self::KARTU => '💳',
        };
    }
}