import React, { useState, useMemo } from "react";
import { usePage } from "@inertiajs/react";
import AppLayout from "@/layouts/AppLayout/AppLayoutMasukIuran";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { CalendarDays, CreditCard, ClipboardList } from "lucide-react";

export default function MasukIuran() {
  // Kode ini sudah benar. Ia mengharapkan 'iuran' sebagai array.
  const { iuran = [], auth } = usePage().props;

  const [sortField, setSortField] = useState("tanggal");
  const [sortOrder, setSortOrder] = useState("asc");

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  // Kode ini mengharapkan 'iuran' sebagai array.
  const sortedData = useMemo(() => {
    return [...iuran].sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];
      if (typeof valA === "string") {
        return sortOrder === "asc"
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      }
      return sortOrder === "asc" ? valA - valB : valB - valA;
    });
  }, [iuran, sortField, sortOrder]);

  // Semua kalkulasi ini mengharapkan 'iuran' sebagai array.
  const totalIuran = iuran.length;
  const belumLunas = iuran.filter((x) => x.status === "Belum Lunas").length;
  const totalNominal = iuran.reduce((sum, x) => sum + parseInt(x.harga_tagihan), 0);

  const formatRupiah = (val) =>
    "Rp " + parseInt(val || 0).toLocaleString("id-ID");
  

  return (
    <AppLayout>
      <div className="p-6 md:p-10">
        {/* TITLE */}
        <h1 className="text-center text-3xl font-bold text-gray-900 mb-8">
          Iuran RT anda
        </h1>

        {/* RINGKASAN */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <div className="border rounded-xl p-5 flex items-center gap-4 bg-white shadow-sm">
            <ClipboardList className="text-gray-700" />
            <div>
              <p className="text-sm text-gray-500">Total iuran</p>
              <p className="text-xl font-semibold">{totalIuran}</p>
            </div>
          </div>

          <div className="border rounded-xl p-5 flex items-center gap-4 bg-white shadow-sm">
            <CreditCard className="text-gray-700" />
            <div>
              <p className="text-sm text-gray-500">Iuran yang perlu dibayar</p>
              <p className="text-xl font-semibold">{belumLunas}</p>
            </div>
          </div>

          <div className="border rounded-xl p-5 flex items-center gap-4 bg-white shadow-sm">
            <CalendarDays className="text-gray-700" />
            <div>
              <p className="text-sm text-gray-500">Total iuran</p>
              <p className="text-xl font-semibold">{formatRupiah(totalNominal)}</p>
            </div>
          </div>
        </div>

        {/* FILTER BULAN */}
        <div className="flex justify-end mb-4">
          <Select>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="MM/YY" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10/2025">10/2025</SelectItem>
              <SelectItem value="11/2025">11/2025</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* TABEL IURAN */}
        <div className="rounded-xl border overflow-hidden bg-white shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>No</TableHead>
                <TableHead onClick={() => toggleSort("nama")} className="cursor-pointer">
                  Nama
                </TableHead>
                <TableHead onClick={() => toggleSort("harga_tagihan")} className="cursor-pointer">
                  Harga Tagihan
                </TableHead>
                <TableHead onClick={() => toggleSort("tanggal")} className="cursor-pointer">
                  Tanggal
                </TableHead>
                <TableHead onClick={() => toggleSort("status")} className="cursor-pointer">
                  Status
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {sortedData.length > 0 ? (
                sortedData.map((item, i) => (
                  <TableRow key={i}>
                    <TableCell>{i + 1}</TableCell>
                    <TableCell>{item.nama}</TableCell>
                    <TableCell>{formatRupiah(item.harga_tagihan)}</TableCell>
                    <TableCell>{item.tanggal}</TableCell>
                    <TableCell>
                      {item.status === "Lunas" ? (
                        <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50">
                          Lunas
                        </Badge>
                      ) : (
                        <Badge className="bg-amber-50 text-amber-700 hover:bg-amber-50">
                          Belum Lunas
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-gray-500 py-6">
                    Tidak ada data iuran
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </AppLayout>
  );
}