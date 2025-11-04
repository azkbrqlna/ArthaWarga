import React, { useRef, useState } from "react";
import { useForm } from "@inertiajs/react";
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
import AppLayout from "@/layouts/AppLayout";
import { useNotify } from "@/components/ToastNotification";
import Breadcrumbs from "@/components/Breadcrumbs";

export default function TambahKegiatan() {
    const { notifySuccess, notifyError } = useNotify();
    const { data, setData, post, processing, reset } = useForm({
        nm_keg: "",
        tgl_mulai: "",
        tgl_selesai: "",
        kategori: "",
        rincian: "",
        pj_keg: "",
        panitia: "",
        dok_keg: null,
    });

    const kategoriList = [
        "Administrasi",
        "Kegiatan Sosial dan Pemberdayaan",
        "Kebersihan dan Pembangunan Lingkungan",
    ];

    const [preview, setPreview] = useState(null);
    const fileRef = useRef(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData("dok_keg", file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route("kegiatan.store"), {
            forceFormData: true,
            onSuccess: () => {
                notifySuccess("Berhasil", "Kegiatan berhasil disimpan");
                reset();
                setPreview(null);
                if (fileRef.current) fileRef.current.value = null;
            },
            onError: (err) => {
                const pesan = Object.values(err).join(", ");
                notifyError("Gagal Menyimpan", pesan);
            },
        });
    };

    return (
        <AppLayout>
            <div className="w-full min-h-screen bg-white overflow-y-auto overflow-x-hidden pl-0 pr-8 pb-10 md:pr-12 md:pb-12">
                <h1 className="text-3xl font-bold mb-10">TAMBAH KEGIATAN</h1>
                <Breadcrumbs
                    items={[
                        { label: "Dashboard", href: route("dashboard") },
                        { label: "Tambah Pemasukan" },
                    ]}
                />
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Nama & Tanggal */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
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

                        <div>
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

                        <div>
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
                    <div>
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
                    <div>
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
                    <div>
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
                    <div>
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
                    <div className="relative border-2 border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center py-8 cursor-pointer hover:border-emerald-400 transition">
                        {preview ? (
                            <img
                                src={preview}
                                alt="Preview"
                                className="max-h-40 rounded-md object-cover"
                            />
                        ) : (
                            <>
                                <Upload className="w-6 h-6 text-gray-500 mb-2" />
                                <p className="text-gray-500 text-sm">
                                    Klik atau seret gambar ke sini
                                </p>
                            </>
                        )}
                        <input
                            ref={fileRef}
                            type="file"
                            accept="image/*,application/pdf"
                            className="absolute inset-0 opacity-0 cursor-pointer z-10"
                            onChange={handleFileChange}
                        />
                    </div>

                    {/* Tombol */}
                    <div className="flex justify-center md:justify-end gap-4 pt-6">
                        <Button
                            type="button"
                            onClick={() => {
                                reset();
                                setPreview(null);
                            }}
                            className="bg-gray-500 hover:bg-gray-600 text-white px-6"
                        >
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            disabled={processing}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-6"
                        >
                            {processing ? "Menyimpan..." : "Simpan"}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
