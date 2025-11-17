import React, { useRef, useState } from "react";
import { useForm, router } from "@inertiajs/react";
import { route } from "ziggy-js";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Upload } from "lucide-react";
import { useNotify } from "@/components/ToastNotification";
import axios from "axios";
import AppLayout from "@/layouts/AppLayout";
import Breadcrumbs from "@/components/Breadcrumbs";

export default function TambahKegiatan() {
    const { notifySuccess, notifyError } = useNotify();
    const { data, setData, reset } = useForm({
        nm_keg: "",
        tgl_mulai: "",
        tgl_selesai: "",
        kategori: "",
        rincian: "",
        pj_keg: "",
        panitia: "",
        dok_keg: null,
    });

    const [preview, setPreview] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef(null);

    const kategoriList = [
        "Administrasi",
        "Kegiatan Sosial dan Pemberdayaan",
        "Kebersihan dan Pembangunan Lingkungan",
    ];

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData("dok_keg", file);
            setPreview(URL.createObjectURL(file));
        } else setPreview(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        // 🧩 Validasi user-friendly
        if (!data.nm_keg.trim()) {
            notifyError(
                "Nama kegiatan kosong",
                "Isi nama kegiatan terlebih dahulu."
            );
            setIsLoading(false);
            return;
        }
        if (!data.tgl_mulai) {
            notifyError(
                "Tanggal mulai belum diisi",
                "Pilih tanggal mulai kegiatan."
            );
            setIsLoading(false);
            return;
        }
        if (!data.tgl_selesai) {
            notifyError(
                "Tanggal selesai belum diisi",
                "Pilih tanggal selesai kegiatan."
            );
            setIsLoading(false);
            return;
        }
        if (!data.kategori) {
            notifyError(
                "Kategori belum dipilih",
                "Pilih kategori kegiatan dari daftar."
            );
            setIsLoading(false);
            return;
        }
        if (!data.rincian.trim()) {
            notifyError(
                "Rincian kosong",
                "Tuliskan rincian kegiatan secara singkat."
            );
            setIsLoading(false);
            return;
        }
        if (!data.pj_keg.trim()) {
            notifyError(
                "Penanggung jawab kosong",
                "Isi nama penanggung jawab kegiatan."
            );
            setIsLoading(false);
            return;
        }
        if (!data.panitia.trim()) {
            notifyError("Panitia kosong", "Tuliskan siapa panitianya.");
            setIsLoading(false);
            return;
        }
        if (!data.dok_keg) {
            notifyError(
                "Dokumentasi belum diunggah",
                "Unggah file dokumentasi kegiatan."
            );
            setIsLoading(false);
            return;
        }

        const formData = new FormData();
        formData.append("nm_keg", data.nm_keg);
        formData.append("tgl_mulai", data.tgl_mulai);
        formData.append("tgl_selesai", data.tgl_selesai);
        formData.append("kategori", data.kategori);
        formData.append("rincian", data.rincian);
        formData.append("pj_keg", data.pj_keg);
        formData.append("panitia", data.panitia);
        if (data.dok_keg) formData.append("dok_keg", data.dok_keg);

        try {
            await axios.post(route("kegiatan.store"), formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            notifySuccess("Berhasil", "Kegiatan berhasil disimpan!");
            reset();
            setPreview(null);
            if (fileInputRef.current) fileInputRef.current.value = null;
            router.visit("/kegiatan");
        } catch (error) {
            console.error(error);
            let pesan = "Terjadi kesalahan, coba beberapa saat lagi.";
            if (error.response) {
                switch (error.response.status) {
                    case 422:
                        pesan =
                            "Periksa kembali data yang kamu isi, ada yang belum sesuai.";
                        break;
                    case 413:
                        pesan = "Ukuran file terlalu besar (maksimal 2MB).";
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
                <h1 className="text-3xl font-bold mb-10">TAMBAH KEGIATAN</h1>

                <Breadcrumbs
                    items={[
                        { label: "Dashboard", href: route("dashboard") },
                        { label: "Tambah Kegiatan" },
                    ]}
                />

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Nama & Tanggal */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <Label>
                                Nama Kegiatan{" "}
                                <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                placeholder="Contoh: Rapat RT"
                                value={data.nm_keg}
                                onChange={(e) =>
                                    setData("nm_keg", e.target.value)
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>
                                Tanggal Mulai{" "}
                                <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                type="date"
                                value={data.tgl_mulai}
                                onChange={(e) =>
                                    setData("tgl_mulai", e.target.value)
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>
                                Tanggal Selesai{" "}
                                <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                type="date"
                                value={data.tgl_selesai}
                                onChange={(e) =>
                                    setData("tgl_selesai", e.target.value)
                                }
                            />
                        </div>
                    </div>

                    {/* Kategori */}
                    <div className="space-y-2">
                        <Label>
                            Kategori <span className="text-red-500">*</span>
                        </Label>
                        <Select
                            onValueChange={(val) => setData("kategori", val)}
                            value={data.kategori}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Pilih kategori" />
                            </SelectTrigger>
                            <SelectContent>
                                {kategoriList.map((kat) => (
                                    <SelectItem key={kat} value={kat}>
                                        {kat}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Rincian */}
                    <div className="space-y-2">
                        <Label>
                            Rincian Kegiatan{" "}
                            <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                            rows={4}
                            placeholder="Tuliskan rincian kegiatan"
                            value={data.rincian}
                            onChange={(e) => setData("rincian", e.target.value)}
                        />
                    </div>

                    {/* Penanggung Jawab */}
                    <div className="space-y-2">
                        <Label>
                            Penanggung Jawab{" "}
                            <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            placeholder="Contoh: Pengurus RT"
                            value={data.pj_keg}
                            onChange={(e) => setData("pj_keg", e.target.value)}
                        />
                    </div>

                    {/* Panitia */}
                    <div className="space-y-2">
                        <Label>
                            Panitia <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            placeholder="Contoh: Karang Taruna"
                            value={data.panitia}
                            onChange={(e) => setData("panitia", e.target.value)}
                        />
                    </div>

                    {/* Dokumentasi */}
                    <div className="space-y-2">
                        <Label>
                            Dokumentasi <span className="text-red-500">*</span>
                        </Label>
                        <label
                            htmlFor="dok_keg"
                            className="flex flex-col items-center justify-center w-full border-2 border-dashed border-gray-300 rounded-lg py-10 cursor-pointer hover:bg-gray-50 transition-colors duration-200"
                        >
                            {preview ? (
                                <img
                                    src={preview}
                                    alt="Preview"
                                    className="max-h-64 object-contain mb-3"
                                />
                            ) : (
                                <>
                                    <Upload className="w-6 h-6 mb-2 text-gray-500" />
                                    <span className="text-sm text-gray-500">
                                        Klik atau seret gambar ke sini
                                    </span>
                                </>
                            )}
                            <input
                                id="dok_keg"
                                ref={fileInputRef}
                                type="file"
                                accept="image/*,application/pdf"
                                className="hidden"
                                onChange={handleFileChange}
                            />
                        </label>
                    </div>

                    {/* Tombol Aksi */}
                    <div className="flex justify-end gap-4 pt-2">
                        <Button
                            type="reset"
                            onClick={() => {
                                reset();
                                setPreview(null);
                                if (fileInputRef.current)
                                    fileInputRef.current.value = null;
                            }}
                            className="bg-gray-500 hover:bg-gray-600 text-white"
                        >
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="bg-blue-500 hover:bg-blue-600 text-white"
                        >
                            {isLoading ? "Menyimpan..." : "Tambah Kegiatan"}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
