import React, { useState } from "react";
import { Head, router } from "@inertiajs/react";
import { Upload, Droplet, LayoutDashboard } from "lucide-react";

export default function IuranAir() {
  const [nota, setNota] = useState(null);
  const [pembayaran, setPembayaran] = useState(null);
  const [notaFile, setNotaFile] = useState(null);
  const [pembayaranFile, setPembayaranFile] = useState(null);

  const handleFileChange = (e, setPreview, setFile) => {
    const file = e.target.files[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
      setFile(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Cek apakah file sudah dipilih
    if (!notaFile || !pembayaranFile) {
      alert("Harap unggah bukti nota dan pembayaran terlebih dahulu!");
      return;
    }

    // Kirim data ke backend via FormData
    const formData = new FormData();
    formData.append("jenis_iuran", "Air");
    formData.append("total", 60000);
    formData.append("bukti_nota", notaFile);
    formData.append("bukti_pembayaran", pembayaranFile);

    router.post(route("masuk-iuran.store"), formData, {
      forceFormData: true,
      onSuccess: () => {
        alert("Iuran berhasil dikirim!");
        router.visit(route("masuk-iuran.index"));
      },
      onError: (err) => {
        console.error(err);
        alert("Terjadi kesalahan saat mengirim data!");
      },
    });
  };

  return (
    <>
      <Head title="Iuran Air Anda" />
      <div className="flex min-h-screen bg-white overflow-hidden">
        {/* Sidebar */}
        <div className="w-[250px] bg-gradient-to-b from-[#5AB2FF] to-[#4D9BFF] flex flex-col justify-between rounded-r-3xl shadow-md">
          <div>
            <div className="py-6 text-center font-semibold text-lg text-black">
              ArthaWarga
            </div>
            <ul className="mt-4 space-y-1 px-4">
              <li className="flex items-center gap-2 text-gray-700 text-sm font-medium hover:bg-[#66B5FF] rounded-lg px-3 py-2 cursor-pointer transition">
                <LayoutDashboard className="w-5 h-5 text-gray-600" />
                Dashboard Keuangan
              </li>
              <li className="flex items-center gap-2 text-blue-700 bg-white rounded-l-full px-3 py-2 font-semibold shadow-inner">
                <Droplet className="w-5 h-5 text-blue-600" />
                Iuran Warga
              </li>
            </ul>
          </div>

          <div className="bg-[#3D90E3] text-white text-sm p-4 rounded-br-3xl flex items-center justify-between">
            <div>
              <p className="text-xs">Welcome back 👋</p>
              <p className="font-semibold">Johnathen</p>
            </div>
            <span className="text-lg">➤</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-10 overflow-auto">
          <h1 className="text-2xl font-semibold mb-8">Iuran Air Anda</h1>

          <form className="max-w-3xl" onSubmit={handleSubmit}>
            {/* Jenis Iuran */}
            <div className="mb-4">
              <label className="block text-sm mb-2">Jenis iuran</label>
              <input
                type="text"
                value="Air"
                readOnly
                className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-400"
              />
            </div>

            {/* Total */}
            <div className="mb-6">
              <label className="block text-sm mb-2">Total</label>
              <input
                type="text"
                value="Rp. 60,000"
                readOnly
                className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-400"
              />
            </div>

            {/* Bukti Nota */}
            <div className="mb-6">
              <label className="block text-sm mb-2">
                Bukti Nota <span className="text-red-500">*</span>
              </label>
              <div
                className="relative w-full border border-gray-300 rounded-md flex flex-col items-center justify-center p-6 text-gray-400 cursor-pointer"
                onClick={() => document.getElementById("nota-upload").click()}
              >
                {nota ? (
                  <img
                    src={nota}
                    alt="Bukti Nota"
                    className="max-h-48 rounded-md"
                  />
                ) : (
                  <>
                    <Upload className="w-6 h-6 mb-2 text-gray-500" />
                    <span className="text-gray-500">
                      Klik atau seret gambar ke sini
                    </span>
                  </>
                )}
                <input
                  id="nota-upload"
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    handleFileChange(e, setNota, setNotaFile)
                  }
                  className="hidden"
                />
              </div>
            </div>

            {/* Bukti Pembayaran */}
            <div className="mb-8">
              <label className="block text-sm mb-2">
                Bukti Pembayaran <span className="text-red-500">*</span>
              </label>
              <div
                className="relative w-full border border-gray-300 rounded-md flex flex-col items-center justify-center p-6 text-gray-400 cursor-pointer"
                onClick={() =>
                  document.getElementById("pembayaran-upload").click()
                }
              >
                {pembayaran ? (
                  <img
                    src={pembayaran}
                    alt="Bukti Pembayaran"
                    className="max-h-48 rounded-md"
                  />
                ) : (
                  <>
                    <Upload className="w-6 h-6 mb-2 text-gray-500" />
                    <span className="text-gray-500">
                      Klik atau seret gambar ke sini
                    </span>
                  </>
                )}
                <input
                  id="pembayaran-upload"
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    handleFileChange(e, setPembayaran, setPembayaranFile)
                  }
                  className="hidden"
                />
              </div>
            </div>

            {/* Tombol */}
            <div className="flex gap-4 justify-center">
              <button
                type="button"
                className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-8 rounded-md"
                onClick={() => router.visit(route("masuk-iuran.index"))}
              >
                BATAL
              </button>
              <button
                type="submit"
                className="bg-emerald-400 hover:bg-emerald-500 text-white py-2 px-8 rounded-md"
              >
                Tambah Pemasukan
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
