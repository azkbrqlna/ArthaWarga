import React, { useState, useRef } from "react";
import { Head, useForm, Link } from "@inertiajs/react";
import { route } from "ziggy-js";

import AppLayout from "@/layouts/AppLayout";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Breadcrumbs from "@/components/Breadcrumbs";

export default function ShowWarga({ auth, tagihan }) {
    const [preview, setPreview] = useState(null);

    const { data, setData, post, processing, errors } = useForm({
        id: tagihan.id,
        bkt_byr: null,
    });

    // =============================
    //   SUBMIT
    // =============================
    const submit = (e) => {
    e.preventDefault();

    if (!data.bkt_byr) {
        alert("Silakan upload bukti transfer dulu.");
        return;
    }

    console.log("DATA AKAN DIKIRIM:", data);

    post(route("tagihan.upload"), {
        forceFormData: true,

        onError: (errors) => {
            console.error("UPLOAD ERROR:", errors);
        },

        onSuccess: () => {
            console.log("UPLOAD BERHASIL");
        },

        onFinish: () => {
            console.log("SELESAI MENGIRIM REQUEST");
        }
    });
};


    // =============================
    //   DRAG & DROP UPLOAD COMPONENT
    // =============================
    function UploadBox({ onFileChange, preview }) {
        const [isDragging, setIsDragging] = useState(false);
        const inputRef = useRef(null);

        const handleDragOver = (e) => {
            e.preventDefault();
            setIsDragging(true);
        };

        const handleDragLeave = () => setIsDragging(false);

        const handleDrop = (e) => {
            e.preventDefault();
            setIsDragging(false);
            const file = e.dataTransfer.files[0];
            if (file) onFileChange(file);
        };

        const handleFilePick = (e) => {
            const file = e.target.files[0];
            if (file) onFileChange(file);
        };

        return (
            <div className="space-y-2 w-full">
                <Label>
                    Bukti Transfer <span className="text-red-500">*</span>
                </Label>

                <div
                    className={`border-2 border-dashed rounded-xl p-6
                        flex flex-col items-center justify-center text-center cursor-pointer transition
                        ${isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300"}
                    `}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => inputRef.current && inputRef.current.click()}
                >
                    {/* INPUT */}
                    <input
                        ref={inputRef}
                        type="file"
                        name="bkt_byr"              // <<< PENTING: nama harus ada
                        accept="image/*,application/pdf"
                        className="hidden"
                        onChange={handleFilePick}
                        
                    />

                    {!preview && (
                        <>
                            <p className="font-semibold text-gray-700">
                                Klik untuk upload
                            </p>
                            <p className="text-sm text-gray-600">
                                atau seret file ke sini
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                Format: JPG, PNG, PDF
                            </p>
                        </>
                    )}

                    {preview && (
                        <img
                            src={preview}
                            className="max-h-72 mt-3 rounded-lg border shadow"
                        />
                    )}
                </div>

                {errors.bkt_byr && (
                    <p className="text-red-500 text-xs">{errors.bkt_byr}</p>
                )}
            </div>
        );
    }

    // =============================
    //   HANDLE UPLOAD
    // =============================
    const handleUpload = (file) => {
        setData("bkt_byr", file);

        if (file) {
            const url = URL.createObjectURL(file);
            setPreview(url);
        }
    };

    // =============================
    //   FORMAT RUPIAH
    // =============================
    const formatRupiah = (num) =>
        new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(num);

    // =============================
    //   MAIN RENDER
    // =============================
    return (
        <AppLayout>
            <Head title="Pembayaran Warga" />

            <div className="w-full min-h-screen bg-white overflow-y-auto pl-0 pr-8 pb-10 md:pr-12 md:pb-12">
                <h1 className="text-3xl font-bold mb-8">Pembayaran Tagihan Air</h1>

                <Breadcrumbs
                    items={[
                        { label: "Dashboard", href: route("tagihan.warga.index") },
                        { label: "Detail Pembayaran" },
                    ]}
                />

                <form onSubmit={submit} className="mt-8 space-y-6">
                    <div className="grid grid-cols-1 gap-6">
                        <div>
                            <Label>Periode</Label>
                            <Input
                                readOnly
                                value={`${tagihan.bulan} / ${tagihan.tahun}`}
                                className="mt-1 bg-white text-gray-800 border-gray-300"
                            />
                        </div>

                        <div>
                            <Label>Meteran Air</Label>
                            <Input
                                readOnly
                                value={`${tagihan.mtr_bln_lalu} → ${tagihan.mtr_skrg}`}
                                className="mt-1 bg-white text-gray-800 border-gray-300"
                            />
                        </div>

                        <div>
                            <Label>Pemakaian</Label>
                            <Input
                                readOnly
                                value={`${tagihan.mtr_skrg - tagihan.mtr_bln_lalu} m³`}
                                className="mt-1 bg-white text-gray-800 border-gray-300"
                            />
                        </div>

                        <div>
                            <Label>Biaya Air</Label>
                            <Input
                                readOnly
                                value={formatRupiah(
                                    (tagihan.mtr_skrg - tagihan.mtr_bln_lalu) *
                                        tagihan.harga_meteran
                                )}
                                className="mt-1 bg-white text-gray-800 border-gray-300"
                            />
                        </div>

                        <div>
                            <Label>Abonemen</Label>
                            <Input
                                readOnly
                                value={formatRupiah(tagihan.abonemen)}
                                className="mt-1 bg-white text-gray-800 border-gray-300"
                            />
                        </div>

                        <div>
                            <Label>Jimpitan Air</Label>
                            <Input
                                readOnly
                                value={formatRupiah(tagihan.jimpitan_air)}
                                className="mt-1 bg-white text-gray-800 border-gray-300"
                            />
                        </div>

                        {tagihan.harga_sampah > 0 && (
                            <div>
                                <Label>Iuran Sampah</Label>
                                <Input
                                    readOnly
                                    value={formatRupiah(tagihan.harga_sampah)}
                                    className="mt-1 bg-white text-gray-800 border-gray-300"
                                />
                            </div>
                        )}

                        <div>
                            <Label className="font-bold text-lg text-green-600">
                                TOTAL
                            </Label>
                            <Input
                                readOnly
                                value={formatRupiah(tagihan.nominal)}
                                className="bg-white text-green-600 border-green-400 font-bold"
                            />
                        </div>
                    </div>

                    {/* Upload box */}
                    <UploadBox onFileChange={handleUpload} preview={preview} />

                    <div className="flex justify-end gap-4 pt-4">
                        <Button
                            type="button"
                            onClick={() => history.back()}
                            className="bg-gray-500 hover:bg-gray-600 text-white"
                        >
                            Kembali
                        </Button>

                        <Button
                            type="submit"
                            disabled={processing}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            {processing ? "Mengupload..." : "Kirim Bukti"}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
