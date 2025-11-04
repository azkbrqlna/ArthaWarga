// import React from "react";
// import { router } from "@inertiajs/react";
// import AppLayout from "@/layouts/AppLayout";
// import { Button } from "@/components/ui/button";

// export default function Dashboard() {
//     return (
//         <AppLayout>
//             <div className="flex flex-col md:flex-row justify-between items-start md:items-center w-full bg-white pl-0 pr-8 pb-10 md:pr-12 md:pb-12">
//                 <h1 className="text-2xl md:text-3xl font-semibold text-gray-800">
//                     <span className="font-bold text-gray-900">ArthaWarga</span>{" "}
//                     DASHBOARD
//                 </h1>

//                 {/* Tombol Aksi */}
//                 <div className="flex gap-2 mt-4 md:mt-0">
//                     <Button
//                         className="bg-blue-500 hover:bg-blue-600 text-white text-xs md:text-sm px-3 md:px-4 py-2 rounded-md"
//                         onClick={() => router.visit("/kegiatan/tambah")}
//                     >
//                         Tambah Kegiatan
//                     </Button>
//                     <Button
//                         className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs md:text-sm px-3 md:px-4 py-2 rounded-md"
//                         onClick={() => router.visit("/ringkasan/pemasukan")}
//                     >
//                         Tambah Pemasukan
//                     </Button>
//                     <Button
//                         className="bg-red-500 hover:bg-red-600 text-white text-xs md:text-sm px-3 md:px-4 py-2 rounded-md"
//                         onClick={() => router.visit("/ringkasan/pemasukan")}
//                     >
//                         Tambah Pengeluaran
//                     </Button>
//                 </div>
//             </div>
//         </AppLayout>
//     );
// }
