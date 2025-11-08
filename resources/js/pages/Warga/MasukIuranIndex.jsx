import React from "react";
import { Link } from "@inertiajs/react";
import AppLayout from "@/layouts/AppLayout/AppLayoutMasukIuran";

export default function MasukIuranIndex({ iurans, totalIuran, pendingIuran, paidIuran }) {
  return (    
    <AppLayout title="Daftar Tagihan Iuran">
      <div className="p-8">
        <h1 className="text-center text-4xl font-bold mb-6 ">Daftar Tagihan Iuran</h1>        
        {/* Cards Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Total Iuran */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 shadow-sm">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-lg mr-4">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-blue-600">Total Iuran</p>
                <p className="text-2xl font-bold text-blue-800">{totalIuran}</p>
              </div>
            </div>
          </div>

          {/* Belum Bayar */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 shadow-sm">
            <div className="flex items-center">
              <div className="bg-red-100 p-3 rounded-lg mr-4">
                <svg
                  className="w-6 h-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-red-600">Belum Bayar</p>
                <p className="text-2xl font-bold text-red-800">{pendingIuran}</p>
              </div>
            </div>
          </div>

          {/* Sudah Bayar */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 shadow-sm">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-lg mr-4">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-green-600">Sudah Bayar</p>
                <p className="text-2xl font-bold text-green-800">{paidIuran}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        {iurans.data.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <svg
              className="w-12 h-12 text-gray-400 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="text-gray-500 text-lg">Tidak ada tagihan iuran.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Judul</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {iurans.data.map((iuran) => (
                  <tr key={iuran.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{iuran.tgl}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{iuran.pengumuman?.judul || "-"}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          iuran.status === "approved"
                            ? "bg-green-100 text-green-800"
                            : iuran.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : iuran.status === "tagihan"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {iuran.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {iuran.status === "tagihan" ? (
                        <Link
                          href={route("masuk-iuran.show", iuran.id)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm transition duration-200"
                        >
                          Bayar Sekarang
                        </Link>
                      ) : iuran.status === "pending" ? (
                        <span className="text-yellow-600 text-sm">Menunggu Konfirmasi</span>
                      ) : iuran.status === "approved" ? (
                        <span className="text-green-600 text-sm">✓ Sudah Dikonfirmasi</span>
                      ) : (
                        "-"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {iurans.data.length > 0 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Menampilkan {iurans.from} sampai {iurans.to} dari {iurans.total} iuran
            </div>
            <div className="flex space-x-2">
              {iurans.links.map((link, index) => (
                <Link
                  key={index}
                  href={link.url || "#"}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    link.active
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                  } ${!link.url ? "opacity-50 cursor-not-allowed" : ""}`}
                  dangerouslySetInnerHTML={{ __html: link.label }}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
