import React from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export default function DownloadPdfBtn({ month, year }) {
    const handleDownload = () => {
        // Mengirim parameter month & year ke route Laravel
        // Ziggy (route helper) akan otomatis mengubahnya menjadi query string:
        // Contoh: /download-pdf?month=12&year=2025
        const url = route("download.pdf", {
            month: month || "",
            year: year || "",
        });

        // Download manual via browser (tab baru)
        window.open(url, "_blank");
    };

    return (
        <Button
            onClick={handleDownload}
            className="bg-purple-600 hover:bg-purple-700 text-white text-xs md:text-sm px-3 md:px-4 py-2 rounded-md"
        >
            <Download className="w-4 h-4 mr-2" />
            Download PDF
        </Button>
    );
}