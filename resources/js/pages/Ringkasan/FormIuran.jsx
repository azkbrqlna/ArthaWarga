import React, { useRef, useState, useEffect } from "react";
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
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Minus } from "lucide-react";
import { useNotify } from "@/components/ToastNotification";

export default function FormIuran({ tanggal, kategori_iuran = [] }) {
    const { data, setData, post, processing, reset } = useForm({
        kat_iuran_id: "",
        tgl: tanggal || "",
        nominal: "",
        jml_kk: "",
        total: "",
        ket: "",
    });

    const [kategori, setKategori] = useState(kategori_iuran);
    const [openAdd, setOpenAdd] = useState(false);
    const [openDelete, setOpenDelete] = useState(false);
    const [namaKat, setNamaKat] = useState("");
    const [loadingAdd, setLoadingAdd] = useState(false);
    const [selectedDelete, setSelectedDelete] = useState(null);
    const fileInputRef = useRef(null);

    const { notifySuccess, notifyError } = useNotify();

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

    // kirim data iuran
    const handleSubmit = (e) => {
        e.preventDefault();
        post(route("iuran.create"), {
            forceFormData: true,
            onSuccess: () => {
                notifySuccess("Berhasil", "Data Iuran berhasil disimpan");
                reset();
                if (fileInputRef.current) fileInputRef.current.value = null;
            },
            onError: (errors) => {
                const pesan = Object.values(errors).join(", ");
                notifyError("Gagal Menyimpan", pesan);
            },
        });
    };

    // tambah kategori baru
    const handleAddKategori = async () => {
        if (!namaKat.trim()) {
            notifyError("Input Kosong", "Nama kategori tidak boleh kosong");
            return;
        }

        setLoadingAdd(true);
        try {
            const res = await fetch(route("kat_iuran.create"), {
                method: "POST",
                headers: {
                    "X-CSRF-TOKEN": document
                        .querySelector('meta[name="csrf-token"]')
                        .getAttribute("content"),
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify({ nm_kat: namaKat }),
            });

            const dataRes = await res.json();
            if (!res.ok || !dataRes.success)
                throw new Error(dataRes.message || "Gagal menambah kategori");

            setKategori((prev) => [...prev, dataRes.data]);
            setNamaKat("");
            setOpenAdd(false);
            notifySuccess(
                "Kategori Ditambahkan",
                "Jenis iuran baru berhasil disimpan"
            );
        } catch (err) {
            notifyError("Gagal Menambah", err.message);
        } finally {
            setLoadingAdd(false);
        }
    };

    // hapus kategori
    const handleDeleteKategori = async () => {
        if (!selectedDelete) return;

        try {
            const res = await fetch(route("kat_iuran.delete", selectedDelete), {
                method: "DELETE",
                headers: {
                    "X-CSRF-TOKEN": document
                        .querySelector('meta[name="csrf-token"]')
                        .getAttribute("content"),
                    Accept: "application/json",
                },
            });

            const dataRes = await res.json();
            if (!res.ok || !dataRes.success)
                throw new Error(dataRes.message || "Gagal menghapus kategori");

            setKategori((prev) =>
                prev.filter((item) => item.id !== selectedDelete)
            );
            notifySuccess("Berhasil", "Kategori berhasil dihapus");
            setOpenDelete(false);
            setSelectedDelete(null);
        } catch (err) {
            notifyError("Gagal Menghapus", err.message);
        }
    };

    return (
        <>
            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                {/* Jenis Iuran */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label>
                            Jenis Iuran <span className="text-red-500">*</span>
                        </Label>
                        <Dialog open={openAdd} onOpenChange={setOpenAdd}>
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

                            <DialogContent className="space-y-4">
                                <DialogHeader>
                                    <DialogTitle>
                                        Tambah Jenis Iuran
                                    </DialogTitle>
                                </DialogHeader>

                                <div className="space-y-2">
                                    <Label>Nama Kategori</Label>
                                    <Input
                                        value={namaKat}
                                        onChange={(e) =>
                                            setNamaKat(e.target.value)
                                        }
                                        placeholder="Contoh: Kebersihan, Keamanan..."
                                    />
                                </div>

                                <DialogFooter className="flex justify-end gap-3">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setOpenAdd(false)}
                                    >
                                        Batal
                                    </Button>
                                    <Button
                                        type="button"
                                        disabled={loadingAdd}
                                        onClick={handleAddKategori}
                                        className="bg-emerald-500 hover:bg-emerald-600 text-white"
                                    >
                                        {loadingAdd ? "Menyimpan..." : "Simpan"}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>

                    <Select
                        onValueChange={(val) => setData("kat_iuran_id", val)}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Pilih jenis iuran" />
                        </SelectTrigger>
                        <SelectContent>
                            {kategori.length > 0 ? (
                                kategori.map((kat) => (
                                    <div
                                        key={kat.id}
                                        className="flex items-center justify-between"
                                    >
                                        <SelectItem
                                            value={kat.id.toString()}
                                            className="flex-1"
                                        >
                                            {kat.nm_kat}
                                        </SelectItem>
                                        <Button
                                            type="button"
                                            size="icon"
                                            variant="ghost"
                                            onClick={() => {
                                                setSelectedDelete(kat.id);
                                                setOpenDelete(true);
                                            }}
                                        >
                                            <Minus className="w-4 h-4 text-red-500" />
                                        </Button>
                                    </div>
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

                {/* Jumlah KK */}
                <div className="space-y-2">
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
                <div className="space-y-2">
                    <Label>
                        Total <span className="text-red-500">*</span>
                    </Label>
                    <Input type="number" readOnly value={total} />
                </div>

                {/* Keterangan */}
                <div className="space-y-2">
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
                <div className="flex justify-end gap-4 pt-2">
                    <Button
                        type="reset"
                        onClick={() => {
                            reset();
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

            {/* Popup konfirmasi hapus */}
            <Dialog open={openDelete} onOpenChange={setOpenDelete}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Konfirmasi Hapus</DialogTitle>
                    </DialogHeader>
                    <p>Apakah kamu yakin ingin menghapus jenis iuran ini?</p>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setOpenDelete(false)}
                        >
                            Batal
                        </Button>
                        <Button
                            className="bg-red-500 hover:bg-red-600 text-white"
                            onClick={handleDeleteKategori}
                        >
                            Yakin
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
