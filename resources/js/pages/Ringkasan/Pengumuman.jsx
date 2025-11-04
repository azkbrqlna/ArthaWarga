import React, { useEffect } from "react";
import { useForm } from "@inertiajs/react";
import { route } from "ziggy-js";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useNotify } from "@/components/ToastNotification";
import AppLayout from "@/layouts/AppLayout";

export default function Pengumuman({ kategori_iuran }) {
    const { notifySuccess, notifyError } = useNotify();
    const { data, setData, post, processing, reset, errors } = useForm({
        judul: "",
        ket: "",
        kat_iuran_id: "",
    });

    const handleSubmit = async (e) => {
        e.preventDefault();

        post(route("pengumuman.create"), {
            onSuccess: () => {
                notifySuccess("Berhasil", "Pengumuman berhasil dibuat!");
                reset();
            },
            onError: (err) => {
                notifyError("Gagal Menyimpan", "Periksa kembali inputanmu!");
                console.error(err);
            },
        });
    };

    return (
        <AppLayout>
            <form
                onSubmit={handleSubmit}
                className="mt-8 space-y-6 max-w-xl mx-auto"
            >
                {/* Judul */}
                <div className="space-y-2">
                    <Label>
                        Judul Pengumuman <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        type="text"
                        placeholder="Contoh: Iuran Kebersihan Bulan November"
                        value={data.judul}
                        onChange={(e) => setData("judul", e.target.value)}
                    />
                    {errors.judul && (
                        <p className="text-red-500 text-sm">{errors.judul}</p>
                    )}
                </div>

                {/* Keterangan */}
                <div className="space-y-2">
                    <Label>
                        Keterangan <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                        placeholder="Tuliskan detail pembayaran atau informasi tambahan"
                        value={data.ket}
                        onChange={(e) => setData("ket", e.target.value)}
                    />
                    {errors.ket && (
                        <p className="text-red-500 text-sm">{errors.ket}</p>
                    )}
                </div>

                {/* Kategori Iuran */}
                <div className="space-y-2">
                    <Label>
                        Kategori Iuran <span className="text-red-500">*</span>
                    </Label>
                    <select
                        value={data.kat_iuran_id}
                        onChange={(e) =>
                            setData("kat_iuran_id", e.target.value)
                        }
                        className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400"
                    >
                        <option value="">Pilih Kategori Iuran</option>
                        {kategori_iuran.map((kat) => (
                            <option key={kat.id} value={kat.id}>
                                {kat.nm_kat}
                            </option>
                        ))}
                    </select>
                    {errors.kat_iuran_id && (
                        <p className="text-red-500 text-sm">
                            {errors.kat_iuran_id}
                        </p>
                    )}
                </div>

                {/* Tombol Aksi */}
                <div className="flex justify-end gap-4 pt-2">
                    <Button
                        type="reset"
                        onClick={() => reset()}
                        className="bg-gray-500 hover:bg-gray-600 text-white"
                    >
                        Batal
                    </Button>
                    <Button
                        type="submit"
                        disabled={processing}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white"
                    >
                        {processing ? "Menyimpan..." : "Kirim"}
                    </Button>
                </div>
            </form>
        </AppLayout>
    );
}
