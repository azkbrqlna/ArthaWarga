import React, { useState, useEffect } from "react";
import AppLayout from "../../Layouts/AppLayout";
import { Head, useForm, Link } from "@inertiajs/react";
import Breadcrumbs from "@/Components/Breadcrumbs";
import { useNotify } from "@/components/ToastNotification"; // 🟢 IMPORT TOAST

// --- SHADCN IMPORTS ---
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

export default function Create({ auth, wargaList, masterHarga }) {
    // 🟢 Inisialisasi Toast
    const { notifySuccess, notifyError } = useNotify();

    // --- 1. LOGIC TANGGAL: Default Bulan Lalu ---
    const today = new Date();
    today.setMonth(today.getMonth() - 1);

    const defaultBulan = today.getMonth() + 1;
    const defaultTahun = today.getFullYear();

    const { data, setData, post, processing, errors } = useForm({
        usr_id: "",
        bulan: defaultBulan,
        tahun: defaultTahun,
        mtr_bln_lalu: 0,
        mtr_skrg: "",
        pakai_sampah: false,
    });

    const [estimasi, setEstimasi] = useState(0);

    // --- LOGIC AUTOFILL: Saat Warga Dipilih ---
    const handleUserChange = (val) => {
        const selectedId = val;
        const selectedWarga = wargaList.find((w) => w.id == selectedId);

        if (selectedWarga) {
            setData((prev) => ({
                ...prev,
                usr_id: selectedId,
                mtr_bln_lalu: selectedWarga.last_meter,
                mtr_skrg: "",
            }));
        } else {
            setData("usr_id", "");
        }
    };

    // --- 2. LOGIC HITUNG ESTIMASI ---
    useEffect(() => {
        const mtrLalu = parseInt(data.mtr_bln_lalu) || 0;
        const mtrSkrg = parseInt(data.mtr_skrg) || 0;

        const pemakaian = Math.max(0, mtrSkrg - mtrLalu);

        const h_meter = masterHarga?.harga_meteran ?? 0;
        const h_abonemen = masterHarga?.abonemen ?? 0;
        const h_jimpitan = masterHarga?.jimpitan_air ?? 0;
        const h_sampah = masterHarga?.harga_sampah ?? 0;

        const biayaAir = pemakaian * h_meter;
        const biayaSampahTotal = data.pakai_sampah ? h_sampah : 0;

        setEstimasi(biayaAir + h_abonemen + h_jimpitan + biayaSampahTotal);
    }, [data.mtr_bln_lalu, data.mtr_skrg, data.pakai_sampah, masterHarga]);

    // 🟢 REVISI FUNGSI SUBMIT DENGAN VALIDASI & TOAST
    const submit = (e) => {
        e.preventDefault();

        // 1. Validasi Warga
        if (!data.usr_id) {
            notifyError(
                "Warga Belum Dipilih",
                "Silakan pilih nama warga terlebih dahulu."
            );
            return;
        }

        // 2. Validasi Meteran Kosong
        if (data.mtr_skrg === "" || data.mtr_skrg === null) {
            notifyError("Meteran Kosong", "Masukkan angka meteran saat ini.");
            return;
        }

        // 3. Validasi Logika Meteran (Sekarang < Lalu)
        if (parseInt(data.mtr_skrg) < parseInt(data.mtr_bln_lalu)) {
            notifyError(
                "Meteran Tidak Valid",
                `Meteran sekarang (${data.mtr_skrg}) tidak boleh lebih kecil dari bulan lalu (${data.mtr_bln_lalu}).`
            );
            return;
        }

        // 4. Validasi Bulan/Tahun
        if (!data.bulan || !data.tahun) {
            notifyError(
                "Periode Kosong",
                "Bulan dan Tahun tagihan harus diisi."
            );
            return;
        }

        // Kirim Data
        post(route("tagihan.store"), {
            onSuccess: () => {
                notifySuccess("Berhasil", "Data tagihan berhasil disimpan!");
            },
            onError: (err) => {
                // Ambil pesan error pertama dari server jika ada
                const firstError = Object.values(err)[0];
                notifyError(
                    "Gagal Menyimpan",
                    firstError || "Periksa kembali data inputan."
                );
            },
        });
    };

    const formatRupiah = (num) =>
        new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(num || 0);

    const breadcrumbItems = [
        { label: "Tagihan Bulanan", href: "/tagihan-bulanan/monitoring" },
        { label: "Tambah Tagihan", href: null },
    ];

    return (
        <AppLayout user={auth.user}>
            <div className="w-full min-h-screen bg-white overflow-y-auto overflow-x-hidden pl-0 pr-8 pb-10 md:pr-12 md:pb-12">
                <h1 className="text-3xl font-bold mb-10">TAMBAH TAGIHAN</h1>
                <Breadcrumbs items={breadcrumbItems} />

                {/* Menggunakan Card sebagai wrapper form agar lebih rapi */}
                <Card className="border-0 shadow-none p-0">
                    <CardContent className="p-0">
                        <form onSubmit={submit} className="space-y-6">
                            {/* ROW 1: Pilih Warga */}
                            <div className="space-y-2">
                                <Label
                                    htmlFor="warga"
                                    className="text-base font-bold text-gray-700"
                                >
                                    Nama Warga{" "}
                                    <span className="text-red-500">*</span>
                                </Label>
                                <Select
                                    onValueChange={handleUserChange}
                                    value={data.usr_id?.toString()}
                                >
                                    <SelectTrigger className="w-full h-11 bg-white border-gray-300">
                                        <SelectValue placeholder="-- Pilih Warga --" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {wargaList.map((w) => (
                                            <SelectItem
                                                key={w.id}
                                                value={w.id.toString()}
                                            >
                                                {w.nm_lengkap} ({w.alamat})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.usr_id && (
                                    <p className="text-red-500 text-xs mt-1">
                                        {errors.usr_id}
                                    </p>
                                )}
                            </div>

                            {/* ROW 2: Bulan & Tahun (Grid) */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-base font-bold text-gray-700">
                                        Bulan Tagihan{" "}
                                        <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        type="number"
                                        min="1"
                                        max="12"
                                        className="h-11 bg-white border-gray-300"
                                        placeholder="Contoh: 12"
                                        value={data.bulan}
                                        onChange={(e) =>
                                            setData("bulan", e.target.value)
                                        }
                                        // required dihapus agar validasi manual handle errornya
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-base font-bold text-gray-700">
                                        Tahun Tagihan{" "}
                                        <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        type="number"
                                        className="h-11 bg-white border-gray-300"
                                        placeholder="Contoh: 2025"
                                        value={data.tahun}
                                        onChange={(e) =>
                                            setData("tahun", e.target.value)
                                        }
                                    />
                                </div>
                            </div>

                            {/* ROW 3: Meteran (Grid) */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-base font-bold text-gray-700">
                                        Meteran Bulan Lalu{" "}
                                        <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        type="number"
                                        className="h-11 bg-white border-gray-300 "
                                        value={data.mtr_bln_lalu}
                                        onChange={(e) =>
                                            setData(
                                                "mtr_bln_lalu",
                                                e.target.value
                                            )
                                        }
                                        min="0"
                                        readOnly
                                    />
                                    <span className="text-xs text-gray-400 mt-1 block">
                                        Otomatis terisi dari data terakhir
                                    </span>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-base font-bold text-gray-700">
                                        Meteran Sekarang{" "}
                                        <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        type="number"
                                        className="h-11 bg-white border-gray-300"
                                        placeholder="Masukkan angka meteran..."
                                        value={data.mtr_skrg}
                                        onChange={(e) =>
                                            setData("mtr_skrg", e.target.value)
                                        }
                                        min={data.mtr_bln_lalu}
                                    />
                                    {errors.mtr_skrg && (
                                        <p className="text-red-500 text-xs mt-1">
                                            {errors.mtr_skrg}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* ROW 4: Kategori Sampah */}
                            <div className="space-y-2">
                                <Label className="text-base font-bold text-gray-700">
                                    Tagihan Sampah{" "}
                                    <span className="text-red-500">*</span>
                                </Label>
                                <Select
                                    value={data.pakai_sampah ? "1" : "0"}
                                    onValueChange={(val) =>
                                        setData("pakai_sampah", val === "1")
                                    }
                                >
                                    <SelectTrigger className="w-full h-11 bg-white border-gray-300">
                                        <SelectValue placeholder="Pilih Opsi Sampah" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="0">
                                            Tidak Menggunakan Sampah
                                        </SelectItem>
                                        <SelectItem value="1">
                                            Ya (+{" "}
                                            {formatRupiah(
                                                masterHarga?.harga_sampah
                                            )}
                                            )
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <hr className="border-dashed border-gray-300 my-6" />

                            {/* FOOTER: Total & Tombol Aksi */}
                            <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-2">
                                {/* Kiri: Total Estimasi */}
                                <div className="flex items-center gap-2">
                                    <span className="text-gray-700 font-bold text-lg">
                                        Total Estimasi:
                                    </span>
                                    <span className="text-2xl font-bold text-green-600">
                                        {formatRupiah(estimasi)}
                                    </span>
                                </div>

                                {/* Kanan: Tombol Batal & Simpan */}
                                <div className="flex gap-3 w-full md:w-auto">
                                    <Button
                                        asChild
                                        variant="secondary"
                                        className="w-full md:w-auto px-6 h-11 bg-gray-500 text-white hover:bg-gray-600"
                                    >
                                        <Link href={route("tagihan.rt.index")}>
                                            Batal
                                        </Link>
                                    </Button>

                                    <Button
                                        type="submit"
                                        className="w-full md:w-auto px-6 h-11 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20"
                                        disabled={processing} // logic tombol disabled tetap ada
                                    >
                                        {processing
                                            ? "Menyimpan..."
                                            : "Simpan Tagihan"}
                                    </Button>
                                </div>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
