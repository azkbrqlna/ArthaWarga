import React, { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { usePage } from "@inertiajs/react";
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
import iconCalender from "../assets/iconCalender.png";
import Footer from "@/components/ui/Footer";
import { useNotify } from "@/components/ToastNotification";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useForm } from "@inertiajs/react";
import iconArthaWarga from "../assets/iconArthaWarga.png";

// --- Komponen Role Card (Tidak Berubah) ---
const RoleCard = ({ title, color, desc, image }) => (
    <motion.div
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="relative bg-gray-100 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 flex flex-col overflow-hidden min-h-[480px]"
    >
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
                    className="object-contain max-h-110 transform transition-transform duration-300 hover:scale-105 translate-y-30"
                />
            </div>
        </div>
    </motion.div>
);

// --- Komponen Feature Card (Tidak Berubah) ---
const FeatureCard = ({ title, description, icon }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        viewport={{ once: true }}
        className="p-5 md:p-6 bg-blue-700/90 rounded-lg border border-white/20 shadow-xl transition-all duration-300 hover:scale-[1.02] text-white flex flex-col items-center h-full"
    >
        <div className="mb-4">
            <img
                src={icon}
                alt={title}
                className="w-14 h-14 md:w-20 md:h-20 object-contain"
            />
        </div>
        <h4 className="text-lg md:text-xl font-bold mb-2 leading-snug text-center">
            {title}
        </h4>
        <p className="text-center text-sm md:text-base font-light leading-relaxed opacity-90 flex-grow">
            {description}
        </p>
    </motion.div>
);

export default function Welcome() {
    const { auth } = usePage().props;
    const { notifySuccess, notifyError } = useNotify();
    const { data, setData, post, processing, errors } = useForm({
        email: "",
        password: "",
    });
    const [isScrolled, setIsScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 50);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const handleSmoothScroll = useCallback((e, targetId) => {
        e.preventDefault();
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
            targetElement.scrollIntoView({
                behavior: "smooth",
                block: "start",
            });
            setMenuOpen(false); // Tutup menu mobile setelah klik
        }
    }, []);

    const handleLogin = (e) => {
        e.preventDefault();
        post(route("login.post"), {
            onSuccess: () => {
                notifySuccess("Login berhasil! Mengalihkan ke dashboard...");
                setTimeout(() => {
                    window.location.href = "/dashboard";
                }, 1200);
            },
            onError: (errors) => {
                if (errors.email || errors.password) {
                    notifyError(errors.email || errors.password);
                } else {
                    notifyError("Email atau password salah.");
                }
            },
        });
    };

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
            description: "Mencatat pemasukan & pengeluaran dengan mudah.",
            icon: iconPencatatan,
        },
        {
            title: "Detail Kegiatan",
            description: "Menampilkan rincian kegiatan dan laporan realisasi.",
            icon: iconDetail,
        },
        {
            title: "Cetak Nota & Bukti",
            description: "Membuat bukti pembayaran digital untuk warga.",
            icon: iconCetak,
        },
        {
            title: "Laporan Otomatis",
            description: "Menyusun laporan keuangan siap cetak otomatis.",
            icon: iconLaporan,
        },
        {
            title: "Akses Transparan",
            description: "Warga dapat melihat informasi keuangan terbuka.",
            icon: iconAkses,
        },
        {
            title: "Tagihan Bulanan",
            description: "Mengirimkan pengingat taginan air dan sampah secara otomatis.",
            icon: iconCalender,
        },
    ];

    return (
        <div className="font-['Poppins'] text-gray-900 overflow-x-hidden">
            {/* NAVBAR */}
            <nav
                className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
                    isScrolled
                        ? "bg-white shadow-md py-4"
                        : "bg-transparent py-6"
                }`}
            >
                <div className="max-w-7xl mx-auto flex justify-between items-center px-4 sm:px-6 md:px-10">
                    <div className="flex items-center gap-3">
                        <img
                            src={iconArthaWarga}
                            alt="Logo"
                            className="w-10 h-10 object-contain"
                        />

                        <h1
                            className={`text-lg sm:text-xl font-bold uppercase transition-colors duration-300 ${
                                isScrolled ? "text-gray-900" : "text-gray-900"
                            }`}
                        >
                            Arthawarga
                        </h1>
                    </div>

                    {/* MENU DESKTOP */}
                    <ul className="hidden md:flex gap-6 text-sm font-medium uppercase">
                        <li
                            className={`cursor-pointer hover:text-blue-600 ${
                                isScrolled ? "text-gray-900" : "text-gray-900"
                            }`}
                            onClick={(e) => handleSmoothScroll(e, "home")}
                        >
                            Home
                        </li>
                        <li
                            className={`cursor-pointer hover:text-blue-600 ${
                                isScrolled ? "text-gray-900" : "text-gray-900"
                            }`}
                            onClick={(e) => handleSmoothScroll(e, "about")}
                        >
                            About
                        </li>
                        <li
                            className={`cursor-pointer hover:text-blue-600 ${
                                isScrolled ? "text-gray-900" : "text-gray-900"
                            }`}
                            onClick={(e) => handleSmoothScroll(e, "fitur")}
                        >
                            Fitur
                        </li>
                    </ul>

                    {/* LOGIN BUTTON (Hanya Tampil di Desktop 'md:block') */}
                    {auth?.user ? (
                        <a
                            href="/dashboard"
                            className="hidden md:block bg-blue-700 text-white px-5 py-2 rounded-full font-semibold hover:bg-blue-800 transition"
                        >
                            Dashboard
                        </a>
                    ) : (
                        <Dialog open={open} onOpenChange={setOpen}>
                            <DialogTrigger asChild>
                                <button className="hidden md:block bg-white text-blue-700 px-5 py-2 rounded-full font-semibold hover:bg-blue-700 hover:text-white border border-blue-700">
                                    Login
                                </button>
                            </DialogTrigger>

                            <DialogContent className="sm:max-w-md">
                                <DialogHeader>
                                    <DialogTitle className="text-center text-2xl font-bold mb-3">
                                        Masuk ke Arthawarga
                                    </DialogTitle>
                                </DialogHeader>
                                <form
                                    onSubmit={handleLogin}
                                    className="space-y-4 "
                                >
                                    <div>
                                        <Label className="pb-3">Email</Label>
                                        <Input
                                            type="email"
                                            value={data.email}
                                            onChange={(e) =>
                                                setData("email", e.target.value)
                                            }
                                            required
                                        />
                                        {errors.email && (
                                            <p className="text-sm text-red-600 mt-1">
                                                {errors.email}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <Label className="pb-3">Password</Label>
                                        <Input
                                            type="password"
                                            value={data.password}
                                            onChange={(e) =>
                                                setData(
                                                    "password",
                                                    e.target.value
                                                )
                                            }
                                            required
                                        />
                                        {errors.password && (
                                            <p className="text-sm text-red-600 mt-1">
                                                {errors.password}
                                            </p>
                                        )}
                                    </div>

                                    <DialogFooter>
                                        <Button
                                            type="submit"
                                            className="w-full bg-blue-700 hover:bg-blue-800"
                                            disabled={processing}
                                        >
                                            {processing
                                                ? "Memproses..."
                                                : "Login"}
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    )}

                    {/* Hamburger Button */}
                    <button
                        className={`md:hidden text-3xl transition-colors duration-300 ${
                            isScrolled ? "text-gray-900" : "text-gray-900"
                        }`}
                        onClick={() => setMenuOpen(!menuOpen)}
                    >
                        ☰
                    </button>
                </div>

                {/* Menu Mobile */}
                {menuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25 }}
                        className="md:hidden bg-white shadow-md px-6 py-4 flex flex-col gap-4 text-sm uppercase text-center"
                    >
                        <a
                            href="#home"
                            onClick={(e) => handleSmoothScroll(e, "home")}
                        >
                            Home
                        </a>
                        <a
                            href="#about"
                            onClick={(e) => handleSmoothScroll(e, "about")}
                        >
                            About
                        </a>
                        <a
                            href="#fitur"
                            onClick={(e) => handleSmoothScroll(e, "fitur")}
                        >
                            Fitur
                        </a>
                        {/* Tombol Login Mobile: Membuka Dialog yang sama */}
                        {auth?.user ? (
                            <a
                                href="/dashboard"
                                className="bg-blue-700 text-white px-4 py-2 rounded-full"
                            >
                                Dashboard
                            </a>
                        ) : (
                            <button
                                className="bg-blue-700 text-white px-4 py-2 rounded-full"
                                onClick={() => {
                                    setMenuOpen(false);
                                    setOpen(true);
                                }}
                            >
                                Login
                            </button>
                        )}
                    </motion.div>
                )}
            </nav>

            {/* HERO */}
            <section
                id="home"
                className="relative pt-32 md:pt-40 pb-20 md:pb-32 overflow-hidden bg-white"
            >
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between px-6 md:px-10 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7 }}
                        viewport={{ once: true }}
                        className="text-center md:text-left w-full md:w-1/2 max-w-lg mx-auto md:mx-0 mt-10 md:mt-0"
                    >
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight">
                            Website Manajemen <br />
                            <span className="text-green-800">
                                Keuangan
                            </span>{" "}
                            <br />
                            Rukun Tetangga
                        </h2>
                        <p className="mt-6 text-sm sm:text-base md:text-lg italic text-gray-700">
                            "Dari Catatan Manual ke Era Digital — Semua dalam
                            Genggaman."
                        </p>
                    </motion.div>

                    <motion.img
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.7 }}
                        viewport={{ once: true }}
                        src={modelheroImage}
                        alt="Model Hero"
                        className="relative w-full max-w-xs md:max-w-md object-contain z-10 mx-auto mt-10 translate-x-20"
                    />
                </div>

                <img
                    src={heroImage}
                    alt="Hero background"
                    className="absolute top-0 right-0 w-full h-[800px] md:h-full md:w-[75%] object-cover object-top z-0"
                />
            </section>

            {/* ABOUT */}
            <section
                id="about"
                className="relative py-20 bg-gradient-to-r from-blue-600 to-blue-950 text-center px-6 overflow-hidden"
            >
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7 }}
                    viewport={{ once: true }}
                    className="max-w-4xl mx-auto"
                >
                    <h2 className="text-4xl sm:text-3xl md:text-4xl font-extrabold mb-6 text-white">
                        Tentang
                    </h2>
                    <p className="text-sm sm:text-base md:text-lg text-white leading-relaxed">
                        Website manajemen keuangan RT ini hadir untuk membantu
                        pengurus dan warga dalam mengelola keuangan dengan lebih
                        transparan, rapi, dan mudah diakses. Dengan adanya
                        sistem ini, setiap pemasukan dan pengeluaran dapat
                        dicatat secara digital, sehingga warga bisa ikut
                        memantau perkembangan kas RT kapan saja. Selain itu,
                        website ini juga mempermudah pembuatan laporan bulanan
                        maupun tahunan tanpa harus repot mencatat manual.
                    </p>
                </motion.div>
            </section>

            {/* ROLES */}
            <section id="roles" className="bg-white px-6 md:px-20 pb-20 pt-20">
                <h2
                    className="text-4xl font-extrabold text-center mb-16 
                        bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-950"
                >
                    Peran Pengguna
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 max-w-6xl mx-auto">
                    {roles.map((r, i) => (
                        <RoleCard key={i} {...r} />
                    ))}
                </div>
            </section>

            {/* FITUR */}
            <section
                id="fitur"
                className="relative pt-40 md:pt-10 pb-40 bg-white overflow-visible"
            >
                <div className="absolute top-[70px] md:top-[50px] left-0 w-full z-0 h-full">
                    <img
                        src={featuresWaveBg}
                        alt="Background wave"
                        className="w-full h-full object-cover object-top"
                    />
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 md:px-10">
                    <motion.h2
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7 }}
                        viewport={{ once: true }}
                        className="text-blue-900 text-4xl sm:text-4xl md:text-5xl font-extrabold text-center mb-16"
                    >
                        Fitur
                    </motion.h2>

                    <div className="px-8 py-14 ">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                            {featuresData.map((f, i) => (
                                <FeatureCard key={i} {...f} />
                            ))}
                        </div>
                    </div>
                </div>
            </section>
            <Footer />
        </div>
    );
}
