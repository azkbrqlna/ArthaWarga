import React from "react";
import AppLayoutSuperadmin from "@/layouts/AppLayoutSuperadmin";
import { Link, useForm } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function TambahData({ roles }) {
  // Form state
  const { data, setData, post, processing, errors } = useForm({
    nm_lengkap: "",
    no_kk: "",
    email: "",
    password: "",
    no_hp: "",
    alamat: "",
    rt: "",
    rw: "",
    kode_pos: "",
    role_id: "",
    status: "",
  });

  // Handle submit
  const handleSubmit = (e) => {
    e.preventDefault();
    post(route("superadmin.storeUser"), {
      preserveScroll: true,
      onSuccess: () => {
        alert("Data berhasil disimpan!");
      },
      onError: () => {
        alert("Terjadi kesalahan, silakan cek kembali form.");
      },
    });
  };

  return (
    <AppLayoutSuperadmin>
      <div className="px-6 py-6">
        {/* Breadcrumb */}
        <div className="flex items-center text-gray-400 text-2xl md:text-3xl font-semibold border-b-2 border-gray-200 py-3 md:py-5">
          <Link
            href="/manajemen_data"
            className="hover:text-blue-600 transition-colors duration-200"
          >
            Manajemen Data
          </Link>
          <span className="mx-2 text-gray-400">›</span>
          <span className="text-black font-bold">Tambah Data</span>
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
              placeholder="Masukkan password akun anda"
            />
            {errors.password && (
              <div className="text-red-500 text-sm">{errors.password}</div>
            )}
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
                onValueChange={(value) => setData("rt", value)}
                value={data.rt}
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
                onValueChange={(value) => setData("rw", value)}
                value={data.rw}
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
                onValueChange={(value) => setData("kode_pos", value)}
                value={data.kode_pos}
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
                onValueChange={(value) => setData("role_id", value)}
                value={data.role_id}
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
              {errors.role_id && (
                <div className="text-red-500 text-sm">{errors.role_id}</div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <Select
                onValueChange={(value) => setData("status", value)}
                value={data.status}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tetap">Tetap</SelectItem>
                  <SelectItem value="kontrak">Kontrak</SelectItem>
                </SelectContent>
              </Select>
              {errors.status && (
                <div className="text-red-500 text-sm">{errors.status}</div>
              )}
            </div>
          </div>

          {/* Tombol Aksi */}
          <div className="flex justify-end gap-3 pt-4">
            <Link href="/manajemen_data">
              <Button className="bg-red-500 hover:bg-red-600 text-white">
                Batal
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={processing}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {processing ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </form>
      </div>
    </AppLayoutSuperadmin>
  );
}
