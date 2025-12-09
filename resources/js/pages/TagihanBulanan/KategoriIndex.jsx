import React, { useState } from "react";
import { useForm, router } from "@inertiajs/react";
import { route } from "ziggy-js";
import AppLayout from "@/layouts/AppLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useNotify } from "@/components/ToastNotification";
import Breadcrumbs from "@/components/Breadcrumbs";
import { Trash2, PlusCircle } from "lucide-react";

// --- KOMPONEN MODAL DELETE (SESUAI FOTO) ---
const DeleteModal = ({ isOpen, onClose, onConfirm, itemName }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all scale-100 p-6 text-center">
                
                {/* Icon Merah Besar di Tengah */}
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-50 mb-6">
                    <Trash2 className="h-10 w-10 text-red-600" />
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2">Hapus Kategori?</h3>
                
                <p className="text-sm text-gray-500 mb-8 leading-relaxed">
                    Apakah Anda yakin ingin menghapus kategori <span className="font-bold text-gray-800">"{itemName}"</span>? 
                    <br/>Data harga terkait juga akan terhapus permanen.
                </p>

                {/* Tombol Grid 50:50 */}
                <div className="grid grid-cols-2 gap-4">
                    <Button 
                        variant="outline" 
                        onClick={onClose}
                        className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 py-2 h-auto"
                    >
                        Batal
                    </Button>
                    <Button 
                        onClick={onConfirm}
                        className="w-full bg-red-600 hover:bg-red-700 text-white py-2 h-auto shadow-md hover:shadow-lg transition-all"
                    >
                        Ya, Hapus
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default function KategoriIndex({ auth, kategoriList }) {
    const { notifySuccess, notifyError } = useNotify();
    
    // State untuk Modal Delete
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    // --- FORM TAMBAH KATEGORI ---
    const { data, setData, post, processing, reset, errors } = useForm({
        nm_kat: "",
    });

    // Handle Tambah
    const handleAdd = (e) => {
        e.preventDefault();
        post(route("kat_iuran.store"), {
            onSuccess: () => {
                notifySuccess("Berhasil", "Kategori baru berhasil ditambahkan!");
                reset();
            },
            onError: (err) => {
                notifyError("Gagal", "Gagal menambahkan kategori.");
            },
        });
    };

    // Buka Modal Konfirmasi
    const confirmDelete = (id, nama) => {
        setItemToDelete({ id, nama });
        setIsDeleteModalOpen(true);
    };

    // Eksekusi Hapus (Setelah klik "Ya, Hapus")
    const handleDelete = () => {
        if (!itemToDelete) return;

        router.delete(route("kat_iuran.destroy", itemToDelete.id), {
            onSuccess: () => {
                notifySuccess("Terhapus", `Kategori ${itemToDelete.nama} berhasil dihapus.`);
                setIsDeleteModalOpen(false);
                setItemToDelete(null);
            },
            onError: () => {
                notifyError("Gagal", "Kategori sedang digunakan dan tidak bisa dihapus.");
                setIsDeleteModalOpen(false);
            },
        });
    };

    return (
        <AppLayout>
            <div className="w-full min-h-screen bg-white overflow-y-auto overflow-x-hidden pl-0 pr-8 pb-10 md:pr-12 md:pb-12">
                
                <h1 className="text-3xl font-bold mb-8">KATEGORI IURAN</h1>

                <Breadcrumbs
                    items={[
                        { label: "Dashboard", href: route("dashboard") },
                        { label: "Kategori Iuran" },
                    ]}
                />

                <div className="mt-8 space-y-10">
                    
                    {/* BAGIAN 1: FORM TAMBAH */}
                    <div className="space-y-6">
                        <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">
                            Tambah Kategori Baru
                        </h2>
                        
                        <form onSubmit={handleAdd} className="space-y-4">
                            <div className="space-y-2">
                                <Label>
                                    Nama Kategori <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    type="text"
                                    placeholder="Contoh: Agustusan / Renovasi Jalan"
                                    value={data.nm_kat}
                                    onChange={(e) => setData("nm_kat", e.target.value)}
                                    className="w-full border-gray-300"
                                />
                                {errors.nm_kat && (
                                    <p className="text-sm text-red-500">{errors.nm_kat}</p>
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
                                            onClick={() => confirmDelete(item.id, item.nm_kat)}
                                            title="Hapus Kategori"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </Button>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 text-gray-500 border border-dashed rounded-lg">
                                    Belum ada kategori iuran. Silakan tambah di atas.
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>

            {/* --- MODAL DELETE POPUP --- */}
            <DeleteModal 
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDelete}
                itemName={itemToDelete?.nama}
            />

        </AppLayout>
    );
}