import React, { useState } from "react";
import { useForm } from "@inertiajs/react";
import { route } from "ziggy-js";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useNotify } from "@/components/ToastNotification";
import AppLayout from "@/layouts/AppLayout";
import axios from "axios";
import Breadcrumbs from "@/components/Breadcrumbs";

export default function Pengumuman({ kategori_iuran = [] }) {
    const { notifySuccess, notifyError } = useNotify();
    const { data, setData, reset } = useForm({
        judul: "",
        ket: "",
        kat_iuran_id: "",
    });

    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        // 🔸 validasi manual biar lebih ramah pengguna
        if (!data.judul.trim()) {
            notifyError(
                "Judul kosong",
                "Masukkan judul pengumuman terlebih dahulu."
            );
            setIsLoading(false);
            return;
        }
        if (!data.ket.trim()) {
            notifyError(
                "Keterangan kosong",
                "Tuliskan isi pengumuman dengan jelas."
            );
            setIsLoading(false);
            return;
        }
        if (!data.kat_iuran_id) {
            notifyError(
                "Kategori belum dipilih",
                "Pilih kategori iuran yang sesuai."
            );
            setIsLoading(false);
            return;
        }

        try {
            await axios.post(route("pengumuman.create"), data);

            notifySuccess("Berhasil", "Pengumuman berhasil dibuat!");
            reset();
        } catch (error) {
            console.error(error);
            let pesan = "Terjadi kesalahan, coba beberapa saat lagi.";
            if (error.response) {
                switch (error.response.status) {
                    case 422:
                        pesan = "Periksa kembali data yang kamu isi.";
                        break;
                    case 500:
                        pesan =
                            "Server sedang bermasalah. Coba beberapa saat lagi.";
                        break;
                    default:
                        pesan = error.response.data?.message || pesan;
                }
            }
            notifyError("Gagal Menyimpan", pesan);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AppLayout>
            <div className="w-full min-h-screen bg-white overflow-y-auto overflow-x-hidden pl-0 pr-8 pb-10 md:pr-12 md:pb-12">
                <h1 className="text-3xl font-bold mb-8">TAMBAH PENGUMUMAN</h1>

                <Breadcrumbs
                    items={[
                        { label: "Dashboard", href: route("dashboard") },
                        { label: "Tambah Pengumuman" },
                    ]}
                />

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Judul */}
                    <div className="space-y-2">
                        <Label>
                            Judul Pengumuman{" "}
                            <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            type="text"
                            placeholder="Contoh: Iuran Kebersihan Bulan November"
                            value={data.judul}
                            onChange={(e) => setData("judul", e.target.value)}
                        />
                    </div>

                    {/* Keterangan */}
                    <div className="space-y-2">
                        <Label>
                            Isi / Keterangan{" "}
                            <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                            placeholder="Tuliskan detail pengumuman atau informasi tambahan..."
                            value={data.ket}
                            onChange={(e) => setData("ket", e.target.value)}
                        />
                    </div>

                    {/* Kategori */}
                    <div className="space-y-2">
                        <Label>
                            Kategori Iuran{" "}
                            <span className="text-red-500">*</span>
                        </Label>
                        <select
                            value={data.kat_iuran_id}
                            onChange={(e) =>
                                setData("kat_iuran_id", e.target.value)
                            }
                            className="border border-gray-300 rounded-md px-3 py-2 w-full focus:ring-2 focus:ring-emerald-400"
                        >
                            <option value="">Pilih kategori</option>
                            {kategori_iuran.map((kat) => (
                                <option key={kat.id} value={kat.id}>
                                    {kat.nm_kat}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Tombol Aksi */}
                    <div className="flex justify-end gap-4 pt-2">
                        <Button
                            type="reset"
                            onClick={() => reset()}
                            className="bg-gray-500 hover:bg-gray-600 text-white"
                        >
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white"
                        >
                            {isLoading ? "Menyimpan..." : "Kirim Pengumuman"}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
