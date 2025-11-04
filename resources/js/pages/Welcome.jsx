import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

import heroImage from "../assets/hero.png";
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
import Footer from "@/components/ui/Footer";

// --- Komponen Role Card ---
const RoleCard = ({ title, color, desc, image }) => (
  <motion.div
    initial={{ opacity: 0, y: 60 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6 }}
    viewport={{ once: true }}
    className="relative bg-gray-100 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 flex flex-col overflow-hidden min-h-[420px]"
  >
    <div className="absolute bottom-0 left-0 w-full z-0">
      <img
        src={cardWaveImage}
        alt="Wave background"
        className="absolute bottom-[-5rem] left-0 w-full z-0"
      />
    </div>
    <div className="relative z-10 flex flex-col items-center text-center px-4 sm:px-6 pt-10 pb-8">
      <h3 className={`text-lg sm:text-xl md:text-2xl font-extrabold mb-4 ${color}`}>
        {title}
      </h3>
      <p className="text-gray-700 text-sm sm:text-base leading-relaxed mb-8 max-w-xs">
        {desc}
      </p>
      <div className="relative w-full flex justify-center items-end h-56 sm:h-64 mt-auto">
        <img
          src={image}
          alt={title}
          className="object-contain max-h-72 transform transition-transform duration-300 hover:scale-110"
        />
      </div>
    </div>
  </motion.div>
);

// --- Komponen Feature Card ---
const FeatureCard = ({ title, description, icon }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    whileInView={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.4 }}
    viewport={{ once: true }}
    className="p-5 md:p-6 bg-blue-700/90 rounded-lg border border-white/20 shadow-xl transition-all duration-300 hover:scale-[1.02] text-white flex flex-col items-center h-full"
  >
    <div className="mb-4">
      <img src={icon} alt={title} className="w-14 h-14 md:w-20 md:h-20 object-contain" />
    </div>
    <h4 className="text-lg md:text-xl font-bold mb-2 leading-snug text-center">{title}</h4>
    <p className="text-center text-sm md:text-base font-light leading-relaxed opacity-90 flex-grow">
      {description}
    </p>
  </motion.div>
);

export default function Welcome() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const roles = [
    { title: "Ketua RT", color: "text-blue-600", desc: "Ketua RT dapat memantau seluruh laporan keuangan, mencatat pemasukan, pengeluaran, serta kegiatan warga.", image: ketuaRtImage },
    { title: "Sekretaris", color: "text-green-600", desc: "Sekretaris RT berperan dalam mencatat dan memantau data keuangan serta kegiatan RT.", image: sekretarisImage },
    { title: "Bendahara", color: "text-orange-600", desc: "Bendahara RT bertanggung jawab dalam menginput data pemasukan, pengeluaran, dan kegiatan RT.", image: bendaharaImage },
    { title: "Warga", color: "text-red-600", desc: "Warga RT dapat melihat informasi keuangan RT secara transparan dan mencetak laporan akhir bulan.", image: wargaImage },
  ];

  const featuresData = [
    { title: "Pencatatan Keuangan", description: "Mencatat pemasukan & pengeluaran dengan mudah.", icon: iconPencatatan },
    { title: "Detail Kegiatan", description: "Menampilkan rincian kegiatan dan laporan realisasi.", icon: iconDetail },
    { title: "Cetak Nota & Bukti", description: "Membuat bukti pembayaran digital untuk warga.", icon: iconCetak },
    { title: "Laporan Otomatis", description: "Menyusun laporan keuangan siap cetak otomatis.", icon: iconLaporan },
    { title: "Akses Transparan", description: "Warga dapat melihat informasi keuangan terbuka.", icon: iconAkses },
    { title: "Notifikasi Iuran", description: "Mengirimkan pengingat iuran secara otomatis.", icon: iconNotifikasi },
  ];

  return (
    <div className="font-['Poppins'] text-gray-900 overflow-x-hidden">

      {/* NAVBAR */}
      <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? "bg-white shadow-md py-4" : "bg-transparent py-6"
      }`}>
        <div className="max-w-7xl mx-auto flex justify-between items-center px-4 sm:px-6 md:px-10">

          <h1 className={`text-lg sm:text-xl font-bold uppercase border-r pr-4 sm:pr-5 transition-colors duration-300 ${
            isScrolled ? "text-gray-900 border-gray-400" : "text-white border-white/70"
          }`}>
            Arthawarga
          </h1>

          <ul className="hidden md:flex gap-6 text-sm font-medium uppercase">
            <li className="hover:text-blue-600 cursor-pointer">Home</li>
            <li className="hover:text-blue-600 cursor-pointer">About</li>
            <li className="hover:text-blue-600 cursor-pointer">Fitur</li>
            <li className="hover:text-blue-600 cursor-pointer">Kontak</li>
          </ul>

          <button className="hidden md:block bg-white text-blue-700 px-5 py-2 rounded-full font-semibold hover:bg-blue-700 hover:text-white border border-blue-700">
            Login
          </button>

          {/* Tombol Burger Hitam */}
          <button
            className="md:hidden text-3xl text-black"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            ☰
          </button>

        </div>

        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="md:hidden bg-white shadow-md px-6 py-4 flex flex-col gap-4 text-sm uppercase text-center"
          >
            <a href="#home" onClick={() => setMenuOpen(false)}>Home</a>
            <a href="#about" onClick={() => setMenuOpen(false)}>About</a>
            <a href="#fitur" onClick={() => setMenuOpen(false)}>Fitur</a>
            <a href="#kontak" onClick={() => setMenuOpen(false)}>Kontak</a>
            <button className="bg-blue-700 text-white px-4 py-2 rounded-full">
              Login
            </button>
          </motion.div>
        )}
      </nav>

      {/* HERO */}
      <section id="home" className="relative pt-32 md:pt-40 pb-20 md:pb-32 overflow-hidden bg-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between px-6 md:px-10 relative z-10">

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="text-center md:text-left md:w-1/2 mt-10 md:mt-0"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight">
              Website Manajemen <br />
              <span className="text-green-800">Keuangan</span> <br />
              Rukun Tetangga
            </h2>
            <p className="mt-6 text-sm sm:text-base md:text-lg italic text-gray-700">
              "Dari Catatan Manual ke Era Digital — Semua dalam Genggaman."
            </p>
          </motion.div>

          <motion.img
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            src={modelheroImage}
            alt="Model Hero"
            className="relative w-[70%] sm:w-[60%] md:w-[85%] max-w-md object-contain z-10"
          />
        </div>

        <img
          src={heroImage}
          alt="Hero background"
          className="absolute top-0 right-0 w-full md:w-[75%] object-cover z-0"
        />
      </section>

      {/* ABOUT */}
      <section id="about" className="relative py-20 bg-gradient-to-r from-blue-600 to-blue-950 text-center px-6 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-6 text-white">
            Tentang
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-white leading-relaxed">
            Website manajemen keuangan RT ini membantu pengurus dan warga mengelola
            keuangan dengan lebih transparan dan efisien.
          </p>
        </motion.div>
      </section>

      {/* ROLES */}
      <section id="roles" className="bg-white px-4 sm:px-6 md:px-20 pb-20 pt-20">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-center mb-12 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-950">
          Peran Pengguna
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {roles.map((r, i) => (
            <RoleCard key={i} {...r} />
          ))}
        </div>
      </section>

      {/* FITUR */}
      <section id="fitur" className="relative pt-32 pb-28 overflow-hidden bg-white">
        <img
          src={featuresWaveBg}
          alt="Background wave"
          className="hidden md:block absolute top-0 left-0 w-full h-auto object-cover z-0"
        />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 md:px-10">
          <motion.h2
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="text-blue-900 text-3xl sm:text-4xl md:text-5xl font-extrabold text-center mb-16"
          >
            Fitur
          </motion.h2>
          <div className="bg-blue-900 rounded-3xl px-8 py-14 shadow-xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {featuresData.map((f, i) => (
                <FeatureCard key={i} {...f} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <Footer />
    </div>
  );
}
