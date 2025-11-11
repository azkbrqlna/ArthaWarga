import React, { useState, useRef } from "react";
import { useForm, usePage, router } from "@inertiajs/react";
import { route } from "ziggy-js";
import AppLayout from "@/layouts/AppLayout";
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
import { Banknote, CircleDollarSign, Upload } from "lucide-react";
import { useNotify } from "@/components/ToastNotification";
import axios from "axios";
import Breadcrumbs from "@/components/Breadcrumbs";

export default function Pengeluaran() {
    const { kegiatans = [], sisaBop, sisaIuran } = usePage().props;
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
    const [errorNominal, setErrorNominal] = useState("");
    const fileInputRef = useRef(null);

    // format angka ke rupiah
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

    // validasi nominal tidak boleh melebihi dana yang tersedia
    const handleNominalChange = (e) => {
        const raw = e.target.value;
        const cleanValue = raw.replace(/[^0-9]/g, "");
        const numericValue = parseInt(cleanValue || "0", 10);

        // batas dana tergantung jenis pengeluaran
        const limit =
            data.tipe === "bop"
                ? parseInt(sisaBop || "0", 10)
                : parseInt(sisaIuran || "0", 10);

        if (numericValue > limit) {
            setErrorNominal(
                `Nominal melebihi Dana ${
                    data.tipe === "bop" ? "BOP" : "Iuran"
                } Sekarang`
            );
            return; // stop pengetikan
        } else {
            setErrorNominal("");
            setData("nominal", formatRupiah(raw));
        }
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

        if (
            !data.tipe ||
            !data.tgl ||
            !data.keg_id ||
            !data.nominal ||
            !data.ket.trim() ||
            !data.bkt_nota
        ) {
            notifyError(
                "Data belum lengkap",
                "Periksa semua kolom wajib diisi."
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
            router.visit("/dashboard");
            reset();
            setPreview(null);
            if (fileInputRef.current) fileInputRef.current.value = null;
        } catch (error) {
            console.error(error);
            notifyError("Gagal", "Terjadi kesalahan saat menyimpan data.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AppLayout>
            <div className="w-full min-h-screen bg-white overflow-y-auto overflow-x-hidden pl-0 pr-8 pb-10 md:pr-12 md:pb-12">
                <h1 className="text-3xl font-bold mb-8">TAMBAH PENGELUARAN</h1>

                <Breadcrumbs
                    items={[
                        { label: "Dashboard", href: route("dashboard") },
                        { label: "Tambah Pengeluaran" },
                    ]}
                />

                {/* Ringkasan Dana */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 mt-4">
                    <div className="flex items-center gap-4 border rounded-xl p-4 shadow-sm bg-white">
                        <div className="bg-gray-100 p-3 rounded-lg">
                            <CircleDollarSign className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">
                                Dana BOP Sekarang
                            </p>
                            <p className="text-xl font-semibold">
                                {formatRupiah(String(sisaBop || "0"))}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 border rounded-xl p-4 shadow-sm bg-white">
                        <div className="bg-gray-100 p-3 rounded-lg">
                            <Banknote className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">
                                Dana Iuran Sekarang
                            </p>
                            <p className="text-xl font-semibold">
                                {formatRupiah(String(sisaIuran || "0"))}
                            </p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Jenis dan tanggal */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label>
                                Jenis Pengeluaran{" "}
                                <span className="text-red-500">*</span>
                            </Label>
                            <Select
                                value={data.tipe}
                                onValueChange={(val) => {
                                    setData("tipe", val);
                                    setErrorNominal("");
                                    setData("nominal", "");
                                }}
                            >
                                <SelectTrigger className="w-full border border-gray-300 transition-colors">
                                    <SelectValue placeholder="Pilih jenis" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="bop">BOP</SelectItem>
                                    <SelectItem value="iuran">Iuran</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>
                                Tanggal <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                type="date"
                                value={data.tgl}
                                onChange={(e) => setData("tgl", e.target.value)}
                                className="w-full transition-colors"
                            />
                        </div>
                    </div>

                    {/* Kegiatan */}
                    <div className="space-y-2">
                        <Label>
                            Kegiatan <span className="text-red-500">*</span>
                        </Label>
                        <Select
                            value={data.keg_id}
                            onValueChange={(val) => setData("keg_id", val)}
                        >
                            <SelectTrigger className="w-full border border-gray-300 transition-colors">
                                <SelectValue placeholder="Pilih kegiatan" />
                            </SelectTrigger>
                            <SelectContent>
                                {kegiatans.length > 0 ? (
                                    kegiatans.map((k) => (
                                        <SelectItem
                                            key={k.id}
                                            value={String(k.id)}
                                        >
                                            {k.nm_keg}
                                        </SelectItem>
                                    ))
                                ) : (
                                    <SelectItem disabled>
                                        Tidak ada kegiatan
                                    </SelectItem>
                                )}
                            </SelectContent>
                        </Select>
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
                            className={`transition-colors ${
                                errorNominal ? "border-red-500" : ""
                            }`}
                        />
                        {errorNominal && (
                            <p className="text-sm text-red-600">
                                {errorNominal}
                            </p>
                        )}
                    </div>

                    {/* Keterangan */}
                    <div className="space-y-2">
                        <Label>
                            Keterangan <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                            placeholder="Tuliskan keterangan pengeluaran..."
                            value={data.ket}
                            onChange={(e) => setData("ket", e.target.value)}
                            className="transition-colors"
                        />
                    </div>

                    {/* Upload nota */}
                    <div className="space-y-2">
                        <Label>
                            Bukti Nota / Kwitansi{" "}
                            <span className="text-red-500">*</span>
                        </Label>
                        <label
                            htmlFor="nota"
                            className="flex flex-col items-center justify-center w-full border-2 border-dashed border-gray-300 rounded-lg py-10 cursor-pointer hover:bg-gray-50 transition-colors"
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

                    {/* Tombol */}
                    <div className="flex justify-end gap-4 pt-2">
                        <Button
                            type="reset"
                            onClick={() => {
                                reset();
                                setPreview(null);
                                if (fileInputRef.current)
                                    fileInputRef.current.value = null;
                                setErrorNominal("");
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
