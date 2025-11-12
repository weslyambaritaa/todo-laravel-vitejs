<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\TodoController; // 1. Pastikan TodoController di-import
use Illuminate\Support\Facades\Route;

// routes/web.php (KODE PERBAIKAN)

Route::middleware(['handle.inertia'])->group(function () {
    // Auth Routes
    Route::group(['prefix' => 'auth'], function () {
        Route::get('/login', [AuthController::class, 'login'])->name('auth.login');
        // Beri nama unik, contoh: 'auth.login.store'
        Route::post('/login', [AuthController::class, 'postLogin'])->name('auth.login.store'); 

        Route::get('/register', [AuthController::class, 'register'])->name('auth.register');
        // Beri nama unik, contoh: 'auth.register.store'
        Route::post('/register', [AuthController::class, 'postRegister'])->name('auth.register.store');

        Route::get('/logout', [AuthController::class, 'logout'])->name('auth.logout');
    });

    Route::group(['middleware' => 'check.auth'], function () {
        Route::get('/', [HomeController::class, 'home'])->name('home');

        // Rute untuk Create (POST)
        Route::post('/todos', [TodoController::class, 'store'])->name('todos.store');
        
        // Rute Detail/Show
        Route::get('/todos/{todo}', [TodoController::class, 'show'])->name('todos.show');

        // Rute untuk Update (POST)
        Route::post('/todos/{todo}', [TodoController::class, 'update'])->name('todos.update');
        
        // Rute untuk Delete (DELETE)
        Route::delete('/todos/{todo}', [TodoController::class, 'destroy'])->name('todos.destroy');
        
        // Rute untuk Update Cover (POST)
        Route::post('/todos/{todo}/cover', [TodoController::class, 'updateCover'])->name('todos.updateCover');
    });
});
// <-- Pastikan tidak ada '}' tambahan di sini