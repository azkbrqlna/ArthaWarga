import React, { useEffect, useState } from "react";

import heroImage from "../assets/hero.svg";
import modelheroImage from "../assets/model_hero.png";
import ketuaRtImage from "../assets/ketua-rt.png";
import sekretarisImage from "../assets/sekretaris.png";
import bendaharaImage from "../assets/bendahara.png";
import wargaImage from "../assets/warga.png";
import cardWaveImage from "../assets/cardWave.png";
import featuresWaveBg from "../assets/featuresWaveBg.svg";
import iconPencatatan from "../assets/iconPencatatan.png";
import iconDetail from "../assets/iconDetail.png";
import iconCetak from "../assets/iconCetak.png";
import iconLaporan from "../assets/iconLaporan.png";
import iconAkses from "../assets/iconAkses.png";
import iconNotifikasi from "../assets/iconNotifikasi.png";
import Footer from "@/components/ui/Footer"; // 

// --- Komponen Role Card ---
const RoleCard = ({ title, color, desc, image }) => (
  <div className="relative bg-gray-100 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 flex flex-col overflow-hidden min-h-[480px]">
    <div className="absolute bottom-0 left-0 w-full z-0">
      <img
        src={cardWaveImage}
        alt="Wave background"
        className="absolute bottom-[-5rem] left-0 w-full z-0"
      />
    </div>
    <div className="relative z-10 flex flex-col items-center text-center px-6 pt-10 pb-8">
      <h3 className={`text-2xl font-extrabold mb-6 ${color}`}>{title}</h3>
      <p className="text-gray-700 text-sm leading-relaxed mb-10 max-w-xs">
        {desc}
      </p>
      <div className="relative w-full flex justify-center items-end h-72 mt-auto">
        <img
          src={image}
          alt={title}
          className="object-contain max-h-110 transform transition-transform duration-300 hover:scale-120 translate-y-30"
        />
      </div>
    </div>
  </div>
);

// --- Komponen Feature Card ---
const FeatureCard = ({ title, description, icon }) => (
  <div className="p-5 md:p-6 bg-blue-500 backdrop-blur-sm rounded-lg border border-white/20 shadow-xl transition-all duration-300 hover:scale-[1.02] text-white flex flex-col items-center h-full">
    <div className="mb-4">
      <img src={icon} alt={title} className="w-20 h-20 object-contain" />
    </div>
    <h4 className="text-xl font-bold mb-2 leading-snug">{title}</h4>
    <p className="text-center text-sm font-light leading-relaxed opacity-80 flex-grow">
      {description}
    </p>
  </div>
);

export default function Welcome() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const roles = [
    {
      title: "Ketua RT",
      color: "text-blue-600",
      desc: "Ketua RT dapat memantau seluruh laporan keuangan, mencatat pemasukan, pengeluaran, serta kegiatan warga. Selain itu, Ketua RT juga dapat mencetak laporan keuangan setiap akhir bulan.",
      image: ketuaRtImage,
    },
    {
      title: "Sekretaris",
      color: "text-green-600",
      desc: "Sekretaris RT berperan dalam mencatat dan memantau data keuangan serta kegiatan RT. Ia juga membantu mencetak laporan keuangan akhir bulan untuk keperluan administrasi.",
      image: sekretarisImage,
    },
    {
      title: "Bendahara",
      color: "text-orange-600",
      desc: "Bendahara RT bertanggung jawab dalam menginput data pemasukan, pengeluaran, dan kegiatan RT. Selain itu, bendahara juga memantau laporan keuangan dan mencetak laporan akhir bulan.",
      image: bendaharaImage,
    },
    {
      title: "Warga",
      color: "text-red-600",
      desc: "Warga RT dapat melihat informasi keuangan RT secara transparan dan mencetak laporan keuangan akhir bulan sebagai bentuk keterbukaan data.",
      image: wargaImage,
    },
  ];

  const featuresData = [
    {
      title: "Pencatatan Keuangan",
      description:
        "Mencatat pemasukan & pengeluaran keuangan pada Rukun Tetangga dengan mudah dan detail.",
      icon: iconPencatatan,
    },
    {
      title: "Detail Kegiatan",
      description:
        "Setiap kegiatan RT dilengkapi dengan rincian anggaran, laporan realisasi, dan dokumentasi lengkap.",
      icon: iconDetail,
    },
    {
      title: "Cetak Nota & Bukti Transaksi",
      description:
        "Memudahkan pengurus membuat bukti pembayaran secara digital yang bisa direkap maupun dibagikan ke warga.",
      icon: iconCetak,
    },
    {
      title: "Laporan Keuangan Otomatis",
      description:
        "Sistem menyusun laporan pemasukan dan pengeluaran secara otomatis, siap dicetak untuk rapat RT atau arsip.",
      icon: iconLaporan,
    },
    {
      title: "Akses Online & Transparan",
      description:
        "Warga dapat melihat informasi keuangan secara langsung, sehingga lebih terbuka dan akuntabel.",
      icon: iconAkses,
    },
    {
      title: "Notifikasi Iuran Otomatis",
      description:
        "Mengirimkan pengingat (notifikasi) iuran rutin/wajib kepada warga secara otomatis.",
      icon: iconNotifikasi,
    },
  ];

  return (
    <div className="font-['Poppins'] text-gray-900 overflow-x-hidden">
      {/* Navbar */}
      <nav
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
          isScrolled ? "bg-white shadow-md py-4" : "bg-transparent py-6"
        }`}
      >
        <div className="flex justify-between items-center px-8">
          <div className="flex items-center gap-10">
            <h1 className="text-xl font-bold uppercase border-r border-gray-400 pr-5">
              Arthawarga
            </h1>
            <ul className="flex gap-6 text-sm font-medium uppercase">
              <li className="hover:text-blue-300 cursor-pointer">Home</li>
              <li className="hover:text-blue-300 cursor-pointer">About</li>
              <li className="hover:text-blue-300 cursor-pointer">Fitur</li>
              <li className="hover:text-blue-300 cursor-pointer">Kontak</li>
            </ul>
          </div>

          <button className="bg-white text-blue-700 px-5 py-2 rounded-full font-semibold hover:bg-[#182E6F] hover:text-white border border-blue-700">
            Login
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative pt-40 pb-40">
        <img
          src={heroImage}
          alt="Gambar tidak ditemukan"
          className="absolute right-0 -top-25 w-[70] h-[180%] object-cover z-0 object-top"
        />
        <img
          src={modelheroImage}
          alt="model hero tidak ditemukan"
          className="absolute bottom-15 left-[70%] h-[75%] z-10 object-contain"
        />

        <div className="max-w-7xl mx-auto px-10 relative z-20">
          <h2 className="text-4xl font-['Poppins'] font-extrabold text-gray-900 leading-tight max-w-lg">
            Website Manajemen <br />
            <span className="text-[#26C3A6]">Keuangan</span> <br />
            Rukun Tetangga
          </h2>
          <p className="font-['Poppins'] mt-6 text-lg max-w-md italic text-gray-700">
            "Dari Catatan Manual ke Era Digital <br />
            Semua dalam Genggaman."
          </p>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="relative py-25 bg-gradient-to-r from-blue-600 to-blue-950 text-center px-6 overflow-hidden">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-extrabold mb-6 text-white">
            Tentang
          </h2>
          <p className="text-lg text-white leading-relaxed">
            Website manajemen keuangan RT ini hadir untuk membantu pengurus dan
            warga dalam mengelola keuangan dengan lebih transparan, rapi, dan
            mudah diakses. Dengan adanya sistem ini, setiap pemasukan dan
            pengeluaran dapat dicatat secara digital, sehingga warga bisa ikut
            memantau perkembangan kas RT kapan saja. Selain itu, website ini juga
            mempermudah pembuatan laporan bulanan maupun tahunan tanpa harus
            repot mencatat manual.
          </p>
        </div>
      </section>

      {/* ROLE CARDS */}
      <section id="roles" className="bg-white px-6 md:px-20  pb-20 pt-20">
        <h2 className="text-4xl font-extrabold text-center mb-16 
                    bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-950">
            Peran Pengguna
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 max-w-6xl mx-auto">
          {roles.map((r, index) => (
            <RoleCard key={index} {...r} />
          ))}
        </div>
      </section>

      {/* FITUR */}
      <section id="fitur" className="relative pt-30 pb-32 overflow-hidden">
        <div className="absolute top-25 left-0 w-auto z-0">
          <img
            src={featuresWaveBg}
            alt="Background wave hijau"
            className="w-full h-auto object-cover object-top scale-100"
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 text-white">
          <h2 className="text-blue-900 text-4xl font-extrabold text-center mb-50 -mt-24">Fitur</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
      {featuresData.map((feature, index) => (
        <div
          key={index}
          className={`flex justify-center            
          }`}
        >
          <FeatureCard {...feature} />
        </div>
      ))}
    </div>
  </div>
</section>

      {/* FOOTER */}
      <Footer />
    </div>
  );
}
