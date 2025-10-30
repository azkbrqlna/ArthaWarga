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
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";

export default function FormIuran({ tanggal, kategori_iuran = [] }) {
    const { data, setData, post, processing, reset } = useForm({
        kat_iuran_id: "",
        tgl: tanggal || "",
        nominal: "",
        jml_kk: "",
        total: "",
        ket: "",
    });

    const [preview, setPreview] = useState(null);
    const fileInputRef = useRef(null);

    // state popup kategori baru
    const [open, setOpen] = useState(false);
    const [namaKat, setNamaKat] = useState("");

    // sinkron tanggal
    useEffect(() => {
        setData("tgl", tanggal);
    }, [tanggal]);

    // hitung total otomatis
    const total =
        data.nominal && data.jml_kk
            ? parseFloat(data.nominal) * parseInt(data.jml_kk)
            : "";
    useEffect(() => {
        setData("total", total);
    }, [total]);

    // kirim form utama
    const handleSubmit = (e) => {
        e.preventDefault();
        post(route("iuran.create"), {
            forceFormData: true,
            onSuccess: () => {
                alert("✅ Data Iuran berhasil disimpan!");
                reset();
                setPreview(null);
                if (fileInputRef.current) fileInputRef.current.value = null;
            },
            onError: (errors) => {
                const pesan = Object.values(errors).join("\n");
                alert("❌ Gagal menyimpan data Iuran:\n" + pesan);
            },
        });
    };

    // kirim kategori baru
    const handleAddKategori = (e) => {
        e.preventDefault();
        router.post(
            route("kategori.iuran.create"),
            { nm_kat: namaKat },
            {
                onSuccess: () => {
                    alert("✅ Kategori baru berhasil ditambahkan!");
                    setNamaKat("");
                    setOpen(false);
                    router.reload({ only: ["kategori_iuran"] }); // refresh dropdown
                },
                onError: (errors) => {
                    alert(
                        "❌ Gagal menambah kategori:\n" +
                            Object.values(errors).join("\n")
                    );
                },
            }
        );
    };

    return (
        <form onSubmit={handleSubmit} className="mt-8">
            {/* Jenis Iuran + tombol tambah */}
            <div className="mb-6">
                <div className="flex items-center justify-between">
                    <Label>
                        Jenis Iuran <span className="text-red-500">*</span>
                    </Label>
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button
                                type="button"
                                size="sm"
                                className="bg-emerald-500 hover:bg-emerald-600 text-white flex items-center gap-1"
                            >
                                <Plus className="w-4 h-4" />
                                Tambah
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Tambah Jenis Iuran</DialogTitle>
                            </DialogHeader>
                            <form
                                onSubmit={handleAddKategori}
                                className="space-y-4"
                            >
                                <div>
                                    <Label>Nama Kategori</Label>
                                    <Input
                                        value={namaKat}
                                        onChange={(e) =>
                                            setNamaKat(e.target.value)
                                        }
                                        placeholder="Contoh: Kebersihan, Keamanan..."
                                    />
                                </div>
                                <DialogFooter>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setOpen(false)}
                                    >
                                        Batal
                                    </Button>
                                    <Button
                                        type="submit"
                                        className="bg-emerald-500 hover:bg-emerald-600 text-white"
                                    >
                                        Simpan
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <Select onValueChange={(val) => setData("kat_iuran_id", val)}>
                    <SelectTrigger className="w-full mt-1">
                        <SelectValue placeholder="Pilih jenis iuran" />
                    </SelectTrigger>
                    <SelectContent>
                        {kategori_iuran.length > 0 ? (
                            kategori_iuran.map((kat) => (
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

            {/* Keterangan */}
            <div className="mb-6">
                <Label>
                    Deskripsi / Keterangan{" "}
                    <span className="text-red-500">*</span>
                </Label>
                <Textarea
                    placeholder="Keterangan kegiatan"
                    value={data.ket}
                    onChange={(e) => setData("ket", e.target.value)}
                />
            </div>

            {/* Tombol aksi */}
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
