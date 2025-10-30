import React, { useRef, useState, useEffect } from "react";
import { useForm } from "@inertiajs/react";
import { route } from "ziggy-js";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

export default function FormBOP({ tanggal }) {
    const { data, setData, post, processing, reset } = useForm({
        tgl: tanggal || "",
        nominal: "",
        ket: "",
        bkt_nota: null,
    });

    const [preview, setPreview] = useState(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        setData("tgl", tanggal);
    }, [tanggal]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData("bkt_nota", file);
            setPreview(URL.createObjectURL(file));
        } else setPreview(null);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setData("tgl", tanggal);
        post(route("bop.create"), {
            forceFormData: true,
            onSuccess: () => {
                alert("✅ Data BOP berhasil disimpan!");
                reset();
                setPreview(null);
                if (fileInputRef.current) fileInputRef.current.value = null;
            },
        });
    };

    return (
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            {/* Nominal */}
            <div className="space-y-2">
                <Label>
                    Nominal <span className="text-red-500">*</span>
                </Label>
                <Input
                    type="number"
                    placeholder="Rp. -"
                    value={data.nominal}
                    onChange={(e) => setData("nominal", e.target.value)}
                />
            </div>

            {/* Deskripsi */}
            <div className="space-y-2">
                <Label>
                    Deskripsi <span className="text-red-500">*</span>
                </Label>
                <Textarea
                    placeholder="Deskripsi kegiatan"
                    value={data.ket}
                    onChange={(e) => setData("ket", e.target.value)}
                />
            </div>

            {/* Upload Bukti */}
            <div className="space-y-2">
                <Label>
                    Bukti <span className="text-red-500">*</span>
                </Label>
                <label
                    htmlFor="bukti"
                    className="flex flex-col items-center justify-center w-full border-2 border-dashed border-gray-300 rounded-lg py-10 cursor-pointer hover:bg-gray-50 transition-colors duration-200"
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
            <div className="flex justify-end gap-4 pt-2">
                <Button
                    type="reset"
                    onClick={() => {
                        reset();
                        setPreview(null);
                        if (fileInputRef.current)
                            fileInputRef.current.value = null;
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
                    {processing ? "Menyimpan..." : "Simpan"}
                </Button>
            </div>
        </form>
    );
}
