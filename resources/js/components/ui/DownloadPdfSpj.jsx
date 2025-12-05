import React from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export default function DownloadPdfSpj({ id }) {
    const handleDownload = () => {
        const url = route("spj.download", { id });

        window.location.href = url;
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