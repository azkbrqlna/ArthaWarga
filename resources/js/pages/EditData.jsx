import React, { useState, useEffect } from "react";
import AppLayout from "@/layouts/AppLayout";
import { Link, useForm, router } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNotify } from "@/Components/toastNotification"; // Pastikan path sesuai
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function EditData({ user, roles, wilayah = [] }) {
  const { notifySuccess, notifyError } = useNotify();

  // State dropdown
  const [listKecamatan, setListKecamatan] = useState([]);
  const [listKelurahan, setListKelurahan] = useState([]);
  const [listRW, setListRW] = useState([]);
  const [listRT, setListRT] = useState([]);

  const { data, setData, put, processing, errors } = useForm({
    nm_lengkap: user.nm_lengkap || "",
    no_kk: user.no_kk || "",
    email: user.email || "",
    password: "",
    no_hp: user.no_hp || "",
    
    // Wilayah
    alamat: user.alamat || "",
    kota_id: user.kota_id ? user.kota_id.toString() : "",
    kecamatan_id: user.kecamatan_id ? user.kecamatan_id.toString() : "",
    kelurahan_id: user.kelurahan_id ? user.kelurahan_id.toString() : "",
    rw_id: user.rw_id ? user.rw_id.toString() : "",
    rt_id: user.rt_id ? user.rt_id.toString() : "",
    kode_pos: user.kode_pos || "",
    
    role_id: user.role_id ? user.role_id.toString() : "",
    status: user.status || "",
  });

  // --- USE EFFECT: Isi Dropdown saat halaman dimuat ---
  useEffect(() => {
     if (wilayah.length > 0) {
        // 1. Set List Kecamatan berdasarkan Kota user
        if (data.kota_id) {
           const kota = wilayah.find(k => k.id.toString() === data.kota_id);
           setListKecamatan(kota ? kota.kecamatans : []);
           
           // 2. Set List Kelurahan berdasarkan Kecamatan user
           if (data.kecamatan_id && kota) {
              const kec = kota.kecamatans.find(k => k.id.toString() === data.kecamatan_id);
              setListKelurahan(kec ? kec.kelurahans : []);

              // 3. Set List RW
              if (data.kelurahan_id && kec) {
                 const kel = kec.kelurahans.find(k => k.id.toString() === data.kelurahan_id);
                 setListRW(kel ? kel.rws : []);

                 // 4. Set List RT
                 if (data.rw_id && kel) {
                    const rw = kel.rws.find(r => r.id.toString() === data.rw_id);
                    setListRT(rw ? rw.rts : []);
                 }
              }
           }
        }
     }
  }, []); // Run sekali saat mount

  // --- HANDLER DROPDOWN (Sama seperti TambahData) ---
  const handleKotaChange = (val) => {
    setData(d => ({ ...d, kota_id: val, kecamatan_id: "", kelurahan_id: "", rw_id: "", rt_id: "" }));
    const k = wilayah.find(item => item.id.toString() === val);
    setListKecamatan(k ? k.kecamatans : []);
    setListKelurahan([]); setListRW([]); setListRT([]);
  };

  const handleKecamatanChange = (val) => {
    setData(d => ({ ...d, kecamatan_id: val, kelurahan_id: "", rw_id: "", rt_id: "" }));
    const k = listKecamatan.find(item => item.id.toString() === val);
    setListKelurahan(k ? k.kelurahans : []);
    setListRW([]); setListRT([]);
  };

  const handleKelurahanChange = (val) => {
    setData(d => ({ ...d, kelurahan_id: val, rw_id: "", rt_id: "" }));
    const k = listKelurahan.find(item => item.id.toString() === val);
    setListRW(k ? k.rws : []);
    setListRT([]);
  };

  const handleRWChange = (val) => {
    setData(d => ({ ...d, rw_id: val, rt_id: "" }));
    const r = listRW.find(item => item.id.toString() === val);
    setListRT(r ? r.rts : []);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    put(route("superadmin.updateUser", user.id), { // Sesuaikan route di web.php
      preserveScroll: true,
      onSuccess: () => {
          notifySuccess("Berhasil", "Data berhasil diperbarui!");
          setTimeout(() => { router.visit("/manajemen-data"); }, 500);
      },
      onError: () => {
        notifyError("Gagal", "Terjadi kesalahan, silakan cek kembali form.");
      }
    });
  };

  return (
    <AppLayout>
      <div className="px-6 py-6">
        {/* Breadcrumb */}
        <div className="flex items-center text-gray-400 text-2xl md:text-3xl font-semibold border-b-2 border-gray-200 py-3 md:py-5">
          <Link href="/manajemen-data" className="hover:text-blue-600 transition-colors duration-200">Manajemen Data</Link>
          <span className="mx-2 text-gray-400">›</span>
          <span className="text-black font-bold">Edit Data</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 py-5 max-w-5xl">
          {/* Identitas Diri */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="md:col-span-2">
               <label className="block text-sm font-medium mb-1">Nama Lengkap</label>
               <Input value={data.nm_lengkap} onChange={(e) => setData("nm_lengkap", e.target.value)} />
               {errors.nm_lengkap && <div className="text-red-500 text-sm">{errors.nm_lengkap}</div>}
             </div>
             <div>
               <label className="block text-sm font-medium mb-1">No. KK</label>
               <Input value={data.no_kk} onChange={(e) => setData("no_kk", e.target.value)} maxLength={16} />
               {errors.no_kk && <div className="text-red-500 text-sm">{errors.no_kk}</div>}
             </div>
             <div>
               <label className="block text-sm font-medium mb-1">Email</label>
               <Input type="email" value={data.email} onChange={(e) => setData("email", e.target.value)} />
               {errors.email && <div className="text-red-500 text-sm">{errors.email}</div>}
             </div>
             <div>
               <label className="block text-sm font-medium mb-1">Password</label>
               <Input type="password" value={data.password} onChange={(e) => setData("password", e.target.value)} placeholder="Isi hanya jika ingin ubah password" />
             </div>
             <div>
               <label className="block text-sm font-medium mb-1">No. HP</label>
               <Input value={data.no_hp} onChange={(e) => setData("no_hp", e.target.value)} />
             </div>
          </div>

          {/* Domisili */}
          <div className="bg-gray-50 p-4 rounded-lg border space-y-4">
             <h3 className="font-semibold text-gray-700">Domisili</h3>
             <div>
                <label className="block text-sm font-medium mb-1">Alamat Jalan</label>
                <Input value={data.alamat} onChange={(e) => setData("alamat", e.target.value)} />
                {errors.alamat && <div className="text-red-500 text-sm">{errors.alamat}</div>}
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                   <label className="block text-sm font-medium mb-1">Kota</label>
                   <Select onValueChange={handleKotaChange} value={data.kota_id}>
                     <SelectTrigger><SelectValue placeholder="Pilih Kota" /></SelectTrigger>
                     <SelectContent>
                        {wilayah.map(k => <SelectItem key={k.id} value={k.id.toString()}>{k.nama_kota}</SelectItem>)}
                     </SelectContent>
                   </Select>
                </div>
                <div>
                   <label className="block text-sm font-medium mb-1">Kecamatan</label>
                   <Select onValueChange={handleKecamatanChange} value={data.kecamatan_id} disabled={!data.kota_id}>
                     <SelectTrigger><SelectValue placeholder="Pilih Kecamatan" /></SelectTrigger>
                     <SelectContent>
                        {listKecamatan.map(k => <SelectItem key={k.id} value={k.id.toString()}>{k.nama_kecamatan}</SelectItem>)}
                     </SelectContent>
                   </Select>
                </div>
                <div>
                   <label className="block text-sm font-medium mb-1">Kelurahan</label>
                   <Select onValueChange={handleKelurahanChange} value={data.kelurahan_id} disabled={!data.kecamatan_id}>
                     <SelectTrigger><SelectValue placeholder="Pilih Kelurahan" /></SelectTrigger>
                     <SelectContent>
                        {listKelurahan.map(k => <SelectItem key={k.id} value={k.id.toString()}>{k.nama_kelurahan}</SelectItem>)}
                     </SelectContent>
                   </Select>
                </div>
                <div>
                   <label className="block text-sm font-medium mb-1">RW</label>
                   <Select onValueChange={handleRWChange} value={data.rw_id} disabled={!data.kelurahan_id}>
                     <SelectTrigger><SelectValue placeholder="Pilih RW" /></SelectTrigger>
                     <SelectContent>
                        {listRW.map(r => <SelectItem key={r.id} value={r.id.toString()}>{r.nomor_rw}</SelectItem>)}
                     </SelectContent>
                   </Select>
                </div>
                <div>
                   <label className="block text-sm font-medium mb-1">RT</label>
                   <Select onValueChange={(val) => setData("rt_id", val)} value={data.rt_id} disabled={!data.rw_id}>
                     <SelectTrigger><SelectValue placeholder="Pilih RT" /></SelectTrigger>
                     <SelectContent>
                        {listRT.map(r => <SelectItem key={r.id} value={r.id.toString()}>{r.nomor_rt}</SelectItem>)}
                     </SelectContent>
                   </Select>
                   {errors.rt_id && <div className="text-red-500 text-sm">RT wajib dipilih</div>}
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Kode Pos</label>
                    <Input value={data.kode_pos} onChange={(e) => setData("kode_pos", e.target.value)} />
                </div>
             </div>
          </div>

          {/* Role & Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Role</label>
              <Select value={data.role_id} onValueChange={(val) => setData("role_id", val)}>
                <SelectTrigger><SelectValue placeholder="Pilih Role" /></SelectTrigger>
                <SelectContent>
                  {roles.map((r) => <SelectItem key={r.id} value={r.id.toString()}>{r.nm_role}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <Select value={data.status} onValueChange={(val) => setData("status", val)}>
                <SelectTrigger><SelectValue placeholder="Pilih Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="tetap">Tetap</SelectItem>
                  <SelectItem value="kontrak">Kontrak</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Link href="/manajemen-data">
              <Button className="bg-red-500 hover:bg-red-600 text-white">Batal</Button>
            </Link>
            <Button type="submit" disabled={processing} className="bg-blue-600 hover:bg-blue-700 text-white">
              {processing ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}