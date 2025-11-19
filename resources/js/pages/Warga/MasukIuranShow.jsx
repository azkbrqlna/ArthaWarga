import React, { useState } from "react";
import { Head, useForm, router } from "@inertiajs/react";
import { Upload } from "lucide-react";
import AppLayout from "@/layouts/AppLayout";
import { useNotify } from "@/components/ToastNotification";

export default function IuranAir({ iuran }) {
    const [preview, setPreview] = useState(null);
    const { notifySuccess, notifyError } = useNotify(); // ⬅ init toast

    const derivedJenis =
        iuran?.kategori_iuran?.nm_kat ||
        iuran?.pengumuman?.kat_iuran?.nm_kat ||
        iuran?.pengumuman?.judul ||
        "Iuran";

    const derivedTotal = iuran?.nominal ?? 0;

    const { data, setData, post, processing, errors, reset } = useForm({
        id: iuran?.id || "",
        jenis_iuran: derivedJenis,
        total: derivedTotal,
        bkt_byr: null,
    });

    const handleFileChange = (e) => {
        const file = e.target.files && e.target.files[0];
        if (file) {
            setPreview(URL.createObjectURL(file));
            setData("bkt_byr", file);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!data.bkt_byr) {
            notifyError(
                "Bukti belum diunggah!",
                "Harap unggah foto bukti pembayaran."
            );
            return;
        }

        post(route("masuk-iuran.store"), {
            forceFormData: true,
            onSuccess: () => {
                notifySuccess(
                    "Pembayaran berhasil!",
                    "Bukti pembayaran berhasil dikirim."
                );
                reset();
                setPreview(null);

                setTimeout(() => {
                    router.visit(route("masuk-iuran.index"));
                }, 900); // tunggu toast sebelum redirect
            },
            onError: () => {
                notifyError(
                    "Gagal mengirim!",
                    "Terjadi kesalahan, periksa koneksi atau ulangi kembali."
                );
            },
        });
    };

    return (
        <AppLayout>
            <Head title={`Iuran — ${data.jenis_iuran}`} />

            <div className="p-10 overflow-auto">
                <h1 className="text-2xl font-semibold mb-8">
                    Iuran {data.jenis_iuran}
                </h1>

                <form className="max-w-3xl" onSubmit={handleSubmit}>
                    {/* Jenis Iuran */}
                    <div className="mb-4">
                        <label className="block text-sm mb-2">
                            Jenis Iuran
                        </label>
                        <input
                            type="text"
                            value={data.jenis_iuran}
                            readOnly
                            className="w-full border border-gray-300 rounded-md p-2 text-sm"
                        />
                    </div>

                    {/* Total */}
                    <div className="mb-6">
                        <label className="block text-sm mb-2">Total</label>
                        <input
                            type="text"
                            value={`Rp. ${Number(data.total).toLocaleString(
                                "id-ID"
                            )}`}
                            readOnly
                            className="w-full border border-gray-300 rounded-md p-2 text-sm"
                        />
                    </div>

                    {/* Bukti Pembayaran */}
                    <div className="mb-8">
                        <label className="block text-sm mb-2">
                            Bukti Pembayaran{" "}
                            <span className="text-red-500">*</span>
                        </label>

                        <div
                            className="relative w-full border border-gray-300 rounded-md flex flex-col items-center justify-center p-6 text-gray-400 cursor-pointer"
                            onClick={() =>
                                document.getElementById("bukti-upload").click()
                            }
                        >
                            {preview ? (
                                <img
                                    src={preview}
                                    alt="Bukti Pembayaran"
                                    className="max-h-48 rounded-md"
                                />
                            ) : (
                                <>
                                    <Upload className="w-6 h-6 mb-2 text-gray-500" />
                                    <span className="text-gray-500">
                                        Klik atau seret gambar ke sini
                                    </span>
                                </>
                            )}

                            <input
                                id="bukti-upload"
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                        </div>

                        {errors.bkt_byr && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors.bkt_byr}
                            </p>
                        )}
                    </div>

                    {/* Tombol */}
                    <div className="flex gap-4 justify-center">
                        <button
                            type="button"
                            className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-8 rounded-md"
                            onClick={() =>
                                router.visit(route("masuk-iuran.index"))
                            }
                        >
                            BATAL
                        </button>

                        <button
                            type="submit"
                            disabled={processing}
                            className="bg-emerald-400 hover:bg-emerald-500 text-white py-2 px-8 rounded-md"
                        >
                            {processing ? "Mengirim..." : "Tambah Pemasukan"}
                        </button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
