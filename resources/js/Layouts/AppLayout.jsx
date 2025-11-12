import React, { useEffect } from "react"; // PERUBAHAN: Tambahkan useEffect
import { Link, router, usePage } from "@inertiajs/react"; // PERUBAHAN: Tambahkan usePage
import { Button } from "@/Components/ui/button";
import Swal from "sweetalert2"; // PERUBAHAN: Import SweetAlert2

export default function AppLayout({ children }) {
    // PERUBAHAN: Ambil flash message dari props Inertia
    const { flash } = usePage().props;

    // PERUBAHAN: Gunakan useEffect untuk mendengarkan perubahan flash message
    useEffect(() => {
        if (flash.success) {
            Swal.fire({
                title: "Berhasil!",
                text: flash.success,
                icon: "success",
                position: "top-end",
                showConfirmButton: false,
                timer: 3000,
                toast: true,
            });
        }

        if (flash.error) {
            // Perlu diperhatikan: Saat ini tidak ada controller yang secara eksplisit mengirim flash.error
            // Kecuali jika Anda menambahkan penanganan kesalahan khusus. Namun, ini adalah tempat logikanya.
            Swal.fire({
                title: "Gagal!",
                text: flash.error,
                icon: "error",
                position: "top-end",
                showConfirmButton: false,
                timer: 3000,
                toast: true,
            });
        }
    }, [flash]); // Dependency array: jalankan ulang ketika flash object berubah

    const onLogout = () => {
        router.get("/auth/logout");
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Navigation */}
            <nav className="border-b bg-card">
                <div className="container mx-auto px-4">
                    <div className="flex h-16 items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <Link href="/" className="text-lg font-bold">
                                DelTodos
                            </Link>
                        </div>
                        <Button variant="outline" size="sm" onClick={onLogout}>
                            Logout
                        </Button>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main>{children}</main>

            {/* Footer */}
            <footer className="border-t bg-card py-6">
                <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
                    &copy; 2025 Delcom Labs. All rights reserved.
                </div>
            </footer>
        </div>
    );
}