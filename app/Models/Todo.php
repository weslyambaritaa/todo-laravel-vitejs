<?php
// weslyambaritaa/latihan-laravel-vitejs/latihan-laravel-vitejs-da0e68073567285f5a5c6bd2b21f86f548b48020/app/Models/Todo.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage; // Pastikan ini di-import

class Todo extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'title',
        'description',
        'is_finished',
        'cover',
    ];

    // ** 1. TAMBAHKAN INI **
    /**
     * The accessors to append to the model's array form.
     *
     * @var array<int, string>
     */
    protected $appends = [
        'cover_url', // Ini memastikan cover_url ada di Inertia props
    ];

    /**
     * Get the user that owns the todo.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // ** 2. PASTIKAN ACCESOR INI ADA **
    /**
     * Get the URL for the todo's cover image.
     *
     * @return string|null
     */
    public function getCoverUrlAttribute(): ?string
    {
        if ($this->cover) {
            // Menggunakan disk('public')->url() untuk URL publik lengkap
            return Storage::disk('public')->url($this->cover);
        }
        return null;
    }
}