import React, { useRef, useState, useEffect } from "react";
import { useForm, router } from "@inertiajs/react";
import { route } from "ziggy-js";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Upload } from "lucide-react";
import { useNotify } from "@/components/ToastNotification";
import axios from "axios";
import AppLayout from "@/layouts/AppLayout";
import Breadcrumbs from "@/components/Breadcrumbs";

export default function TambahKegiatan({ kategoris = [], kegiatan = null }) {
    const { notifySuccess, notifyError } = useNotify();
    const isEdit = !!kegiatan;

    const formatDateForInput = (dateString) => {
        if (!dateString) return "";
        return dateString.substring(0, 10);
    };

    const { data, setData, reset } = useForm({
        nm_keg: kegiatan?.nm_keg || "",
        tgl_mulai: formatDateForInput(kegiatan?.tgl_mulai),
        tgl_selesai: formatDateForInput(kegiatan?.tgl_selesai),
        kat_keg_id: kegiatan?.kat_keg_id ? String(kegiatan.kat_keg_id) : "",
        pj_keg: kegiatan?.pj_keg || "",
        panitia: kegiatan?.panitia || "",
        dok_keg: [],
    });

    const [previews, setPreviews] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef(null);

    // --- LOGIKA VALIDASI TANGGAL ---
    const isDateInvalid =
        data.tgl_mulai && data.tgl_selesai && data.tgl_selesai < data.tgl_mulai;

    useEffect(() => {
        if (!isEdit) {
            // Logic reset jika perlu
        }
    }, [isEdit]);

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            setData("dok_keg", files);
            const newPreviews = files.map((file) => URL.createObjectURL(file));
            setPreviews(newPreviews);
        } else {
            setPreviews([]);
        }
    };

    useEffect(() => {
        return () => {
            previews.forEach((url) => URL.revokeObjectURL(url));
        };
    }, [previews]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        if (!data.nm_keg.trim()) {
            notifyError("Nama kegiatan tidak boleh kosong.");
            setIsLoading(false);
            return;
        }

        if (!data.tgl_mulai) {
            notifyError("Tanggal mulai belum diisi.");
            setIsLoading(false);
            return;
        }

        if (isDateInvalid) {
            notifyError(
                "Tanggal Invalid",
                "Tanggal selesai tidak boleh sebelum tanggal mulai."
            );
            setIsLoading(false);
            return;
        }

        if (!data.kat_keg_id) {
            notifyError("Kategori belum dipilih.");
            setIsLoading(false);
            return;
        }

        if (!data.pj_keg.trim()) {
            notifyError("Penanggung Jawab belum diisi.");
            setIsLoading(false);
            return;
        }

        if (!data.panitia.trim()) {
            notifyError("Panitia belum diisi.");
            setIsLoading(false);
            return;
        }

        const formData = new FormData();
        formData.append("nm_keg", data.nm_keg);
        formData.append("tgl_mulai", data.tgl_mulai);
        formData.append("tgl_selesai", data.tgl_selesai);
        formData.append("kat_keg_id", data.kat_keg_id);
        formData.append("pj_keg", data.pj_keg);
        formData.append("panitia", data.panitia);

        if (data.dok_keg.length > 0) {
            data.dok_keg.forEach((file) => {
                formData.append("dok_keg[]", file);
            });
        }

        try {
            if (isEdit) {
                formData.append("_method", "PUT");
                await axios.post(
                    route("kegiatan.update", kegiatan.id),
                    formData,
                    { headers: { "Content-Type": "multipart/form-data" } }
                );
                notifySuccess("Berhasil", "Kegiatan berhasil diperbarui!");
            } else {
                await axios.post(route("kegiatan.store"), formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
                notifySuccess("Berhasil", "Kegiatan berhasil disimpan!");
            }

            reset();
            setPreviews([]);
            if (fileInputRef.current) fileInputRef.current.value = null;
            router.visit(route("kegiatan.index"));
        } catch (error) {
            console.error(error);
            let pesan = "Terjadi kesalahan saat menyimpan data.";
            if (error.response) {
                pesan = error.response.data?.message || pesan;
            }
            notifyError("Gagal", pesan);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AppLayout>
            <div className="w-full min-h-screen bg-white overflow-y-auto overflow-x-hidden pl-0 pr-8 pb-10 md:pr-12 md:pb-12">
                <h1 className="text-3xl font-bold mb-10">
                    {isEdit ? "EDIT KEGIATAN" : "TAMBAH KEGIATAN"}
                </h1>

                <Breadcrumbs
                    items={[
                        { label: "Kegiatan", href: route("kegiatan.index") },
                        { label: isEdit ? "Edit Kegiatan" : "Tambah Kegiatan" },
                    ]}
                />

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <Label>
                                Nama Kegiatan{" "}
                                <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                placeholder="Masukkan nama kegiatan"
                                value={data.nm_keg}
                                onChange={(e) =>
                                    setData("nm_keg", e.target.value)
                                }
                            />
                        </div>
                        <div className="space-y-2">
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
                        <div className="space-y-2">
                            <Label>
                                Tanggal Selesai{" "}
                                <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                type="date"
                                value={data.tgl_selesai}
                                min={data.tgl_mulai}
                                className={
                                    isDateInvalid
                                        ? "border-red-500 focus-visible:ring-red-500"
                                        : ""
                                }
                                onChange={(e) =>
                                    setData("tgl_selesai", e.target.value)
                                }
                            />
                            {isDateInvalid && (
                                <p className="text-red-500 text-xs mt-1">
                                    Tanggal selesai tidak boleh mendahului
                                    tanggal mulai.
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>
                            Kategori <span className="text-red-500">*</span>
                        </Label>
                        <Select
                            onValueChange={(val) => setData("kat_keg_id", val)}
                            value={data.kat_keg_id || undefined}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Pilih kategori" />
                            </SelectTrigger>
                            <SelectContent>
                                {kategoris.map((kat) => (
                                    <SelectItem
                                        key={kat.id}
                                        value={String(kat.id)}
                                    >
                                        {kat.nm_kat}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>
                            Penanggung Jawab{" "}
                            <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            placeholder="Nama Penanggung Jawab"
                            value={data.pj_keg}
                            onChange={(e) => setData("pj_keg", e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>
                            Panitia <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            placeholder="Nama Panitia"
                            value={data.panitia}
                            onChange={(e) => setData("panitia", e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Dokumentasi (Opsional)</Label>

                        {isEdit && kegiatan.dok_keg && (
                            <div className="mb-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
                                <strong>Info:</strong> Kegiatan ini sudah
                                memiliki dokumen. Jika Anda mengupload file
                                baru, dokumen lama akan terganti.
                            </div>
                        )}

                        <label
                            htmlFor="dok_keg"
                            className="flex flex-col items-center justify-center w-full border-2 border-dashed border-gray-300 rounded-lg py-10 cursor-pointer hover:bg-gray-50 transition-colors duration-200 min-h-[200px]"
                        >
                            {previews.length > 0 ? (
                                /* PERUBAHAN DI SINI: Menggunakan Flexbox & justify-center */
                                <div className="flex flex-wrap justify-center gap-4 px-4 w-full">
                                    {previews.map((url, index) => (
                                        <img
                                            key={index}
                                            src={url}
                                            alt="Preview"
                                            /* Gunakan w-40 atau w-48 agar ukuran konsisten & tidak melebar sendiri */
                                            className="h-32 w-40 md:w-48 object-cover rounded-md shadow-sm"
                                        />
                                    ))}
                                </div>
                            ) : (
                                <>
                                    <Upload className="w-6 h-6 mb-2 text-gray-500" />
                                    <span className="text-sm text-gray-500">
                                        {isEdit
                                            ? "Klik untuk ganti gambar (Opsional)"
                                            : "Klik atau seret gambar ke sini (Opsional)"}
                                    </span>
                                </>
                            )}
                            <input
                                id="dok_keg"
                                ref={fileInputRef}
                                type="file"
                                multiple={true}
                                accept="image/*"
                                className="hidden"
                                onChange={handleFileChange}
                            />
                        </label>
                    </div>

                    <div className="flex justify-end gap-4 pt-2">
                        <Button
                            type="button"
                            onClick={() =>
                                router.visit(route("kegiatan.index"))
                            }
                            className="bg-gray-500 hover:bg-gray-600 text-white"
                        >
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading || isDateInvalid}
                            className={`text-white ${
                                isDateInvalid
                                    ? "bg-red-400 cursor-not-allowed hover:bg-red-400"
                                    : "bg-blue-500 hover:bg-blue-600"
                            }`}
                        >
                            {isLoading
                                ? "Menyimpan..."
                                : isEdit
                                ? "Update Kegiatan"
                                : "Tambah Kegiatan"}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
