import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
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
import { Plus, Minus } from "lucide-react";
import { useNotify } from "@/components/ToastNotification";

export default function FormIuran({ tanggal, kategori_iuran = [] }) {
    const { notifySuccess, notifyError } = useNotify();

    const { data, setData, reset } = useForm({
        kat_iuran_id: "",
        tgl: tanggal || new Date().toISOString().slice(0, 10),
        nominal: "",
        ket: "",
    });

    const [kategori, setKategori] = useState(kategori_iuran);
    const [isLoading, setIsLoading] = useState(false);
    const [openAdd, setOpenAdd] = useState(false);
    const [openDelete, setOpenDelete] = useState(false);
    const [namaKat, setNamaKat] = useState("");
    const [selectedDelete, setSelectedDelete] = useState(null);

    useEffect(() => {
        setData("tgl", tanggal);
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
        setData("nominal", formatted);
    };

    // 🧩 Submit utama
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        const cleanNominalString = data.nominal.replace(/[^0-9]/g, "");
        const cleanNominal = parseInt(cleanNominalString) || 0;

        // 🔍 Validasi
        if (!data.kat_iuran_id) {
            notifyError(
                "Belum memilih jenis iuran",
                "Pilih kategori iuran terlebih dahulu."
            );
            setIsLoading(false);
            return;
        }
        if (cleanNominal <= 0) {
            notifyError(
                "Nominal belum diisi",
                "Masukkan jumlah uang iuran yang sesuai."
            );
            setIsLoading(false);
            return;
        }
        if (!data.ket.trim()) {
            notifyError(
                "Keterangan kosong",
                "Tuliskan keterangan singkat, misal bulan atau tujuan iuran."
            );
            setIsLoading(false);
            return;
        }

        // Payload data yang akan dikirim
        const payload = {
            kat_iuran_id: data.kat_iuran_id,
            tgl: data.tgl,
            nominal: cleanNominal,
            ket: data.ket,
        };

        try {
            const res = await axios.post(route("iuran.create"), payload);

            if (res.data.success) {
                notifySuccess("Berhasil", res.data.message);
                reset();
                router.visit(route("dashboard"));
            } else {
                notifyError("Gagal Menyimpan", res.data.message);
            }
        } catch (error) {
            // 💡 Penanganan Error dari Controller (termasuk pesan ERROR: ... )
            let pesan = "Terjadi kesalahan, coba beberapa saat lagi.";
            if (error.response && error.response.data) {
                if (error.response.status === 422) {
                    pesan =
                        "Periksa kembali data yang kamu isi, ada yang belum sesuai.";
                } else {
                    pesan = error.response.data.message || pesan;
                }
            } else if (error.message) {
                pesan = "Gagal koneksi ke server.";
            }
            notifyError("Gagal Menyimpan", pesan);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddKategori = async () => {
        if (!namaKat.trim()) {
            notifyError("Input kosong", "Nama kategori tidak boleh kosong.");
            return;
        }

        try {
            const res = await axios.post(route("kat_iuran.create"), {
                nm_kat: namaKat,
            });

            if (res.data.success) {
                setKategori((prev) => [...prev, res.data.data]);
                notifySuccess(
                    "Kategori Ditambahkan",
                    res.data.message || "Jenis iuran baru berhasil disimpan."
                );
                setNamaKat("");
                setOpenAdd(false);
            } else {
                notifyError(
                    "Gagal Menambah",
                    res.data.message || "Terjadi kesalahan."
                );
            }
        } catch (error) {
            notifyError(
                "Gagal Menambah",
                error.response?.data?.message ||
                    "Terjadi kesalahan pada server."
            );
        }
    };

    const handleDeleteKategori = async () => {
        if (!selectedDelete) return;

        try {
            const res = await axios.delete(
                route("kat_iuran.delete", selectedDelete)
            );

            if (res.data.success) {
                setKategori((prev) =>
                    prev.filter((item) => item.id !== selectedDelete)
                );
                notifySuccess(
                    "Berhasil",
                    res.data.message || "Kategori berhasil dihapus."
                );
                setOpenDelete(false);
            } else {
                notifyError(
                    "Gagal Menghapus",
                    res.data.message || "Tidak dapat menghapus kategori."
                );
            }
        } catch (error) {
            notifyError(
                "Gagal Menghapus",
                error.response?.data?.message ||
                    "Terjadi kesalahan pada server."
            );
        }
    };

    return (
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            {/* Jenis Iuran */}
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <Label>
                        Jenis Iuran <span className="text-red-500">*</span>
                    </Label>
                </div>

                <Select
                    onValueChange={(val) => setData("kat_iuran_id", val)}
                    value={data.kat_iuran_id || ""}
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
                    value={data.nominal}
                    onChange={handleNominalChange}
                />
            </div>

            {/* Keterangan */}
            <div className="space-y-2">
                <Label>
                    Keterangan <span className="text-red-500">*</span>
                </Label>
                <Textarea
                    placeholder="Contoh: Iuran kebersihan bulan Oktober"
                    value={data.ket}
                    onChange={(e) => setData("ket", e.target.value)}
                />
            </div>

            {/* Tombol aksi */}
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
                    disabled={isLoading}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white"
                >
                    {isLoading ? "Menyimpan..." : "Tambah Pemasukan"}
                </Button>
            </div>

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
        </form>
    );
}