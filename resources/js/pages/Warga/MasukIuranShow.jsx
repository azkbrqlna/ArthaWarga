import React from "react";
import { useForm } from "@inertiajs/react";

export default function MasukIuranShow({ iuran }) {
  const { data, setData, post, processing, errors } = useForm({
    id: iuran.id,
    ket: "",
    bkt_byr: null,
    bkt_nota: null,
  });

  const submit = (e) => {
    e.preventDefault();
    post(route("masuk-iuran.store"), { forceFormData: true });
  };

  return (
    <div className="max-w-lg mx-auto bg-white shadow-md p-6 rounded-xl mt-10">
      <h2 className="text-2xl font-bold mb-4">{iuran.pengumuman?.judul}</h2>
      <p className="text-gray-600 mb-4">
        Total Tagihan: <b>Rp {iuran.nominal?.toLocaleString("id-ID")}</b>
      </p>

      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Bukti Bayar</label>
          <input type="file" onChange={(e) => setData("bkt_byr", e.target.files[0])} />
          {errors.bkt_byr && <p className="text-red-500 text-sm">{errors.bkt_byr}</p>}
        </div>



        <button
          type="submit"
          disabled={processing}
          className="bg-blue-600 text-white px-4 py-2 rounded-md"
        >
          {processing ? "Mengirim..." : "Kirim Bukti Pembayaran"}
        </button>
      </form>
    </div>
  );
}
