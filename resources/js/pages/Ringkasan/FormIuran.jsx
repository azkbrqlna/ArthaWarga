import React, { useEffect, useState } from "react";
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
    const { notifySuccess, notifyError } = useNotify();

    // 🧾 Form utama iuran
    const form = useForm({
        kat_iuran_id: "",
        tgl: tanggal || "",
        nominal: "",
        ket: "",
    });

    // Kategori iuran (state tambahan)
    const [kategori, setKategori] = useState(kategori_iuran);
    const [openAdd, setOpenAdd] = useState(false);
    const [openDelete, setOpenDelete] = useState(false);
    const [namaKat, setNamaKat] = useState("");
    const [selectedDelete, setSelectedDelete] = useState(null);

    // 🕒 Set tanggal otomatis dari props
    useEffect(() => {
        form.setData("tgl", tanggal);
    }, [tanggal]);

    // 💰 Format Rupiah
    const formatRupiah = (value) => {
        if (!value) return "";
        const numberString = value.replace(/[^,\d]/g, "");
        const split = numberString.split(",");
        const sisa = split[0].length % 3;
        let rupiah = split[0].substr(0, sisa);
        const ribuan = split[0].substr(sisa).match(/\d{3}/gi);
        if (ribuan) {
            const separator = sisa ? "." : "";
            rupiah += separator + ribuan.join(".");
        }
        rupiah = split[1] !== undefined ? rupiah + "," + split[1] : rupiah;
        return "Rp " + rupiah;
    };

    const handleNominalChange = (e) => {
        const formatted = formatRupiah(e.target.value);
        form.setData("nominal", formatted);
    };

    // 🔁 Ubah nominal ke integer sebelum submit
    form.transform((data) => ({
        ...data,
        nominal: parseInt(data.nominal.replace(/[^0-9]/g, "")) || 0,
    }));

    // ✅ Simpan iuran
    const handleSubmit = (e) => {
        e.preventDefault();

        form.post(route("iuran.create"), {
            preserveScroll: true,
            onSuccess: () => {
                notifySuccess("Berhasil", "Data iuran berhasil disimpan.");
                form.reset();
            },
            onError: (errors) => {
                const firstError =
                    Object.values(errors)[0] || "Periksa kembali inputan kamu.";
                notifyError("Gagal", firstError);
            },
        });
    };

    // ✅ Tambah kategori iuran
    const handleAddKategori = () => {
        if (!namaKat.trim()) {
            notifyError("Input Kosong", "Nama kategori tidak boleh kosong");
            return;
        }

        const kategoriForm = useForm({ nm_kat: namaKat });
        kategoriForm.post(route("kat_iuran.create"), {
            preserveScroll: true,
            onSuccess: (page) => {
                const dataRes = page.props.flash?.data;
                if (dataRes) {
                    setKategori((prev) => [...prev, dataRes]);
                }
                notifySuccess(
                    "Kategori Ditambahkan",
                    "Jenis iuran baru berhasil disimpan"
                );
                setNamaKat("");
                setOpenAdd(false);
            },
            onError: () => {
                notifyError("Gagal Menambah", "Terjadi kesalahan.");
            },
        });
    };

    // ✅ Hapus kategori iuran
    const handleDeleteKategori = () => {
        if (!selectedDelete) return;

        const deleteForm = useForm({});
        deleteForm.delete(route("kat_iuran.delete", selectedDelete), {
            preserveScroll: true,
            onSuccess: () => {
                setKategori((prev) =>
                    prev.filter((item) => item.id !== selectedDelete)
                );
                notifySuccess("Berhasil", "Kategori berhasil dihapus");
                setOpenDelete(false);
            },
            onError: () => {
                notifyError(
                    "Gagal Menghapus",
                    "Tidak dapat menghapus kategori"
                );
            },
        });
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
                                        className="bg-emerald-500 hover:bg-emerald-600 text-white"
                                        onClick={handleAddKategori}
                                    >
                                        Simpan
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>

                    <Select
                        onValueChange={(val) =>
                            form.setData("kat_iuran_id", val)
                        }
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
                        type="text"
                        placeholder="Rp 0"
                        value={form.data.nominal}
                        onChange={handleNominalChange}
                    />
                </div>

                {/* Keterangan */}
                <div className="space-y-2">
                    <Label>Keterangan</Label>
                    <Textarea
                        placeholder="Contoh: Iuran kebersihan bulan Oktober"
                        value={form.data.ket}
                        onChange={(e) => form.setData("ket", e.target.value)}
                    />
                </div>

                {/* Tombol aksi */}
                <div className="flex justify-end gap-4 pt-2">
                    <Button
                        type="reset"
                        onClick={() => form.reset()}
                        className="bg-gray-500 hover:bg-gray-600 text-white"
                    >
                        Batal
                    </Button>
                    <Button
                        type="submit"
                        disabled={form.processing}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white"
                    >
                        {form.processing ? "Menyimpan..." : "Simpan"}
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
