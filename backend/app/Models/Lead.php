<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Lead extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'responsible_name',
        'email',
        'phone',
        'status',
        'origin',
        'referred_by',
        'notes',
    ];
}
