import React, { useRef, useState, useEffect } from "react";
import { useForm, router } from "@inertiajs/react";
import { route } from "ziggy-js";
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
import { Upload, X } from "lucide-react"; // Import X untuk hapus preview
import { useNotify } from "@/components/ToastNotification";
import axios from "axios";
import AppLayout from "@/layouts/AppLayout";
import Breadcrumbs from "@/components/Breadcrumbs";

export default function TambahKegiatan({ listKategori = [], kegiatan = null }) {
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
        rincian_kegiatan: kegiatan?.rincian_kegiatan || "",
        pj_keg: kegiatan?.pj_keg || "",
        panitia: kegiatan?.panitia || "",
        dok_keg: [], // Array untuk menyimpan file
    });

    const [previews, setPreviews] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef(null);

    // Load preview gambar lama (jika edit)
    useEffect(() => {
        if (isEdit && kegiatan?.dok_keg) {
            let files = [];
            // Handle jika data dari DB berupa array atau string
            if (Array.isArray(kegiatan.dok_keg)) {
                files = kegiatan.dok_keg;
            } else if (typeof kegiatan.dok_keg === 'string') {
                try {
                    files = JSON.parse(kegiatan.dok_keg);
                    if (!Array.isArray(files)) files = [kegiatan.dok_keg];
                } catch {
                    files = [kegiatan.dok_keg];
                }
            }
            
            const urls = files.map(path => `/storage/${path.replace(/"/g, '')}`);
            setPreviews(urls);
        }
    }, [isEdit, kegiatan]);

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            setData("dok_keg", files);
            // Buat preview URL dari file object
            const newPreviews = files.map((file) => URL.createObjectURL(file));
            setPreviews(newPreviews);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        if (!data.nm_keg.trim()) { notifyError("Error", "Nama kegiatan kosong"); setIsLoading(false); return; }
        if (!data.kat_keg_id) { notifyError("Error", "Kategori belum dipilih"); setIsLoading(false); return; }

        if (!isEdit && data.dok_keg.length === 0) {
            notifyError("Dokumentasi Kosong", "Unggah minimal satu foto kegiatan.");
            setIsLoading(false);
            return;
        }

        const formData = new FormData();
        formData.append("nm_keg", data.nm_keg);
        formData.append("tgl_mulai", data.tgl_mulai);
        formData.append("tgl_selesai", data.tgl_selesai);
        formData.append("kat_keg_id", data.kat_keg_id);
        formData.append("rincian_kegiatan", data.rincian_kegiatan || "");
        formData.append("pj_keg", data.pj_keg);
        formData.append("panitia", data.panitia);
        
        // ✅ LOOP APPEND FILE KE FORMDATA (PENTING UNTUK MULTIPLE UPLOAD)
        // Menggunakan key "dok_keg[]" agar backend membacanya sebagai array
        if (data.dok_keg.length > 0 && data.dok_keg[0] instanceof File) {
            data.dok_keg.forEach((file) => {
                formData.append("dok_keg[]", file);
            });
        }

        if (isEdit) {
            formData.append("_method", "PUT");
        }

        try {
            const url = isEdit ? route("kegiatan.update", kegiatan.id) : route("kegiatan.store");
            
            await axios.post(url, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            notifySuccess("Berhasil", isEdit ? "Kegiatan diperbarui!" : "Kegiatan berhasil disimpan!");
            if (!isEdit) {
                reset();
                setPreviews([]);
                if (fileInputRef.current) fileInputRef.current.value = null;
            }
            router.visit(route("kegiatan.index"));
        } catch (error) {
            console.error(error);
            let pesan = "Terjadi kesalahan saat menyimpan.";
            if (error.response && error.response.data && error.response.data.message) {
                pesan = error.response.data.message;
            }
            notifyError("Gagal", pesan);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AppLayout>
            <div className="w-full min-h-screen bg-white pl-0 pr-8 pb-10 md:pr-12 md:pb-12">
                <h1 className="text-3xl font-bold mb-10">
                    {isEdit ? "EDIT KEGIATAN" : "TAMBAH KEGIATAN"}
                </h1>
                <Breadcrumbs
                    items={[
                        { label: "Dashboard", href: route("dashboard") },
                        { label: "Kegiatan", href: route("kegiatan.index") },
                        { label: isEdit ? "Edit" : "Tambah" },
                    ]}
                />

                <form onSubmit={handleSubmit} className="space-y-6 mt-6">
                    {/* Nama & Tanggal */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <Label>Nama Kegiatan <span className="text-red-500">*</span></Label>
                            <Input value={data.nm_keg} onChange={(e) => setData("nm_keg", e.target.value)} placeholder="Contoh: Kerja Bakti" />
                        </div>
                        <div className="space-y-2">
                            <Label>Tanggal Mulai <span className="text-red-500">*</span></Label>
                            <Input type="date" value={data.tgl_mulai} onChange={(e) => setData("tgl_mulai", e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Tanggal Selesai <span className="text-red-500">*</span></Label>
                            <Input type="date" value={data.tgl_selesai} onChange={(e) => setData("tgl_selesai", e.target.value)} />
                        </div>
                    </div>

                    {/* Kategori */}
                    <div className="space-y-2">
                        <Label>Kategori <span className="text-red-500">*</span></Label>
                        <Select onValueChange={(val) => setData("kat_keg_id", val)} value={data.kat_keg_id}>
                            <SelectTrigger className="w-full"><SelectValue placeholder="Pilih kategori" /></SelectTrigger>
                            <SelectContent>
                                {listKategori.map((kat) => (
                                    <SelectItem key={kat.id} value={String(kat.id)}>{kat.nm_kat}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Rincian */}
                    <div className="space-y-2">
                        <Label>Rincian Kegiatan</Label>
                        <Textarea rows={4} value={data.rincian_kegiatan} onChange={(e) => setData("rincian_kegiatan", e.target.value)} placeholder="Tuliskan rincian..." />
                    </div>

                    {/* Personil */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label>Penanggung Jawab</Label>
                            <Input value={data.pj_keg} onChange={(e) => setData("pj_keg", e.target.value)} placeholder="Contoh: Pak RT" />
                        </div>
                        <div className="space-y-2">
                            <Label>Panitia</Label>
                            <Input value={data.panitia} onChange={(e) => setData("panitia", e.target.value)} placeholder="Contoh: Karang Taruna" />
                        </div>
                    </div>

                    {/* Dokumentasi (Multiple Upload) */}
                    <div className="space-y-2">
                        <Label>Dokumentasi (Bisa Pilih Banyak) <span className="text-red-500">*</span></Label>
                        <label className="flex flex-col items-center justify-center w-full border-2 border-dashed border-gray-300 rounded-lg py-10 cursor-pointer hover:bg-gray-50 min-h-[200px]">
                            {previews.length > 0 ? (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-4 w-full">
                                    {previews.map((url, index) => (
                                        <img key={index} src={url} alt="Preview" className="h-32 w-full object-cover rounded-md shadow-sm" />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center">
                                    <Upload className="w-6 h-6 mb-2 mx-auto text-gray-500" />
                                    <span className="text-sm text-gray-500">{isEdit ? "Klik untuk ganti foto" : "Klik untuk upload foto"}</span>
                                </div>
                            )}
                            <input
                                id="dok_keg"
                                ref={fileInputRef}
                                type="file"
                                multiple // ✅ Allow Multiple Files
                                accept="image/*,application/pdf"
                                className="hidden"
                                onChange={handleFileChange}
                            />
                        </label>
                    </div>

                    <div className="flex justify-end gap-4 pt-2">
                        <Button type="button" variant="secondary" onClick={() => router.visit(route("kegiatan.index"))}>Batal</Button>
                        <Button type="submit" disabled={isLoading} className="bg-blue-500 hover:bg-blue-600 text-white">
                            {isLoading ? "Menyimpan..." : (isEdit ? "Update" : "Simpan")}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}