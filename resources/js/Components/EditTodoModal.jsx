// Hapus 'useRef'
import React, { useEffect, useState } from "react";
import { useForm } from "@inertiajs/react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; // <-- PERBAIKAN DI SINI
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Field, FieldLabel, FieldGroup } from "@/components/ui/field";

export default function EditTodoModal({ todo, onClose }) {
    const isOpen = !!todo;

    // 1. Hapus 'cover' dan 'remove_cover' dari form
    const { data, setData, post, processing, errors, reset } = useForm({
        title: "",
        description: "",
        is_finished: false,
    });

    useEffect(() => {
        if (todo) {
            setData({
                title: todo.title,
                description: todo.description || "",
                is_finished: todo.is_finished,
            });
            // 2. Hapus logic untuk reset file input
        }
    }, [todo]); // Dependensi: jalankan ulang jika 'todo' berubah

    const handleSubmit = (event) => {
        event.preventDefault();
        post(`/todos/${todo.id}`, {
            onSuccess: () => onClose(), // Tutup modal jika berhasil
            preserveScroll: true,
        });
    };

    const handleClose = () => {
        if (!processing) {
            onClose();
        }
    };

    // 3. Hapus handler 'handleFileChange' dan 'handleRemoveChange'

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
            <DialogContent className="sm:max-w-[425px]" onEscapeKeyDown={handleClose}>
                <DialogHeader>
                    <DialogTitle>Edit Rencana</DialogTitle>
                    <DialogDescription>
                        Ubah data rencanamu. Klik simpan jika selesai.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <FieldGroup className="grid gap-4 py-4">
                        {/* ... (Field 'Judul' tidak berubah) ... */}
                        <Field>
                            <FieldLabel htmlFor="title-edit">Judul</FieldLabel>
                            <Input
                                id="title-edit"
                                value={data.title}
                                onChange={(e) =>
                                    setData("title", e.target.value)
                                }
                                autoFocus
                            />
                            {errors.title && (
                                <p className="text-sm text-red-600">
                                    {errors.title}
                                </p>
                            )}
                        </Field>
                        
                        {/* ... (Field 'Deskripsi' tidak berubah) ... */}
                        <Field>
                            <FieldLabel htmlFor="description-edit">
                                Deskripsi (Opsional)
                            </FieldLabel>
                            <Textarea
                                id="description-edit"
                                value={data.description}
                                onChange={(e) =>
                                    setData("description", e.target.value)
                                }
                                placeholder="Tulis deskripsi singkat..."
                            />
                            {errors.description && (
                                <p className="text-sm text-red-600">
                                    {errors.description}
                                </p>
                            )}
                        </Field>

                        {/* 4. Hapus semua JSX yang terkait dengan gambar */}

                        {/* Checkbox 'is_finished' */}
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="is_finished-edit"
                                checked={data.is_finished}
                                onCheckedChange={(checked) =>
                                    setData("is_finished", checked)
                                }
                            />
                            <Label
                                htmlFor="is_finished-edit"
                                className="text-sm font-medium leading-none"
                            >
                                Tandai sebagai selesai
                            </Label>
                        </div>
                    </FieldGroup>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="outline" onClick={handleClose}>
                                Batal
                            </Button>
                        </DialogClose>
                        <Button type="submit" disabled={processing}>
                            {processing ? "Menyimpan..." : "Simpan Perubahan"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}