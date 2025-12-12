import React, { useState, useRef, useEffect } from "react";
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
import Breadcrumbs from "@/components/Breadcrumbs";

export default function Pengeluaran() {
    const { kegiatans = [], sisaBop, sisaIuran } = usePage().props;
    const { notifySuccess, notifyError } = useNotify();
    const fileInputRef = useRef(null);

    const { data, setData, post, reset, processing } = useForm({
        tipe: "bop",
        tgl: "",
        keg_id: "",
        nominal: 0,
        toko: "",
        ket: "",
        bkt_nota: null,
    });

    const [preview, setPreview] = useState(null);
    const [errorNominal, setErrorNominal] = useState("");

    const formatRupiah = (value) => {
        if (!value) return "Rp 0";
        const numberString = String(value).replace(/[^,\d]/g, "");
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

    useEffect(() => {
        const currentLimit =
            data.tipe === "bop"
                ? parseInt(sisaBop || "0", 10)
                : parseInt(sisaIuran || "0", 10);

        if (data.nominal > currentLimit) {
            setErrorNominal(
                `Nominal melebihi Dana ${
                    data.tipe === "bop" ? "BOP" : "Iuran"
                } saat ini (${formatRupiah(String(currentLimit))})`
            );
        } else {
            setErrorNominal("");
        }
    }, [data.tipe, sisaBop, sisaIuran]);

    const handleNominalChange = (e) => {
        const raw = e.target.value;
        const cleanValue = raw.replace(/[^0-9]/g, "");
        const numericValue = parseInt(cleanValue || "0", 10);

        const rawLimit = data.tipe === "bop" ? sisaBop : sisaIuran;
        const stringLimit = String(rawLimit || "0").replace(/\./g, "");
        const currentLimit = parseInt(stringLimit, 10);

        if (numericValue > currentLimit) {
            setErrorNominal(
                `Nominal melebihi Dana ${
                    data.tipe === "bop" ? "BOP" : "Iuran"
                } saat ini (${formatRupiah(String(currentLimit))})`
            );
        } else {
            setErrorNominal("");
        }

        setData("nominal", numericValue);
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

    const handleSubmit = (e) => {
        e.preventDefault();

        // 1. Cek Validasi Nominal vs Saldo
        if (errorNominal) {
            notifyError("Gagal", "Nominal melebihi batas dana.");
            return;
        }

        // 2. Cek Kelengkapan Data
        const missingFields = [];

        if (!data.tipe) missingFields.push("Jenis Pengeluaran");
        if (!data.tgl) missingFields.push("Tanggal");
        if (!data.keg_id) missingFields.push("Kegiatan");
        if (!data.nominal || data.nominal === 0) missingFields.push("Nominal");
        if (!data.ket || !data.ket.trim()) missingFields.push("Keterangan");

        // TAMBAHAN: Cek Bukti Nota
        if (!data.bkt_nota) missingFields.push("Bukti Nota");

        // Jika ada field yang kosong, tampilkan error spesifik
        if (missingFields.length > 0) {
            notifyError(
                "Data Belum Lengkap",
                `Mohon lengkapi: ${missingFields.join(", ")}`
            );
            return;
        }

        // 3. Proses Submit
        const sendData = new FormData();
        sendData.append("tipe", data.tipe);
        sendData.append("tgl", data.tgl);
        sendData.append("keg_id", data.keg_id);
        sendData.append("nominal", data.nominal);
        sendData.append("toko", data.toko);
        sendData.append("ket", data.ket);

        // Karena sudah divalidasi wajib ada, kita bisa langsung append (atau tetap pakai if untuk safety)
        if (data.bkt_nota) sendData.append("bkt_nota", data.bkt_nota);

        post(route("pengeluaran.store"), {
            data: sendData,
            forceFormData: true,
            onSuccess: () => {
                notifySuccess("Berhasil", "Pengeluaran berhasil disimpan!");
                reset();
                setPreview(null);
                if (fileInputRef.current) fileInputRef.current.value = null;
                router.visit(route("dashboard"));
            },
            onError: (err) => {
                Object.values(err).forEach((msg) => {
                    notifyError("Gagal", msg);
                });
            },
        });
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
                                }}
                            >
                                <SelectTrigger className="w-full border border-gray-300">
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
                                className="w-full"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>
                            Kegiatan <span className="text-red-500">*</span>
                        </Label>
                        <Select
                            value={data.keg_id}
                            onValueChange={(val) => setData("keg_id", val)}
                        >
                            <SelectTrigger className="w-full border border-gray-300">
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

                    <div className="space-y-2">
                        <Label>
                            Nominal <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            type="text"
                            placeholder="Rp 0"
                            value={formatRupiah(data.nominal)}
                            onChange={handleNominalChange}
                            className={
                                errorNominal
                                    ? "border-red-500 focus-visible:ring-0"
                                    : ""
                            }
                        />
                        {errorNominal && (
                            <p className="text-sm text-red-600 mt-1">
                                {errorNominal}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label>Nama Toko (opsional)</Label>
                        <Input
                            type="text"
                            placeholder="Nama Toko"
                            value={data.toko}
                            onChange={(e) => setData("toko", e.target.value)}
                            className="w-full"
                        />
                    </div>

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

                    <div className="space-y-2">
                        <Label>
                            Bukti Nota / Kwitansi{" "}
                            <span className="text-red-500">*</span>
                        </Label>
                        <label
                            htmlFor="nota"
                            className="flex flex-col items-center justify-center w-full border-2 border-dashed border-gray-300 rounded-lg py-10 cursor-pointer hover:bg-gray-50"
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
                            disabled={processing}
                            className="bg-rose-500 hover:bg-rose-600 text-white"
                        >
                            {processing ? "Menyimpan..." : "Tambah Pengeluaran"}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}