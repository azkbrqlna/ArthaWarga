import React from "react";
import { useForm, router } from "@inertiajs/react";
import { route } from "ziggy-js";
import Swal from "sweetalert2"; // Import SweetAlert2
import AppLayout from "@/layouts/AppLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useNotify } from "@/components/ToastNotification";
import { Trash2, PlusCircle } from "lucide-react";

export default function KategoriIndex({ auth, kategoriList }) {
    const { notifySuccess, notifyError } = useNotify();

    // --- FORM TAMBAH KATEGORI ---
    const { data, setData, post, processing, reset, errors } = useForm({
        nm_kat: "",
    });

    // Handle Tambah
    const handleAdd = (e) => {
        e.preventDefault();
        post(route("kat_iuran.store"), {
            onSuccess: () => {
                notifySuccess(
                    "Berhasil",
                    "Kategori baru berhasil ditambahkan!"
                );
                reset();
            },
            onError: (err) => {
                notifyError("Gagal", "Gagal menambahkan kategori.");
            },
        });
    };

    // --- LOGIKA DELETE MENGGUNAKAN SWAL ---
    const confirmDelete = (id, nama) => {
        Swal.fire({
            title: "Hapus Kategori?",
            html: `Apakah Anda yakin ingin menghapus kategori <b>"${nama}"</b>?<br/><small>Data harga terkait juga akan terhapus permanen.</small>`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#dc2626", // Merah (Tailwind red-600)
            cancelButtonColor: "#6b7280", // Abu-abu
            confirmButtonText: "Ya, Hapus",
            cancelButtonText: "Batal",
            reverseButtons: true, // Opsional: Membalik posisi tombol
        }).then((result) => {
            if (result.isConfirmed) {
                // Eksekusi Hapus via Inertia Router
                router.delete(route("kat_iuran.destroy", id), {
                    onSuccess: () => {
                        // Opsi 1: Pakai Toast bawaan (Konsisten dengan tambah data)
                        notifySuccess(
                            "Terhapus",
                            `Kategori ${nama} berhasil dihapus.`
                        );

                        // Opsi 2: Bisa juga pakai Swal Success jika Yang Mulia mau:
                        // Swal.fire("Terhapus!", "Kategori berhasil dihapus.", "success");
                    },
                    onError: () => {
                        notifyError(
                            "Gagal",
                            "Kategori sedang digunakan dan tidak bisa dihapus."
                        );
                    },
                });
            }
        });
    };

    return (
        <AppLayout>
            <div className="w-full min-h-screen bg-white overflow-y-auto overflow-x-hidden pl-0 pr-8 pb-10 md:pr-12 md:pb-12">
                <h1 className="text-3xl font-bold mb-8">KATEGORI IURAN</h1>

                <div className="mt-8 space-y-10">
                    {/* BAGIAN 1: FORM TAMBAH */}
                    <div className="space-y-6">
                        <form onSubmit={handleAdd} className="space-y-4">
                            <div className="space-y-2">
                                <Label>
                                    Nama Kategori{" "}
                                    <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    type="text"
                                    placeholder="Contoh: Agustusan / Renovasi Jalan"
                                    value={data.nm_kat}
                                    onChange={(e) =>
                                        setData("nm_kat", e.target.value)
                                    }
                                    className="w-full border-gray-300"
                                />
                                {errors.nm_kat && (
                                    <p className="text-sm text-red-500">
                                        {errors.nm_kat}
                                    </p>
                                )}
                            </div>

                            <div className="flex justify-end">
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="bg-emerald-500 hover:bg-emerald-600 text-white w-40"
                                >
                                    <PlusCircle className="w-4 h-4 mr-2" />
                                    {processing ? "Menyimpan..." : "Tambah"}
                                </Button>
                            </div>
                        </form>
                    </div>

                    {/* BAGIAN 2: LIST KATEGORI */}
                    <div className="space-y-6">
                        <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">
                            Daftar Kategori Tersedia
                        </h2>

                        <div className="grid gap-4">
                            {kategoriList.length > 0 ? (
                                kategoriList.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                                    >
                                        <div className="flex-1 mr-4">
                                            <Label className="text-xs text-gray-500 mb-1 block">
                                                Nama Kategori
                                            </Label>
                                            <div className="text-gray-900 font-medium">
                                                {item.nm_kat}
                                            </div>
                                        </div>

                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-gray-400 hover:text-red-600 hover:bg-red-50"
                                            onClick={() =>
                                                confirmDelete(
                                                    item.id,
                                                    item.nm_kat
                                                )
                                            }
                                            title="Hapus Kategori"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </Button>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 text-gray-500 border border-dashed rounded-lg">
                                    Belum ada kategori iuran. Silakan tambah di
                                    atas.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
