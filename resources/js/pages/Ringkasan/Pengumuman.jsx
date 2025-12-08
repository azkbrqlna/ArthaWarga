// import React, { useState } from "react";
// import { useForm, router } from "@inertiajs/react";
// import { route } from "ziggy-js";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import { Button } from "@/components/ui/button";
// import { useNotify } from "@/components/ToastNotification";
// import AppLayout from "@/layouts/AppLayout";
// import axios from "axios";
// import Breadcrumbs from "@/components/Breadcrumbs";

// import {
//     Select,
//     SelectTrigger,
//     SelectValue,
//     SelectContent,
//     SelectItem,
// } from "@/components/ui/select";

// export default function Pengumuman({ kategori_iuran = [] }) {
//     const { notifySuccess, notifyError } = useNotify();
//     const { data, setData, reset } = useForm({
//         judul: "",
//         ket: "",
//         jumlah: "",
//         kat_iuran_id: "",
//     });

//     const [isLoading, setIsLoading] = useState(false);

//     // ============================
//     // FORMAT RUPIAH
//     // ============================
//     const formatRupiah = (value) => {
//         if (!value) return "";
//         const numberString = value.replace(/[^,\d]/g, "");
//         const split = numberString.split(",");
//         const sisa = split[0].length % 3;
//         let rupiah = split[0].substr(0, sisa);
//         const ribuan = split[0].substr(sisa).match(/\d{3}/gi);

//         if (ribuan) {
//             const separator = sisa ? "." : "";
//             rupiah += separator + ribuan.join(".");
//         }

//         rupiah = split[1] !== undefined ? rupiah + "," + split[1] : rupiah;
//         return "Rp " + rupiah;
//     };

//     const handleJumlahChange = (e) => {
//         const raw = e.target.value;
//         const formatted = formatRupiah(raw);
//         setData("jumlah", formatted);
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setIsLoading(true);

//         // Validasi
//         if (!data.judul.trim()) {
//             notifyError("Judul kosong", "Masukkan judul pengumuman.");
//             setIsLoading(false);
//             return;
//         }
//         if (!data.ket.trim()) {
//             notifyError("Keterangan kosong", "Masukkan isi pengumuman.");
//             setIsLoading(false);
//             return;
//         }
//         if (!data.jumlah || data.jumlah === "Rp 0") {
//             notifyError("Jumlah kosong", "Masukkan nominal tagihan.");
//             setIsLoading(false);
//             return;
//         }
//         if (!data.kat_iuran_id) {
//             notifyError("Kategori belum dipilih", "Pilih kategori iuran.");
//             setIsLoading(false);
//             return;
//         }

//         const cleanJumlah = data.jumlah.replace(/[^0-9]/g, "");

//         try {
//             await axios.post(route("pengumuman.create"), {
//                 judul: data.judul,
//                 ket: data.ket,
//                 jumlah: cleanJumlah,
//                 kat_iuran_id: data.kat_iuran_id,
//             });

//             notifySuccess("Berhasil", "Pengumuman berhasil dibuat!");
//             reset();
//             router.visit("/dashboard");
//         } catch (error) {
//             let pesan = "Terjadi kesalahan, coba lagi nanti.";
//             if (error.response) {
//                 if (error.response.status === 422)
//                     pesan = "Periksa data yang kamu isi.";
//                 if (error.response.status === 500)
//                     pesan = "Server sedang bermasalah.";
//             }
//             notifyError("Gagal Menyimpan", pesan);
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     return (
//         <AppLayout>
//             <div className="w-full min-h-screen bg-white pl-0 pr-8 pb-10 md:pr-12 md:pb-12">
//                 <h1 className="text-3xl font-bold mb-8">TAMBAH PENGUMUMAN</h1>

//                 <Breadcrumbs
//                     items={[
//                         { label: "Dashboard", href: route("dashboard") },
//                         { label: "Tambah Pengumuman" },
//                     ]}
//                 />

//                 <form onSubmit={handleSubmit} className="space-y-6">
//                     {/* Judul */}
//                     <div className="space-y-2">
//                         <Label>
//                             Judul Pengumuman{" "}
//                             <span className="text-red-500">*</span>
//                         </Label>
//                         <Input
//                             type="text"
//                             placeholder="Contoh: Iuran Kebersihan Bulan November"
//                             value={data.judul}
//                             onChange={(e) => setData("judul", e.target.value)}
//                         />
//                     </div>

//                     {/* Keterangan */}
//                     <div className="space-y-2">
//                         <Label>
//                             Isi / Keterangan{" "}
//                             <span className="text-red-500">*</span>
//                         </Label>
//                         <Textarea
//                             placeholder="Tuliskan detail pengumuman..."
//                             value={data.ket}
//                             onChange={(e) => setData("ket", e.target.value)}
//                         />
//                     </div>

//                     {/* Jumlah */}
//                     <div className="space-y-2">
//                         <Label>
//                             Jumlah <span className="text-red-500">*</span>
//                         </Label>
//                         <Input
//                             type="text"
//                             placeholder="Rp 0"
//                             value={data.jumlah}
//                             onChange={handleJumlahChange}
//                         />
//                     </div>

//                     {/* Kategori */}
//                     <div className="space-y-2">
//                         <Label>
//                             Kategori Iuran{" "}
//                             <span className="text-red-500">*</span>
//                         </Label>

//                         <Select
//                             value={data.kat_iuran_id}
//                             onValueChange={(value) =>
//                                 setData("kat_iuran_id", value)
//                             }
//                         >
//                             <SelectTrigger className="w-full">
//                                 <SelectValue placeholder="Pilih kategori" />
//                             </SelectTrigger>

//                             <SelectContent>
//                                 {kategori_iuran.map((kat) => (
//                                     <SelectItem
//                                         key={kat.id}
//                                         value={String(kat.id)}
//                                     >
//                                         {kat.nm_kat}
//                                     </SelectItem>
//                                 ))}
//                             </SelectContent>
//                         </Select>
//                     </div>

//                     {/* Tombol */}
//                     <div className="flex justify-end gap-4 pt-2">
//                         <Button
//                             type="reset"
//                             onClick={() => reset()}
//                             className="bg-gray-500 hover:bg-gray-600 text-white"
//                         >
//                             Batal
//                         </Button>

//                         <Button
//                             type="submit"
//                             disabled={isLoading}
//                             className="bg-amber-500 hover:bg-amber-600 text-white"
//                         >
//                             {isLoading ? "Menyimpan..." : "Tambah Pengumuman"}
//                         </Button>
//                     </div>
//                 </form>
//             </div>
//         </AppLayout>
//     );
// }
