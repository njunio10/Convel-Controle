<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Client extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'responsible_name',
        'email',
        'phone',
        'origin',
        'referred_by',
        'monthly_fee',
        'notes',
    ];

    protected $casts = [
        'monthly_fee' => 'decimal:2',
    ];
}
