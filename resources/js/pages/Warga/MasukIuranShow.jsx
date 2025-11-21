import React, { useState } from "react";
import { Head, useForm, router } from "@inertiajs/react";
import { route } from "ziggy-js";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useNotify } from "@/components/ToastNotification";
import AppLayout from "@/layouts/AppLayout";
import Breadcrumbs from "@/components/Breadcrumbs";
import { Upload } from "lucide-react";

export default function MasukIuranCreate({ iuran }) {
    const { notifySuccess, notifyError } = useNotify();

    const [preview, setPreview] = useState(null);

    const jenisIuran =
        iuran?.kategori_iuran?.nm_kat ||
        iuran?.pengumuman?.kat_iuran?.nm_kat ||
        iuran?.pengumuman?.judul ||
        "Iuran";

    // 🔥 TOTAL PEMBAYARAN OTOMATIS MENGAMBIL DARI PENGUMUMAN / IURAN
    const total =
        iuran?.nominal ||
        iuran?.jumlah ||
        iuran?.pengumuman?.jumlah ||
        0;

    const { data, setData, post, processing, errors, reset } = useForm({
        id: iuran?.id || "",
        jenis_iuran: jenisIuran,
        total: total,
        bkt_byr: null,
    });

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPreview(URL.createObjectURL(file));
            setData("bkt_byr", file);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!data.bkt_byr) {
            notifyError("Bukti kosong", "Harap unggah foto bukti pembayaran.");
            return;
        }

        post(route("masuk-iuran.store"), {
            forceFormData: true,
            onSuccess: () => {
                notifySuccess("Berhasil", "Pembayaran berhasil dikirim!");
                reset();
                setPreview(null);
                router.visit(route("masuk-iuran.index"));
            },
            onError: () => {
                notifyError("Gagal", "Terjadi kesalahan, coba lagi.");
            },
        });
    };

    return (
        <AppLayout>
            <Head title="Tambah Pembayaran Iuran" />

            <div className="w-full min-h-screen bg-white px-6 pb-12">

                <h1 className="text-3xl font-bold mb-8">TAMBAH PEMBAYARAN IURAN</h1>

                <Breadcrumbs
                    items={[
                        { label: "Dashboard", href: route("dashboard") },
                        { label: "Iuran", href: route("masuk-iuran.index") },
                        { label: "Tambah Pembayaran" },
                    ]}
                />

                {/* FORM FULL WIDTH */}
                <form onSubmit={handleSubmit} className="space-y-6 mt-6 w-full">

                    {/* Jenis Iuran */}
                    <div className="space-y-2">
                        <Label>Jenis Iuran</Label>
                        <Input value={jenisIuran} readOnly />
                    </div>

                    {/* Total Pembayaran */}
                    <div className="space-y-2">
                        <Label>Total Pembayaran</Label>
                        <Input
                            readOnly
                            value={`Rp ${Number(total).toLocaleString("id-ID")}`}
                        />
                    </div>

                    {/* Upload bukti */}
                    <div className="space-y-2">
                        <Label>
                            Bukti Pembayaran <span className="text-red-500">*</span>
                        </Label>

                        <div
                            className="border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition"
                            onClick={() => document.getElementById("upload-bukti").click()}
                        >
                            {preview ? (
                                <img src={preview} className="max-h-64 rounded-md" />
                            ) : (
                                <>
                                    <Upload className="w-10 h-10 mb-2 text-gray-600" />
                                    <p className="text-gray-600 text-sm">
                                        Klik untuk upload atau seret gambar ke sini
                                    </p>
                                </>
                            )}

                            <input
                                id="upload-bukti"
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                        </div>

                        {errors.bkt_byr && (
                            <p className="text-red-500 text-sm">{errors.bkt_byr}</p>
                        )}
                    </div>

                    {/* Tombol */}
                    <div className="flex justify-end gap-4 pt-2">
                        <Button
                            type="button"
                            onClick={() => router.visit(route("masuk-iuran.index"))}
                            className="bg-gray-500 hover:bg-gray-600 text-white"
                        >
                            Batal
                        </Button>

                        <Button
                            type="submit"
                            disabled={processing}
                            className="bg-amber-500 hover:bg-amber-600 text-white"
                        >
                            {processing ? "Mengirim..." : "Tambah Pembayaran"}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
