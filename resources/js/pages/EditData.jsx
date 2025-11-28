import React from "react";
import AppLayout from "@/layouts/AppLayout";
import { Link, useForm } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNotify } from "@/Components/toastNotification"; 
import { router } from "@inertiajs/react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function EditData({ user, roles }) {
  const { notifySuccess, notifyError } = useNotify();

  const { data, setData, put, processing, errors } = useForm({
    nm_lengkap: user.nm_lengkap || "",
    no_kk: user.no_kk || "",
    email: user.email || "",
    password: "",
    no_hp: user.no_hp || "",
    alamat: user.alamat || "",
    rt: user.rt || "",
    rw: user.rw || "",
    kode_pos: user.kode_pos || "",
    role_id: user.role_id ? user.role_id.toString() : "",
    status: user.status || "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    put(route("superadmin.updateUser", user.id), {
      preserveScroll: true,
      onSuccess: () => {
          notifySuccess("Berhasil", "Data berhasil diperbarui!");

          setTimeout(() => {
              router.visit("/manajemen-data"); 
          }, 500);
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
          <Link
            href="/manajemen-data"
            className="hover:text-blue-600 transition-colors duration-200"
          >
            Manajemen Data
          </Link>
          <span className="mx-2 text-gray-400">›</span>
          <span className="text-black font-bold">Edit Data</span>
        </div>

        {/* Form Input */}
        <form onSubmit={handleSubmit} className="space-y-6 py-5 max-w-5xl">
          {/* Nama Lengkap */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Nama Lengkap
            </label>
            <Input
              value={data.nm_lengkap}
              onChange={(e) => setData("nm_lengkap", e.target.value)}
              placeholder="Masukkan nama lengkap anda"
            />
            {errors.nm_lengkap && (
              <div className="text-red-500 text-sm">{errors.nm_lengkap}</div>
            )}
          </div>

          {/* No. KK */}
          <div>
            <label className="block text-sm font-medium mb-1">No. KK</label>
            <Input
              value={data.no_kk}
              onChange={(e) => setData("no_kk", e.target.value)}
              placeholder="Masukkan Nomor Kartu Keluarga anda"
            />
            {errors.no_kk && (
              <div className="text-red-500 text-sm">{errors.no_kk}</div>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <Input
              type="email"
              value={data.email}
              onChange={(e) => setData("email", e.target.value)}
              placeholder="Masukkan alamat Email anda"
            />
            {errors.email && (
              <div className="text-red-500 text-sm">{errors.email}</div>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <Input
              type="password"
              value={data.password}
              onChange={(e) => setData("password", e.target.value)}
              placeholder="Kosongkan jika tidak ingin mengubah password"
            />
          </div>

          {/* No. HP */}
          <div>
            <label className="block text-sm font-medium mb-1">No. HP</label>
            <Input
              value={data.no_hp}
              onChange={(e) => setData("no_hp", e.target.value)}
              placeholder="Masukkan nomor telepon anda"
            />
          </div>

          {/* Alamat, RT, RW, Kode Pos */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-6">
              <label className="block text-sm font-medium mb-1">Alamat</label>
              <Input
                value={data.alamat}
                onChange={(e) => setData("alamat", e.target.value)}
                placeholder="Masukkan alamat lengkap anda"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">RT</label>
              <Select
                value={data.rt}
                onValueChange={(value) => setData("rt", value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih RT" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 10 }, (_, i) => (
                    <SelectItem key={i + 1} value={String(i + 1)}>
                      RT 0{i + 1}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">RW</label>
              <Select
                value={data.rw}
                onValueChange={(value) => setData("rw", value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih RW" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 10 }, (_, i) => (
                    <SelectItem key={i + 1} value={String(i + 1)}>
                      RW 0{i + 1}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">
                Kode Pos
              </label>
              <Select
                value={data.kode_pos}
                onValueChange={(value) => setData("kode_pos", value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih Kode Pos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="50144">50144</SelectItem>
                  <SelectItem value="50145">50145</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Role & Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Role</label>
              <Select
                value={data.role_id}
                onValueChange={(value) => setData("role_id", value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih Role" />
                </SelectTrigger>
                <SelectContent>
                  {roles && roles.length > 0 ? (
                    roles.map((role) => (
                      <SelectItem key={role.id} value={role.id.toString()}>
                        {role.nm_role || role.nama_role || role.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem disabled>Tidak ada role tersedia</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <Select
                value={data.status}
                onValueChange={(value) => setData("status", value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tetap">Tetap</SelectItem>
                  <SelectItem value="kontrak">Kontrak</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tombol Aksi */}
          <div className="flex justify-end gap-3 pt-4">
            <Link href="/manajemen-data">
              <Button className="bg-red-500 hover:bg-red-600 text-white">
                Batal
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={processing}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {processing ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
