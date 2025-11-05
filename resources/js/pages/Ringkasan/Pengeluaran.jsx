import React, { useState, useRef, useEffect } from "react";
import { useForm, usePage } from "@inertiajs/react";
import { route } from "ziggy-js";
import AppLayout from "@/layouts/AppLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { useNotify } from "@/components/ToastNotification";
import axios from "axios";

export default function Pengeluaran() {
    const { kegiatans = [] } = usePage().props;
    const { notifySuccess, notifyError } = useNotify();

    const { data, setData, reset } = useForm({
        tipe: "bop",
        tgl: "",
        keg_id: "",
        nominal: "",
        ket: "",
        bkt_nota: null,
    });

    const [preview, setPreview] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef(null);

    // 🔹 Format nominal ke Rupiah
    const formatRupiah = (value) => {
        if (!value) return "";
        const numberString = value.replace(/[^,\d]/g, "");
        const split = numberString.split(",");
        const sisa = split[0].length % 3;
        let rupiah = split[0].substr(0, sisa);
        const ribuan = split[0].substr(sisa).match(/\d{3}/gi);

        if (ribuan) {
            const separator = sisa ? "." : "";
            rupiah += separator + ribuan.join(".");
        }
        rupiah = split[1] !== undefined ? rupiah + "," + split[1] : rupiah;
        return "Rp " + rupiah;
    };

    const handleNominalChange = (e) => {
        const raw = e.target.value;
        const formatted = formatRupiah(raw);
        setData("nominal", formatted);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData("bkt_nota", file);
            setPreview(URL.createObjectURL(file));
        } else {
            setData("bkt_nota", null);
            setPreview(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        // 🔹 Validasi user-friendly sebelum kirim
        if (!data.tipe) {
            notifyError(
                "Jenis belum dipilih",
                "Pilih jenis pengeluaran terlebih dahulu."
            );
            setIsLoading(false);
            return;
        }
        if (!data.tgl) {
            notifyError("Tanggal kosong", "Masukkan tanggal pengeluaran.");
            setIsLoading(false);
            return;
        }
        if (!data.keg_id) {
            notifyError(
                "Kegiatan belum dipilih",
                "Pilih kegiatan terkait pengeluaran ini."
            );
            setIsLoading(false);
            return;
        }
        if (!data.nominal || data.nominal === "Rp 0") {
            notifyError(
                "Nominal kosong",
                "Masukkan jumlah uang yang dikeluarkan."
            );
            setIsLoading(false);
            return;
        }
        if (!data.ket.trim()) {
            notifyError(
                "Deskripsi kosong",
                "Tuliskan keterangan atau tujuan pengeluaran."
            );
            setIsLoading(false);
            return;
        }
        if (!data.bkt_nota) {
            notifyError(
                "Bukti belum diunggah",
                "Unggah foto nota atau kwitansi pengeluaran."
            );
            setIsLoading(false);
            return;
        }

        const cleanNominal = data.nominal.replace(/[^0-9]/g, "");

        const formData = new FormData();
        formData.append("tipe", data.tipe);
        formData.append("tgl", data.tgl);
        formData.append("keg_id", data.keg_id);
        formData.append("nominal", cleanNominal);
        formData.append("ket", data.ket);
        if (data.bkt_nota) formData.append("bkt_nota", data.bkt_nota);

        try {
            await axios.post(route("pengeluaran.store"), formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            notifySuccess("Berhasil", "Pengeluaran berhasil disimpan!");
            reset();
            setPreview(null);
            if (fileInputRef.current) fileInputRef.current.value = null;
        } catch (error) {
            console.error(error);
            let pesan = "Terjadi kesalahan, coba beberapa saat lagi.";
            if (error.response) {
                switch (error.response.status) {
                    case 422:
                        pesan = "Periksa kembali data yang kamu isi.";
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
            <div className="max-w-4xl mx-auto p-8">
                <h1 className="text-2xl font-bold text-gray-800 mb-8">
                    Tambah Pengeluaran
                </h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Jenis */}
                    {/* Jenis & Tanggal dalam satu baris */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Jenis Pengeluaran */}
                        <div className="space-y-2">
                            <Label>
                                Jenis Pengeluaran{" "}
                                <span className="text-red-500">*</span>
                            </Label>
                            <select
                                value={data.tipe}
                                onChange={(e) =>
                                    setData("tipe", e.target.value)
                                }
                                className="border border-gray-300 rounded-md px-3 py-2 w-full focus:ring-2 focus:ring-rose-400"
                            >
                                <option value="bop">BOP</option>
                                <option value="iuran">Iuran</option>
                            </select>
                        </div>

                        {/* Tanggal */}
                        <div className="space-y-2">
                            <Label>
                                Tanggal <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                type="date"
                                value={data.tgl}
                                onChange={(e) => setData("tgl", e.target.value)}
                                className="w-full"
                            />
                        </div>
                    </div>

                    {/* Kegiatan */}
                    <div className="space-y-2">
                        <Label>
                            Kegiatan <span className="text-red-500">*</span>
                        </Label>
                        <select
                            value={data.keg_id}
                            onChange={(e) => setData("keg_id", e.target.value)}
                            className="border border-gray-300 rounded-md px-3 py-2 w-full focus:ring-2 focus:ring-rose-400"
                        >
                            <option value="">Pilih kegiatan</option>
                            {kegiatans.map((k) => (
                                <option key={k.id} value={k.id}>
                                    {k.nm_keg}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Nominal */}
                    <div className="space-y-2">
                        <Label>
                            Nominal <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            type="text"
                            placeholder="Rp 0"
                            value={data.nominal}
                            onChange={handleNominalChange}
                        />
                    </div>

                    {/* Deskripsi */}
                    <div className="space-y-2">
                        <Label>
                            Keterangan <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                            placeholder="Tuliskan keterangan pengeluaran..."
                            value={data.ket}
                            onChange={(e) => setData("ket", e.target.value)}
                        />
                    </div>

                    {/* Bukti Nota */}
                    <div className="space-y-2">
                        <Label>
                            Bukti Nota / Kwitansi{" "}
                            <span className="text-red-500">*</span>
                        </Label>
                        <label
                            htmlFor="nota"
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
                                id="nota"
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
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
                            className="bg-rose-500 hover:bg-rose-600 text-white"
                        >
                            {isLoading ? "Menyimpan..." : "Tambah Pengeluaran"}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
