import React, { useState } from "react";
import AppLayout from "@/Layouts/AppLayout";
import { Button } from "@/Components/ui/button";
import { Card, CardContent } from "@/Components/ui/card";
import { usePage, Link, router } from "@inertiajs/react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/Components/ui/dialog";
import EditTodoModal from "@/Components/EditTodoModal";
import ChangeCoverModal from "@/Components/ChangeCoverModal";

export default function Show() {
    const { todo } = usePage().props;

    const [editingTodo, setEditingTodo] = useState(null);
    const [deletingTodo, setDeletingTodo] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isCoverModalOpen, setIsCoverModalOpen] = useState(false);

    const handleDelete = () => {
        if (!deletingTodo) return;
        setIsDeleting(true);
        router.delete(`/todos/${deletingTodo.id}`, {
            onSuccess: () => {
                router.visit('/');
            },
            onError: () => setIsDeleting(false),
        });
    };

    return (
        <AppLayout>
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto">
                    {/* Tombol Kembali ke Home */}
                    <div className="mb-6">
                        <Link
                            href="/"
                            className="text-sm text-blue-600 hover:underline"
                        >
                            &larr; Kembali ke Home
                        </Link>
                    </div>

                    {/* Gambar Cover atau Placeholder */}
                    {/* Kontainer Utama: Tinggi H-80 */}
                    <div className="w-full h-80 rounded-lg shadow-lg mb-6 overflow-hidden">
                        {todo.cover_url ? (
                            // JIKA ADA COVER: Tampilkan Gambar
                            <img
                                src={todo.cover_url}
                                alt={todo.title}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            // JIKA TIDAK ADA COVER: Tampilkan Placeholder "No Cover"
                            <div className="w-full h-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center">
                                <span className="text-2xl font-semibold text-gray-500 dark:text-gray-400">
                                    No Cover
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Tombol Aksi Utama */}
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-4xl font-bold">{todo.title}</h1>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                onClick={() => setIsCoverModalOpen(true)}
                            >
                                Ganti Cover
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => setEditingTodo(todo)}
                            >
                                Edit
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={() => setDeletingTodo(todo)}
                            >
                                Hapus
                            </Button>
                        </div>
                    </div>

                    {/* Detail Konten */}
                    <Card>
                        <CardContent className="pt-6 grid gap-4">
                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                                {todo.is_finished ? (
                                    <span className="text-lg font-medium text-green-700">
                                        Selesai
                                    </span>
                                ) : (
                                    <span className="text-lg font-medium text-yellow-700">
                                        Belum Selesai
                                    </span>
                                )}
                            </div>
                            
                            {/* PERUBAHAN DI SINI: Blok deskripsi selalu tampil */}
                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground">Deskripsi</h3>
                                {todo.description ? (
                                    <p className="text-lg whitespace-pre-wrap">
                                        {todo.description}
                                    </p>
                                ) : (
                                    <p className="text-lg text-gray-500 italic">
                                        Tidak ada deskripsi
                                    </p>
                                )}
                            </div>
                            
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Modal-modal */}
            <EditTodoModal
                todo={editingTodo}
                onClose={() => setEditingTodo(null)}
            />

            <ChangeCoverModal
                todo={todo}
                isOpen={isCoverModalOpen}
                onClose={() => setIsCoverModalOpen(false)}
            />

            <Dialog open={!!deletingTodo} onOpenChange={() => setDeletingTodo(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Apakah Anda Yakin?</DialogTitle>
                        <DialogDescription>
                            Aksi ini akan menghapus "{todo.title}" secara permanen.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setDeletingTodo(null)}
                            disabled={isDeleting}
                        >
                            Batal
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={isDeleting}
                        >
                            {isDeleting ? "Menghapus..." : "Hapus"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}