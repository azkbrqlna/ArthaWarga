import React, { useRef, useState, useEffect } from "react";
import { useForm, router } from "@inertiajs/react";
import { route } from "ziggy-js";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { useNotify } from "@/components/ToastNotification";
import axios from "axios";

export default function FormBOP({ tanggal }) {
    const { notifySuccess, notifyError } = useNotify();
    const { data, setData, reset } = useForm({
        tgl: tanggal || "",
        nominal: "",
        ket: "",
        bkt_nota: null,
    });

    const [preview, setPreview] = useState(null);
    const [isLoading, setIsLoading] = useState(false); // 🟢 state baru
    const fileInputRef = useRef(null);

    useEffect(() => {
        setData("tgl", tanggal);
    }, [tanggal]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData("bkt_nota", file);
            setPreview(URL.createObjectURL(file));
        } else setPreview(null);
    };

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true); // 🟢 mulai loading

        // validasi user-friendly
        if (!data.nominal || data.nominal === "Rp 0") {
            notifyError(
                "Nominal belum diisi",
                "Masukkan jumlah uang yang dikeluarkan."
            );
            setIsLoading(false);
            return;
        }
        if (!data.ket.trim()) {
            notifyError(
                "Deskripsi kosong",
                "Tuliskan keterangan atau tujuan penggunaan dana."
            );
            setIsLoading(false);
            return;
        }
        if (!data.bkt_nota) {
            notifyError(
                "Bukti belum diunggah",
                "Unggah foto atau file nota sebagai bukti pengeluaran."
            );
            setIsLoading(false);
            return;
        }

        const cleanNominal = data.nominal.replace(/[^0-9]/g, "");

        const formData = new FormData();
        formData.append("tgl", tanggal);
        formData.append("nominal", cleanNominal);
        formData.append("ket", data.ket);
        if (data.bkt_nota) formData.append("bkt_nota", data.bkt_nota);

        try {
            await axios.post(route("bop.create"), formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            notifySuccess("Berhasil", "Data BOP berhasil disimpan!");
            reset();
            setPreview(null);
            if (fileInputRef.current) fileInputRef.current.value = null;
            router.visit("/dashboard");
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
            setIsLoading(false); // 🟢 matikan loading setelah selesai
        }
    };

    return (
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
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
                    placeholder="Tuliskan detail pemasukan..."
                    value={data.ket}
                    onChange={(e) => setData("ket", e.target.value)}
                />
            </div>

            {/* Upload Bukti */}
            <div className="space-y-2">
                <Label>
                    Bukti <span className="text-red-500">*</span>
                </Label>
                <label
                    htmlFor="bukti"
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
                        id="bukti"
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
                    className="bg-emerald-500 hover:bg-emerald-600 text-white"
                >
                    {isLoading ? "Menyimpan..." : "Tambah Pemasukan"}
                </Button>
            </div>
        </form>
    );
}
