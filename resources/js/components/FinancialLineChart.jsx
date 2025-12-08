import React from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";

// Format angka sumbu Y menjadi ringkas (Jt/rb) agar tulisan besar & terbaca
const formatCompactNumber = (number) => {
    if (number >= 1000000000) {
        return (number / 1000000000).toFixed(1).replace(/\.0$/, "") + "M";
    }
    if (number >= 1000000) {
        return (number / 1000000).toFixed(1).replace(/\.0$/, "") + "Jt";
    }
    if (number >= 1000) {
        return (number / 1000).toFixed(0) + "rb";
    }
    return number.toString();
};

// Format angka Rupiah lengkap untuk Tooltip (saat disentuh/di-hover)
const formatRupiah = (val) =>
    "Rp " + parseInt(val || 0).toLocaleString("id-ID");

export default function FinancialBarChart({ data }) {
    return (
        <div className="bg-white border rounded-xl p-6 shadow-sm w-full">
            <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-800">
                    Pemasukan vs Pengeluaran
                </h3>
                <p className="text-sm text-gray-500">
                    Perbandingan uang masuk dan keluar per bulan
                </p>
            </div>

            {/* Tinggi container diatur agar batang terlihat proporsional */}
            <div className="h-80 md:h-96 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={data}
                        margin={{
                            top: 20,
                            right: 30,
                            left: 0,
                            bottom: 5,
                        }}
                    >
                        <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false} // Hilangkan garis vertikal agar bersih
                            stroke="#e5e7eb"
                        />
                        <XAxis
                            dataKey="month"
                            stroke="#6b7280"
                            tick={{ fontSize: 12, fill: "#374151" }} // Warna teks lebih gelap
                            tickMargin={10}
                        />
                        <YAxis
                            tickFormatter={formatCompactNumber}
                            stroke="#6b7280"
                            tick={{ fontSize: 12, fill: "#374151" }}
                        />
                        <Tooltip
                            cursor={{ fill: "#f3f4f6" }} // Highlight background saat hover
                            contentStyle={{
                                backgroundColor: "#fff",
                                borderRadius: "8px",
                                border: "1px solid #e5e7eb",
                                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                            }}
                            formatter={(value, name) => [
                                formatRupiah(value),
                                name,
                            ]}
                        />
                        <Legend
                            wrapperStyle={{ paddingTop: "20px" }}
                            iconType="circle" // Ikon legend bulat agar lebih modern
                        />

                        {/* Batang Pemasukan (Hijau) */}
                        <Bar
                            dataKey="pemasukan"
                            name="Pemasukan"
                            fill="#10B981" // Emerald-500
                            radius={[4, 4, 0, 0]} // Sudut atas membulat
                            barSize={30} // Lebar batang fix agar tidak terlalu gemuk/kurus
                        />

                        {/* Batang Pengeluaran (Merah) */}
                        <Bar
                            dataKey="pengeluaran"
                            name="Pengeluaran"
                            fill="#EF4444" // Red-500
                            radius={[4, 4, 0, 0]}
                            barSize={30}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}