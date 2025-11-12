<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
// Import Request
use Illuminate\Http\Request;

class HomeController extends Controller
{
    // Terima instance Request
    public function home(Request $request) 
    {
        $auth = Auth::user();

        // Ambil parameter dari request
        $search = $request->input('search');
        $filter = $request->input('filter', 'all'); // Default 'all'
        
        // Ambil nomor halaman saat ini (untuk pagination)
        $page = $request->input('page'); 

        // 1. Ambil todos milik user, urutkan dari yang terbaru
        $todosQuery = $auth->todos()->latest();

        // Logika Search: Cari di kolom title atau description
        if ($search) {
            $todosQuery->where(function ($query) use ($search) {
                $query->where('title', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Logika Filter: Filter berdasarkan status
        if ($filter === 'finished') {
            $todosQuery->where('is_finished', true);
        } elseif ($filter === 'unfinished') {
            $todosQuery->where('is_finished', false);
        }
        
        // **********************************************
        // ********* PERUBAHAN UNTUK PAGINATION *********
        // **********************************************
        $todos = $todosQuery->paginate(20)->withQueryString(); // Terapkan pagination 20 item per halaman

        // **********************************************
        // ********* PENAMBAHAN STATISTIK TODO **********
        // **********************************************
        $totalTodos = $auth->todos()->count();
        $finishedCount = $auth->todos()->where('is_finished', true)->count();
        $unfinishedCount = $totalTodos - $finishedCount;

        $todoStats = [
            'total' => $totalTodos,
            'finished' => $finishedCount,
            'unfinished' => $unfinishedCount,
        ];

        $data = [
            'auth' => $auth,
            'todos' => $todos, // Sekarang ini adalah objek Paginator
            // Kirim kembali state search dan filter ke frontend
            'filters' => [
                'search' => $search,
                'filter' => $filter,
            ],
            // Kirim statistik todo
            'todo_stats' => $todoStats, 
        ];

        return Inertia::render('App/HomePage', $data);
    }
}