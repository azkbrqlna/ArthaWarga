import React from "react";
import { useForm } from "@inertiajs/react";
import { route } from "ziggy-js";
import AppLayout from "@/layouts/AppLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useNotify } from "@/components/ToastNotification";
import Breadcrumbs from "@/components/Breadcrumbs";

export default function MasterData({ auth, kategoriIurans }) {
    // 1. Setup Data Awal
    const firstData = kategoriIurans.length > 0 ? kategoriIurans[0] : null;

    // 2. Setup Form Inertia
    const { data, setData, put, processing } = useForm({
        id: firstData?.id || "",
        harga_meteran: firstData?.harga_meteran || 0,
        abonemen: firstData?.abonemen || 0,
        harga_sampah: firstData?.harga_sampah || 0,
        jimpitan_air: firstData?.jimpitan_air || 0,
    });

    const { notifySuccess, notifyError } = useNotify();

    // 3. Helper Format Rupiah
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

    // 4. Handle Perubahan Input Angka
    const handleNumberChange = (field, value) => {
        const cleanValue = value.replace(/[^0-9]/g, "");
        let numericValue = parseInt(cleanValue || "0", 10);

        setData(field, numericValue);
    };

    // 5. Tombol Batal (Kembali ke halaman sebelumnya)
    const handleCancel = () => {
        window.history.back();
    };

    // 6. Submit
    const handleSubmit = (e) => {
        e.preventDefault();
        put(route("kat_iuran.update", data.id), {
            preserveScroll: true,
            onSuccess: () => {
                notifySuccess("Berhasil", "Tagihan air & sampah berhasil diperbarui!");
            },
            onError: (err) => {
                notifyError("Gagal", "Terjadi kesalahan saat menyimpan.");
            },
        });
    };

    return (
        <AppLayout>
            <div className="w-full min-h-screen bg-white overflow-y-auto overflow-x-hidden pl-0 pr-8 pb-10 md:pr-12 md:pb-12">
                <h1 className="text-3xl font-bold mb-8">Edit Tagihan Air & Sampah</h1>

                <Breadcrumbs
                    items={[
                        { label: "Dashboard", href: route("dashboard") },
                        { label: "Edit Tagihan" },
                    ]}
                />

                <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                    {/* 1. INPUT KATEGORI (FIX TERANG, TANPA BINTANG MERAH) */}
                    <div className="space-y-2">
                        <Label>Kategori</Label>
                        <Input
                            type="text"
                            value="Air dan Sampah"
                            readOnly
                            className="w-full border-gray-300 bg-white text-gray-900 focus:ring-0 cursor-default"
                        />
                    </div>

                    {/* 2. INPUT HARGA ABONEMEN */}
                    <div className="space-y-2">
                        <Label>
                            Harga Abonemen{" "}
                            <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            type="text"
                            placeholder="Rp 0"
                            value={formatRupiah(data.abonemen)}
                            onChange={(e) =>
                                handleNumberChange("abonemen", e.target.value)
                            }
                            className="w-full border-gray-300"
                        />
                    </div>

                    {/* 3. INPUT HARGA METERAN */}
                    <div className="space-y-2">
                        <Label>
                            Harga/meter persegi{" "}
                            <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            type="text"
                            placeholder="Rp 0"
                            value={formatRupiah(data.harga_meteran)}
                            onChange={(e) =>
                                handleNumberChange(
                                    "harga_meteran",
                                    e.target.value
                                )
                            }
                            className="w-full border-gray-300"
                        />
                    </div>

                    {/* 4. INPUT HARGA SAMPAH */}
                    <div className="space-y-2">
                        <Label>
                            Harga Sampah <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            type="text"
                            placeholder="Rp 0"
                            value={formatRupiah(data.harga_sampah)}
                            onChange={(e) =>
                                handleNumberChange(
                                    "harga_sampah",
                                    e.target.value
                                )
                            }
                            className="w-full border-gray-300"
                        />
                    </div>

                    {/* 5. INPUT JIMPITAN AIR (PERSEN) */}
                    <div className="space-y-2">
                        <Label>
                            Jimpitan Air <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            type="text"
                            placeholder="Rp 0"
                            value={formatRupiah(data.jimpitan_air)}
                            onChange={(e) =>
                                handleNumberChange(
                                    "jimpitan_air",
                                    e.target.value
                                )
                            }
                            className="w-full border-gray-300"
                        />
                    </div>

                    {/* TOMBOL ACTION */}
                    <div className="flex justify-end gap-4 pt-4">
                        <Button
                            type="button"
                            onClick={handleCancel}
                            className="bg-gray-500 hover:bg-gray-600 text-white"
                        >
                            Batal
                        </Button>

                        <Button
                            type="submit"
                            disabled={processing}
                            className="bg-rose-500 hover:bg-rose-600 text-white"
                        >
                            {processing ? "Menyimpan..." : "Simpan"}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
