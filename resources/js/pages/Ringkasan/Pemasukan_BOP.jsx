import React, { useState, useRef } from "react";
import { useForm } from "@inertiajs/react";
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
import { CalendarDays, Upload } from "lucide-react";
import AppLayout from "@/layouts/AppLayout";

export default function Tambah_Pemasukan() {
    // Form state
    const { data, setData, post, processing, reset } = useForm({
        tgl: "",
        nominal: "",
        ket: "",
        bkt_nota: null,
    });

    const [preview, setPreview] = useState(null);
    const fileInputRef = useRef(null); // untuk reset input file manual

    // handle file upload
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData("bkt_nota", file);
            setPreview(URL.createObjectURL(file));
        } else {
            setPreview(null);
        }
    };

    // handle submit
    const handleSubmit = (e) => {
        e.preventDefault();

        post(route("bop.create"), {
            forceFormData: true,
            onSuccess: () => {
                alert("✅ Data berhasil disimpan!");
                // reset form & preview
                reset();
                setPreview(null);
                // reset input file manual (biar event onChange aktif meski pilih file sama)
                if (fileInputRef.current) {
                    fileInputRef.current.value = null;
                }
            },
        });
    };

    return (
        <div className="w-full min-h-screen bg-white overflow-y-auto overflow-x-hidden">
            <form
                onSubmit={handleSubmit}
                encType="multipart/form-data"
                className="w-full h-full px-8 py-10 md:px-12 md:py-12"
            >
                <h1 className="text-3xl font-bold mb-10">TAMBAH PEMASUKAN</h1>

                {/* Jenis Pemasukan & Tanggal */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 w-full">
                    <div>
                        <Label className="mb-1 block">
                            Jenis Pemasukan{" "}
                            <span className="text-red-500">*</span>
                        </Label>
                        <Select
                            onValueChange={(val) =>
                                setData("ket", val === "bop" ? "BOP" : "Iuran")
                            }
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Pilih jenis" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="bop">BOP</SelectItem>
                                <SelectItem value="kas">Iuran</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label className="mb-1 block">
                            Tanggal <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative w-full">
                            <Input
                                type="date"
                                className="pr-10 w-full"
                                value={data.tgl}
                                onChange={(e) => setData("tgl", e.target.value)}
                            />
                            <CalendarDays className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        </div>
                    </div>
                </div>

                {/* Nominal */}
                <div className="mb-8 w-full">
                    <Label className="mb-1 block">
                        Nominal <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        placeholder="Rp. -"
                        type="number"
                        className="w-full"
                        value={data.nominal}
                        onChange={(e) => setData("nominal", e.target.value)}
                    />
                </div>

                {/* Deskripsi */}
                <div className="mb-8 w-full">
                    <Label className="mb-1 block">
                        Deskripsi <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                        placeholder="Deskripsi dari kegiatan"
                        rows={4}
                        className="w-full h-30"
                        value={data.ket}
                        onChange={(e) => setData("ket", e.target.value)}
                    />
                </div>

                {/* Upload Bukti */}
                <div className="mb-12 w-full">
                    <Label className="mb-1 block">
                        Bukti <span className="text-red-500">*</span>
                    </Label>
                    <label
                        htmlFor="bukti"
                        className="flex flex-col items-center justify-center w-full border-2 border-dashed border-gray-300 rounded-lg py-12 cursor-pointer hover:bg-gray-50 transition-colors"
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
                <div className="flex justify-end gap-4 w-full">
                    <Button
                        type="reset"
                        variant="secondary"
                        onClick={() => {
                            reset();
                            setPreview(null);
                            if (fileInputRef.current) {
                                fileInputRef.current.value = null;
                            }
                        }}
                        className="bg-gray-500 hover:bg-gray-600 text-white"
                    >
                        Batal
                    </Button>
                    <Button
                        type="submit"
                        disabled={processing}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white"
                    >
                        {processing ? "Menyimpan..." : "Tambah Pemasukan"}
                    </Button>
                </div>
            </form>
        </div>
    );
}

Tambah_Pemasukan.layout = (page) => <AppLayout>{page}</AppLayout>;
