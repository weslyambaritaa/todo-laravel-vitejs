import React, { useState, useRef } from "react";
import AppLayout from "@/Layouts/AppLayout";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { useForm, usePage, router, Link } from "@inertiajs/react";
import { Card, CardContent } from "@/Components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose,
} from "@/Components/ui/dialog";
import { Textarea } from "@/Components/ui/textarea";
import { Checkbox } from "@/Components/ui/checkbox";
import { Label } from "@/Components/ui/label";
import { Field, FieldLabel, FieldGroup } from "@/Components/ui/field";
import EditTodoModal from "@/Components/EditTodoModal";

// --- START: IMPORT RECHARTS DAN ICON BARU ---
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { Download } from "lucide-react";
// --- END: IMPORT RECHARTS DAN ICON BARU ---

// --- KOMPONEN PAGINATION (TIDAK BERUBAH) ---
function Pagination({ links, currentPage, lastPage }) {
    if (lastPage <= 1) {
        return null;
    }

    return (
        <div className="flex justify-center items-center gap-2 mt-8">
            {links.map((link, index) => {
                let label = link.label;

                if (link.label.includes("...")) {
                    return (
                        <span
                            key={index}
                            className="text-muted-foreground px-3 py-1"
                        >
                            ...
                        </span>
                    );
                }

                // PERBAIKAN: Mengecek kunci terjemahan mentah (huruf kecil) ATAU teks default Laravel
                if (
                    link.label.includes("Previous") ||
                    link.label === "pagination.previous"
                ) {
                    label = "Previous";
                } else if (
                    link.label.includes("Next") ||
                    link.label === "pagination.next"
                ) {
                    label = "Next";
                }

                const isActive = link.active;
                const isPreviousOrNextDisabled = !link.url && !link.active;

                if (isPreviousOrNextDisabled) {
                    return (
                        <span
                            key={index}
                            className="px-3 py-1 text-muted-foreground opacity-50 cursor-not-allowed rounded-md"
                        >
                            {label}
                        </span>
                    );
                }

                return (
                    <Link
                        key={index}
                        href={link.url}
                        preserveState
                        className={`inline-flex items-center justify-center h-9 px-3 text-sm font-medium rounded-md transition-colors ${
                            isActive
                                ? "bg-primary text-primary-foreground pointer-events-none"
                                : "bg-background hover:bg-muted text-foreground border border-input"
                        }`}
                    >
                        {label}
                    </Link>
                );
            })}
        </div>
    );
}

// --- START: KOMPONEN PIE CHART DENGAN FUNGSI DOWNLOAD SVG TERINTEGRASI (FIXED) ---
function TodoStatsChart({ finished, unfinished }) {
    // Ref hanya untuk elemen SVG murni (Chart)
    const chartRef = useRef(null);

    // Data untuk Pie Chart
    const chartData = [
        { name: "Selesai", value: finished, color: "#10b981" }, // Tailwind: emerald-500
        { name: "Belum Selesai", value: unfinished, color: "#f59e0b" }, // Tailwind: amber-500
    ];

    const total = finished + unfinished;

    if (total === 0) {
        return (
            <Card className="p-4 flex flex-col items-center justify-center h-full min-h-48">
                <p className="text-lg font-semibold text-muted-foreground">
                    Tidak ada data Rencana.
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                    Buat rencana pertamamu untuk melihat statistik.
                </p>
            </Card>
        );
    }

    // Custom label render function
    const renderCustomizedLabel = ({
        cx,
        cy,
        midAngle,
        innerRadius,
        outerRadius,
        percent,
    }) => {
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
        const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));

        if (percent * 100 > 5) {
            return (
                <text
                    x={x}
                    y={y}
                    fill="white"
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize={12}
                    fontWeight="bold"
                >
                    {`${(percent * 100).toFixed(0)}%`}
                </text>
            );
        }
        return null;
    };

    // FUNGSI BARU: Handle Download SVG terintegrasi (Chart + Data/Judul)
    const handleDownload = () => {
        if (!chartRef.current) {
            alert("Chart belum dirender dengan sempurna. Coba lagi.");
            return;
        }

        // 1. Dapatkan SVG Pie Chart murni dari ResponsiveContainer
        const innerSvgElement = chartRef.current.querySelector("svg");
        if (!innerSvgElement) {
            alert("Elemen SVG chart tidak ditemukan.");
            return;
        }

        // **PERBAIKAN KRITIS: Mengambil elemen <g> yang berisi elemen drawing chart**
        // Mencari elemen <g> di dalam SVG yang bukan tooltip wrapper, yang berisi semua path
        let chartDrawingGroup = innerSvgElement.querySelector(
            "g:not(.recharts-tooltip-wrapper)"
        );

        if (!chartDrawingGroup) {
            // Coba ambil elemen <g> pertama (ini adalah fallback)
            const fallbackGroup = innerSvgElement.querySelector("g");
            if (fallbackGroup) {
                // Gunakan fallback
                chartDrawingGroup = fallbackGroup;
            } else {
                alert("Konten chart tidak ditemukan. Coba lagi.");
                return;
            }
        }

        // Dapatkan markup dari grup chart
        const chartMarkup = new XMLSerializer().serializeToString(
            chartDrawingGroup
        );

        // 2. Tentukan ukuran kanvas baru dan posisi elemen
        const svgWidth = 600;
        const svgHeight = 500;
        // Penyesuaian: Menggeser Pie Chart ke kiri (100) dan sedikit ke bawah (130) agar ada ruang untuk teks
        const chartTranslationX = 100;
        const chartTranslationY = 130;

        // 3. Buat markup SVG untuk Judul dan Legenda
        let legendMarkup = "";
        let yPos = 100; // Mulai posisi Y untuk Legenda

        chartData.forEach((entry) => {
            const percentage =
                total > 0 ? ((entry.value / total) * 100).toFixed(0) : 0;

            legendMarkup += `
                <g transform="translate(300, ${yPos})" font-family="sans-serif">
                    <rect x="0" y="-10" width="16" height="16" fill="${entry.color}" rx="3" />
                    <text x="25" y="5" font-size="14" fill="#333">
                        ${entry.name}: ${entry.value} (${percentage}%)
                    </text>
                </g>
            `;
            yPos += 30;
        });

        const titleMarkup = `
            <text x="${
                svgWidth / 2
            }" y="30" text-anchor="middle" font-size="20" font-weight="bold" fill="#333" font-family="sans-serif">
                Statistik Rencana
            </text>
            <text x="${
                svgWidth / 2
            }" y="60" text-anchor="middle" font-size="14" fill="#666" font-family="sans-serif">
                Total Rencana: ${total}
            </text>
        `;

        // 4. Gabungkan semua markup ke dalam SVG root
        const combinedSvgMarkup = `
            <svg width="${svgWidth}" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="title-chart">
                <style>
                    text { font-family: sans-serif; }
                </style>
                <title id="title-chart">Statistik Rencana: Selesai ${finished}, Belum Selesai ${unfinished}</title>

                ${titleMarkup}
                
                <g transform="translate(${chartTranslationX}, ${chartTranslationY})">
                    ${chartMarkup}
                </g>

                ${legendMarkup}
            </svg>
        `;

        // 5. Download file
        const svgBlob = new Blob([combinedSvgMarkup], {
            type: "image/svg+xml;charset=utf-8",
        });
        const svgUrl = URL.createObjectURL(svgBlob);

        const downloadLink = document.createElement("a");
        downloadLink.href = svgUrl;
        downloadLink.download = "todo_statistik_lengkap.svg";

        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(svgUrl);
    };

    return (
        <Card>
            <CardContent className="pt-6">
                {/* Header dengan Tombol Download tunggal */}
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-2xl font-semibold">
                        Statistik Rencana
                    </h3>
                    <Button
                        onClick={handleDownload}
                        variant="outline"
                        size="sm"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Download Lengkap (.svg)
                    </Button>
                </div>

                <div className="flex flex-col md:flex-row items-center justify-center gap-8">
                    {/* Container untuk Pie Chart - Attach ref di sini! */}
                    <div className="w-full h-56 md:w-1/2" ref={chartRef}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={chartData}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    fill="#8884d8"
                                    labelLine={false}
                                    label={renderCustomizedLabel}
                                >
                                    {chartData.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={entry.color}
                                        />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(value) =>
                                        `${value} (${(
                                            (value / total) *
                                            100
                                        ).toFixed(0)}%)`
                                    }
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Legenda/Keterangan */}
                    <div className="space-y-3 md:w-1/2 w-full">
                        {chartData.map((entry, index) => (
                            <div
                                key={index}
                                className="flex items-center justify-between p-2 rounded-md hover:bg-muted transition-colors"
                            >
                                <div className="flex items-center">
                                    <div
                                        className="w-4 h-4 rounded-full mr-3 flex-shrink-0"
                                        style={{ backgroundColor: entry.color }}
                                    ></div>
                                    <span className="text-base font-medium text-foreground">
                                        {entry.name}
                                    </span>
                                </div>
                                <span className="text-base font-bold">
                                    {entry.value} (
                                    {((entry.value / total) * 100).toFixed(0)}%)
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
// --- END: KOMPONEN PIE CHART DENGAN FUNGSI DOWNLOAD SVG TERINTEGRASI (FIXED) ---

export default function HomePage() {
    // Destructure `filters` dan `todo_stats` dari props
    const { auth, todos, filters, todo_stats } = usePage().props;

    // State untuk modal "Create" (Buat)
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    // State baru untuk modal "Edit"
    const [editingTodo, setEditingTodo] = useState(null);

    // State baru untuk modal "Delete"
    const [deletingTodo, setDeletingTodo] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // State untuk Search dan Filter BARU
    const [search, setSearch] = useState(filters.search || "");
    const [filter, setFilter] = useState(filters.filter || "all");

    // Handler untuk Filter: HARUS MENGGUNAKAN `replace: true` AGAN QUERY STRING BARU MENGGANTIKAN YANG LAMA
    const handleFilterChange = (event) => {
        const newFilter = event.target.value;
        setFilter(newFilter);
        const url = typeof route === "function" ? route("home") : "/";
        router.get(
            url,
            { search: search, filter: newFilter },
            // Pertahankan scroll dan ganti history state
            { preserveState: true, replace: true }
        );
    };

    // Handler untuk Search:
    const handleSearchChange = (event) => {
        const newSearch = event.target.value;
        setSearch(newSearch);

        const url = typeof route === "function" ? route("home") : "/";
        // Menggunakan debounce (jika ada) akan lebih baik di sini, tapi kita ikuti kode yang ada
        router.get(
            url,
            { search: newSearch, filter: filter },
            { preserveState: true, replace: true }
        );
    };

    // Form untuk "Create" (Tidak Berubah)
    const { data, setData, post, processing, errors, reset } = useForm({
        title: "",
        description: "",
        is_finished: false,
        cover: null,
    });

    const handleCreateSubmit = (event) => {
        event.preventDefault();
        post("/todos", {
            onSuccess: () => {
                reset();
                setIsCreateOpen(false); // Tutup modal create
            },
            preserveScroll: true,
        });
    };

    // Fungsi untuk menangani 'DELETE' (Tidak Berubah)
    const handleDelete = () => {
        if (!deletingTodo) return;

        setIsDeleting(true); // Mulai loading

        router.delete(`/todos/${deletingTodo.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                setDeletingTodo(null); // Tutup modal
                setIsDeleting(false); // Selesai loading
            },
            onError: () => {
                setIsDeleting(false); // Selesai loading (jika gagal)
            },
        });
    };

    return (
        <AppLayout>
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto">
                    {/* Hero Section & Form Create (Tidak Berubah) */}
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-bold mb-4">
                            <span
                                dangerouslySetInnerHTML={{
                                    __html: "&#128075;",
                                }}
                            />
                            Hai! {auth.name}
                        </h1>
                        <p className="text-xl text-muted-foreground">
                            Apa yang ingin kamu pelajari hari ini?
                        </p>
                        <Dialog
                            open={isCreateOpen}
                            onOpenChange={setIsCreateOpen}
                        >
                            <DialogTrigger asChild>
                                <Button className="bg-blue-600 hover:bg-blue-700 text-white mt-5">
                                    Buat Rencana
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle>Rencana Baru</DialogTitle>
                                    <DialogDescription>
                                        Isi detail rencanamu di bawah ini.
                                    </DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleCreateSubmit}>
                                    <FieldGroup className="grid gap-4 py-4">
                                        <Field>
                                            <FieldLabel htmlFor="title-create">
                                                Judul
                                            </FieldLabel>
                                            <Input
                                                id="title-create"
                                                value={data.title}
                                                onChange={(e) =>
                                                    setData(
                                                        "title",
                                                        e.target.value
                                                    )
                                                }
                                                autoFocus
                                            />
                                            {errors.title && (
                                                <p className="text-sm text-red-600">
                                                    {errors.title}
                                                </p>
                                            )}
                                        </Field>
                                        <Field>
                                            <FieldLabel htmlFor="description-create">
                                                Deskripsi (Opsional)
                                            </FieldLabel>
                                            <Textarea
                                                id="description-create"
                                                value={data.description}
                                                onChange={(e) =>
                                                    setData(
                                                        "description",
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="Tulis deskripsi singkat..."
                                            />
                                            {errors.description && (
                                                <p className="text-sm text-red-600">
                                                    {errors.description}
                                                </p>
                                            )}
                                        </Field>
                                        <Field>
                                            <FieldLabel htmlFor="cover-create">
                                                Gambar (Opsional)
                                            </FieldLabel>
                                            <Input
                                                id="cover-create"
                                                type="file"
                                                onChange={(e) =>
                                                    setData(
                                                        "cover",
                                                        e.target.files[0]
                                                    )
                                                }
                                            />
                                            {errors.cover && (
                                                <p className="text-sm text-red-600">
                                                    {errors.cover}
                                                </p>
                                            )}
                                        </Field>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="is_finished-create"
                                                checked={data.is_finished}
                                                onCheckedChange={(checked) =>
                                                    setData(
                                                        "is_finished",
                                                        checked
                                                    )
                                                }
                                            />
                                            <Label
                                                htmlFor="is_finished-create"
                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                            >
                                                Tandai sebagai selesai
                                            </Label>
                                        </div>
                                    </FieldGroup>
                                    <DialogFooter>
                                        <DialogClose asChild>
                                            <Button
                                                type="button"
                                                variant="outline"
                                            >
                                                Batal
                                            </Button>
                                        </DialogClose>
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                        >
                                            {processing
                                                ? "Menyimpan..."
                                                : "Simpan Rencana"}
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>

                    {/* --- PENAMBAHAN CHART BARU --- */}
                    {todo_stats && (
                        <div className="mb-12">
                            <TodoStatsChart
                                finished={todo_stats.finished}
                                unfinished={todo_stats.unfinished}
                            />
                        </div>
                    )}
                    {/* --- AKHIR PENAMBAHAN CHART BARU --- */}

                    {/* Tampilkan Daftar Todos */}
                    <div className="mt-12">
                        <h2 className="text-2xl font-semibold mb-4">
                            Daftar Rencanamu
                        </h2>

                        {/* INPUT SEARCH & FILTER BARU */}
                        <div className="flex flex-col md:flex-row gap-4 mb-6">
                            <Input
                                type="text"
                                placeholder="Cari berdasarkan judul atau deskripsi..."
                                value={search}
                                onChange={handleSearchChange}
                                className="w-full md:w-3/4"
                            />
                            {/* Menggunakan elemen <select> native dengan styling dasar Tailwind (meniru komponen Input) */}
                            <select
                                value={filter}
                                onChange={handleFilterChange}
                                className="w-full md:w-1/4 h-10 border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 rounded-md"
                            >
                                <option value="all">Semua Status</option>
                                <option value="unfinished">
                                    Belum Selesai
                                </option>
                                <option value="finished">Selesai</option>
                            </select>
                        </div>
                        {/* AKHIR INPUT SEARCH & FILTER BARU */}

                        {/* 2. Cek apakah ada data di todos.data */}
                        {todos.data.length === 0 ? (
                            <Card>
                                <CardContent className="pt-6">
                                    <p className="text-muted-foreground text-center">
                                        {/* Tampilkan pesan yang relevan jika tidak ada hasil setelah pencarian/filter */}
                                        {filters.search ||
                                        filters.filter !== "all"
                                            ? "Tidak ada rencana yang cocok dengan kriteria pencarian/filter Anda."
                                            : "Kamu belum punya rencana. Ayo buat satu!"}
                                    </p>
                                </CardContent>
                            </Card>
                        ) : (
                            // 3. Tampilkan list dari todos.data
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                                {todos.data.map((todo) => (
                                    <Card
                                        key={todo.id}
                                        className="shadow-sm flex flex-col overflow-hidden"
                                    >
                                        <div className="w-full h-40 overflow-hidden">
                                            {todo.cover_url ? (
                                                <img
                                                    src={todo.cover_url}
                                                    alt={todo.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gray-100 dark:bg-gray-700 border-b border-gray-300 dark:border-gray-600 flex items-center justify-center">
                                                    <span className="text-lg font-semibold text-gray-500 dark:text-gray-400">
                                                        No Cover
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        <CardContent className="pt-6 flex-1 flex flex-col justify-between">
                                            <div>
                                                <div className="mb-2">
                                                    {todo.is_finished ? (
                                                        <span className="text-xs font-medium bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                                                            Selesai
                                                        </span>
                                                    ) : (
                                                        <span className="text-xs font-medium bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">
                                                            Belum Selesai
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="font-medium text-lg">
                                                    {todo.title}
                                                </p>
                                                {todo.description && (
                                                    <p className="text-muted-foreground text-sm mt-2 line-clamp-3">
                                                        {todo.description}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="mt-6 flex justify-end gap-2">
                                                <Link
                                                    href={`/todos/${todo.id}`}
                                                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-9 px-3 bg-blue-600 text-white hover:bg-blue-700"
                                                >
                                                    Detail
                                                </Link>

                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() =>
                                                        setEditingTodo(todo)
                                                    }
                                                >
                                                    Edit
                                                </Button>

                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() =>
                                                        setDeletingTodo(todo)
                                                    }
                                                >
                                                    Hapus
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}

                        {/* 4. Render komponen pagination */}
                        <Pagination
                            links={todos.links}
                            currentPage={todos.current_page}
                            lastPage={todos.last_page}
                        />
                    </div>
                </div>
            </div>

            {/* Modal "Edit" dan "Delete" (Tidak Berubah) */}
            <EditTodoModal
                todo={editingTodo}
                onClose={() => setEditingTodo(null)}
            />
            <Dialog
                open={!!deletingTodo}
                onOpenChange={() => setDeletingTodo(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Apakah Anda Yakin?</DialogTitle>
                        <DialogDescription>
                            Aksi ini akan menghapus
                            <span className="font-semibold text-foreground">
                                " {deletingTodo?.title} "
                            </span>
                            secara permanen.
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
