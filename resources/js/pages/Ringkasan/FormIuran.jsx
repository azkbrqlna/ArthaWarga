import React, { useRef, useState, useEffect } from "react";
import { useForm } from "@inertiajs/react";
import { route } from "ziggy-js";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export default function FormIuran({ tanggal }) {
    const { data, setData, post, processing, reset } = useForm({
        kat_iuran_id: "",
        tgl: tanggal || "",
        nominal: "",
        jml_kk: "",
        total: "",
        ket: "",
        bkt_nota: null,
    });

    const [preview, setPreview] = useState(null);
    const [kategori, setKategori] = useState([]);
    const fileInputRef = useRef(null);

    // 🔹 ambil data kategori dari backend saat pertama kali mount
    useEffect(() => {
        fetch("/api/kategori-iuran")
            .then((res) => res.json())
            .then((data) => setKategori(data))
            .catch((err) => console.error("Gagal memuat kategori:", err));
    }, []);

    // update tanggal otomatis
    useEffect(() => {
        setData("tgl", tanggal);
    }, [tanggal]);

    // kalkulasi total otomatis
    const total =
        data.nominal && data.jml_kk
            ? parseFloat(data.nominal) * parseInt(data.jml_kk)
            : "";

    useEffect(() => {
        setData("total", total);
    }, [total]);

    const handleSubmit = (e) => {
        e.preventDefault();

        setData("tgl", tanggal);

        post(route("iuran.create"), {
            forceFormData: true,
            onSuccess: () => {
                alert("✅ Data Iuran berhasil disimpan!");
                reset();
                setPreview(null);
                if (fileInputRef.current) fileInputRef.current.value = null;
            },
            onError: (errors) => {
                console.error("Error:", errors);
                const pesan = Object.values(errors).join("\n");
                alert("❌ Gagal menyimpan data Iuran:\n" + pesan);
            },
        });
    };

    return (
        <form onSubmit={handleSubmit} className="mt-8">
            {/* Jenis Iuran */}
            <div className="mb-6">
                <Label>
                    Jenis Iuran <span className="text-red-500">*</span>
                </Label>
                <Select onValueChange={(val) => setData("kat_iuran_id", val)}>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Pilih jenis iuran" />
                    </SelectTrigger>
                    <SelectContent>
                        {kategori.length > 0 ? (
                            kategori.map((kat) => (
                                <SelectItem
                                    key={kat.id}
                                    value={kat.id.toString()}
                                >
                                    {kat.nm_kat}
                                </SelectItem>
                            ))
                        ) : (
                            <SelectItem disabled>
                                Tidak ada data kategori
                            </SelectItem>
                        )}
                    </SelectContent>
                </Select>
            </div>

            {/* Nominal */}
            <div className="mb-6">
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

            {/* Jumlah KK */}
            <div className="mb-6">
                <Label>
                    Jumlah KK <span className="text-red-500">*</span>
                </Label>
                <Input
                    type="number"
                    placeholder="0"
                    value={data.jml_kk}
                    onChange={(e) => setData("jml_kk", e.target.value)}
                />
            </div>

            {/* Total */}
            <div className="mb-6">
                <Label>
                    Total <span className="text-red-500">*</span>
                </Label>
                <Input type="number" readOnly value={total} />
            </div>

            {/* Deskripsi */}
            <div className="mb-6">
                <Label>
                    Deskripsi <span className="text-red-500">*</span>
                </Label>
                <Textarea
                    placeholder="Keterangan atau deskripsi kegiatan"
                    value={data.ket}
                    onChange={(e) => setData("ket", e.target.value)}
                />
            </div>

            <div className="flex justify-end gap-4">
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
