<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class AuthController extends Controller
{
    // Login
    // -------------------------------
    public function login()
    {
        if (Auth::check()) {
            return redirect()->route('home');
        }

        // Ambil session success dari redirect sebelumnya
        $success = session('success');

        $data = [
            'success' => $success,
        ];
        return Inertia::render('Auth/LoginPage', $data);
    }

    public function postLogin(Request $request)
    {
        $request->validate([
            'email' => 'required|email|max:250',
            'password' => 'required|string|min:6',
        ]);

        // Periksa apakah pengguna berhasil login
        if (!Auth::attempt(['email' => $request->email, 'password' => $request->password])) {
            return back()->withErrors([
                'email' => 'Email atau password salah.',
            ])->onlyInput('email');
        }

        // PERUBAHAN: Tambahkan flash message sukses untuk login
        return redirect()->route('home')->with('success', 'Selamat datang kembali!');
    }

    // Register
    // -------------------------------
    public function register()
    {
        if (Auth::check()) {
            return redirect()->route('home');
        }

        $data = [];
        return Inertia::render('Auth/RegisterPage', $data);
    }

    public function postRegister(Request $request)
    {
        // Validasi input pendaftaran
        $request->validate([
            'name' => 'required|string|max:50',
            'email' => 'required|string|email|max:255|unique:users', // Aturan 'unique:users' akan memicu pesan kustom "Email telah digunakan."
            'password' => 'required|string',
        ]);

        // Daftarkan user
        User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        // Redirect ke halaman login dengan pesan sukses (sudah ada)
        return redirect()->route('auth.login')->with('success', 'Pendaftaran berhasil dilakukan! Silakan login.');
    }

    // Logout
    // -------------------------------
    public function logout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        // PERUBAHAN: Tambahkan flash message sukses untuk logout
        return redirect()->route('auth.login')->with('success', 'Anda telah berhasil logout.');
    }
}