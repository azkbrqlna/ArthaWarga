import React from "react";
import { Link } from "@inertiajs/react";
import { ChevronRight } from "lucide-react";

export default function Breadcrumbs({ items = [] }) {
    return (
        <nav
            className="flex items-center text-sm text-gray-600 mb-6"
            aria-label="Breadcrumb"
        >
            {items.map((item, index) => (
                <div key={index} className="flex items-center">
                    {item.href ? (
                        <Link
                            href={item.href}
                            className="hover:text-[#59B5F7] transition-colors"
                        >
                            {item.label}
                        </Link>
                    ) : (
                        <span className="text-gray-800 font-medium">
                            {item.label}
                        </span>
                    )}
                    {index < items.length - 1 && (
                        <ChevronRight className="mx-2 h-4 w-4 text-gray-400" />
                    )}
                </div>
            ))}
        </nav>
    );
}
