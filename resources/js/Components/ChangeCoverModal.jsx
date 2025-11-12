import React, { useEffect, useRef } from "react";
import { useForm } from "@inertiajs/react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogClose,
} from "@/Components/ui/dialog";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Checkbox } from "@/Components/ui/checkbox";
import { Label } from "@/Components/ui/label";
import { Field, FieldLabel, FieldGroup } from "@/Components/ui/field";

export default function ChangeCoverModal({ todo, isOpen, onClose }) {
    const fileInputRef = useRef(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        cover: null,
        remove_cover: false,
    });

    // Reset form setiap kali modal dibuka
    useEffect(() => {
        if (isOpen) {
            reset();
            if (fileInputRef.current) {
                fileInputRef.current.value = null;
            }
        }
    }, [isOpen]);

    const handleSubmit = (event) => {
        event.preventDefault();
        // Menggunakan POST dengan multipart/form-data
        post(`/todos/${todo.id}/cover`, {
            onSuccess: () => onClose(),
            preserveScroll: true,
        });
    };

    const handleFileChange = (e) => {
        setData("cover", e.target.files[0]);
        setData("remove_cover", false);
    };

    const handleRemoveChange = (checked) => {
        setData("remove_cover", checked);
        if (checked) {
            setData("cover", null);
            if (fileInputRef.current) {
                fileInputRef.current.value = null;
            }
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Ganti Gambar Sampul</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <FieldGroup className="grid gap-4 py-4">
                        {/* Gambar saat ini atau Placeholder "No Cover" */}
                        <div className="mb-2">
                            <Label>Gambar Saat Ini</Label>
                            {/* Kontainer Pratinjau: Tinggi H-40 */}
                            <div className="mt-2 w-full h-40 rounded-md overflow-hidden">
                                {todo?.cover_url ? (
                                    // JIKA ADA COVER: Tampilkan Gambar
                                    <img
                                        src={todo.cover_url}
                                        alt="Cover"
                                        className="w-full h-full object-cover" 
                                    />
                                ) : (
                                    // JIKA TIDAK ADA COVER: Tampilkan Placeholder "No Cover"
                                    <div className="w-full h-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md flex items-center justify-center">
                                        <span className="text-lg font-semibold text-gray-500 dark:text-gray-400">
                                            No Cover
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <Field>
                            <FieldLabel htmlFor="cover-change">
                                {todo?.cover_url ? "Ganti Gambar" : "Upload Gambar"}
                            </FieldLabel>
                            <Input
                                id="cover-change"
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                disabled={data.remove_cover}
                            />
                            {errors.cover && (
                                <p className="text-sm text-red-600">
                                    {errors.cover}
                                </p>
                            )}
                        </Field>

                        {/* Checkbox hapus (hanya jika gambar ada) */}
                        {todo?.cover_url && (
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="remove_cover_change"
                                    checked={data.remove_cover}
                                    onCheckedChange={handleRemoveChange}
                                    disabled={!!data.cover}
                                />
                                <Label
                                    htmlFor="remove_cover_change"
                                    className="text-sm font-medium"
                                >
                                    Hapus gambar saat ini
                                </Label>
                            </div>
                        )}
                    </FieldGroup>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="outline" onClick={onClose}>
                                Batal
                            </Button>
                        </DialogClose>
                        <Button type="submit" disabled={processing}>
                            {processing ? "Menyimpan..." : "Simpan"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}