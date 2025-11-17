import React from "react";

export default function Footer() {
    return (
        <footer className="bg-blue-600 text-white py-10 mt-20 border-t border-green-200">
            <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-start md:items-center">
                {/* Kiri */}
                <div className="mb-6 md:mb-0">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        <span className="text-pink-500">🧾</span> Yourlogo.
                    </h3>
                    <p className="mt-2 text-sm text-white max-w-md leading-relaxed">
                        Aplikasi pengelolaan keuangan RT yang membantu
                        transparansi dan efisiensi.
                    </p>
                </div>

                {/* Kanan */}
                <div className="flex flex-col md:flex-row gap-3 md:gap-6 text-sm font-medium">
                    <a href="#" className="hover:text-blue-300 transition">
                        About
                    </a>
                    <a href="#" className="hover:text-blue-300 transition">
                        Fitur
                    </a>
                    <a href="#" className="hover:text-blue-300 transition">
                        Laporan
                    </a>
                    <a href="#" className="hover:text-blue-300 transition">
                        Kontak
                    </a>
                    <a href="#" className="hover:text-blue-300 transition">
                        Legal
                    </a>
                </div>
            </div>

            {/* Garis bawah */}
            <hr className="my-6 border-white" />

            {/* Bawah */}
            <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between text-xs text-white">
                <div className="flex flex-wrap gap-3 mb-2 md:mb-0">
                    <a href="#" className="hover:text-blue-300 transition">
                        Terms & Conditions
                    </a>
                    <a href="#" className="hover:text-blue-300 transition">
                        Privacy Policy
                    </a>
                    <a href="#" className="hover:text-blue-300 transition">
                        Accessibility
                    </a>
                    <a href="#" className="hover:text-blue-300 transition">
                        Legal
                    </a>
                </div>
                <p className="text-white text-center md:text-right">
                    Design with © Sistem Keuangan RT 2025. All rights reserved.
                </p>
            </div>
        </footer>
    );
}
