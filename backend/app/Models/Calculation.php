<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Calculation extends Model
{
    use HasFactory;

    protected $fillable = [
        'transactions',
        'results',
    ];

    protected $casts = [
        'transactions' => 'array',
        'results' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}