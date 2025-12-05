<!DOCTYPE html>
<html>
<head>
    <title>Laporan SPJ Kegiatan: {{ $kegiatan->nm_keg }}</title>
    <style>
        @page {
            size: A4 portrait;
            margin: 20mm;
        }
        body {
            font-family: 'Times New Roman', serif;
            font-size: 11pt;
            line-height: 1.5;
            color: #333;
        }
        h1, h2 {
            margin-top: 20px;
            margin-bottom: 10px;
        }
        h1 { font-size: 18pt; text-align: center; }
        h2 { font-size: 14pt; border-bottom: 2px solid #000; padding-bottom: 5px; margin-top: 30px; }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        table, th, td {
            border: 1px solid #000;
        }
        th, td {
            padding: 8px;
            vertical-align: top;
        }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .no-border, .no-border td, .no-border th {
            border: none;
        }
        .page-break {
            page-break-after: always;
        }
        /* Style untuk penempatan gambar yang stabil (inline-block) */
        .img-container {
            width: 100%; 
            margin: 20px 0;
            text-align: center;
            height: 350px; /* Tinggi kontainer untuk stabilitas tata letak */
        }
        .img-box {
            width: 48%;
            height: 300px; /* Tinggi tetap untuk stabilitas */
            border: 1px solid #ccc;
            padding: 5px;
            box-sizing: border-box;
            display: inline-block; 
            margin: 5px;
            vertical-align: top;
            overflow: hidden;
        }
        /* Style untuk gambar di dalam box */
        .img-box img {
            width: 100%;
            height: 100%;
            object-fit: cover; /* Memastikan gambar mengisi box tanpa distorsi */
        }
    </style>
</head>
<body>

    <!-- HALAMAN 1: COVER/JUDUL -->
    <div class="text-center" style="margin-top: 100px;">
        <h1 style="font-size: 24pt;">LAPORAN PERTANGGUNGJAWABAN (SPJ)</h1>
        <h1 style="font-size: 20pt; margin-top: 30px; text-transform: uppercase;">{{ $kegiatan->nm_keg }}</h1>
        <p style="margin-top: 50px;">Periode: {{ $tgl_mulai }} s/d {{ $tgl_selesai }}</p>
    </div>

    <!-- Halaman Baru -->
    <div class="page-break"></div>

    <!-- ======================================================= -->
    <!-- 1. INFORMASI UMUM KEGIATAN -->
    <!-- ======================================================= -->
    <h2>1. INFORMASI UMUM KEGIATAN</h2>
    <table class="no-border">
        <tr><td style="width: 30%;">Nama Kegiatan</td><td style="width: 5%;">:</td><td>{{ $kegiatan->nm_keg }}</td></tr>
        <tr><td>Kategori Kegiatan</td><td style="width: 5%;">:</td><td>{{ $kegiatan->kategori }}</td></tr>
        <tr><td>Waktu Pelaksanaan</td><td style="width: 5%;">:</td><td>{{ $tgl_mulai }} s/d {{ $tgl_selesai }}</td></tr>
        <tr><td>Lokasi/Tempat</td><td style="width: 5%;">:</td><td>{{ $kegiatan->lokasi ?? 'T/A' }}</td></tr> 
        <tr><td>Penanggung Jawab (PJ)</td><td style="width: 5%;">:</td><td>{{ $kegiatan->pj_keg }}</td></tr>
        <tr><td>Sumber Dana</td><td style="width: 5%;">:</td><td>{{ $sumber_dana }}</td></tr>
        <tr><td>Tujuan Kegiatan</td><td style="width: 5%;">:</td><td>{{ $kegiatan->rincian_kegiatan }}</td></tr>
    </table>

    <!-- ======================================================= -->
    <!-- 2. REKAPITULASI ANGGARAN -->
    <!-- ======================================================= -->
    <h2>2. REKAPITULASI ANGGARAN</h2>
    <table>
        <thead>
            <tr><th style="width: 70%;" class="text-left">Uraian</th><th class="text-right">Jumlah (Rp)</th></tr>
        </thead>
        <tbody>
            <tr><td>**Dana Awal yang Dialokasikan**</td><td class="text-right">**{{ number_format($jumlahAwal, 0, ',', '.') }},-**</td></tr>
            <tr><td>Total Pengeluaran Kegiatan</td><td class="text-right">{{ number_format($totalPengeluaran, 0, ',', '.') }},-</td></tr>
            <tr style="background-color: #f0f0f0;"><td>**Sisa Dana / Saldo Akhir**</td><td class="text-right">**{{ number_format($jumlahSekarang, 0, ',', '.') }},-**</td></tr>
            <tr><td colspan="2">*Status: {{ $status_sisa_dana }}*</td></tr>
        </tbody>
    </table>

    <!-- ======================================================= -->
    <!-- 3. RINCIAN PENGELUARAN DAN BUKTI TRANSAKSI (Tabel Detail) -->
    <!-- ======================================================= -->
    <h2>3. RINCIAN PENGELUARAN DAN BUKTI TRANSAKSI</h2>
    <table>
        <thead>
            <tr>
                <th style="width: 5%;">No.</th>
                <th style="width: 15%;">Tanggal</th>
                <th style="width: 30%;">Uraian / Keterangan Belanja</th>
                <th style="width: 20%;">Toko / Vendor</th>
                <th style="width: 15%;">Jumlah (Rp)</th>
                <th style="width: 15%;">Bukti (ID Referensi)</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($pengeluaran as $item)
                <tr>
                    <td class="text-center">{{ $loop->iteration }}</td>
                    <td>{{ $item->tgl_formatted }}</td> <!-- Menggunakan tgl_formatted dari Controller -->
                    <td>{{ $item->ket }}</td>
                    <td>{{ $item->toko ?? '-' }}</td> 
                    <td class="text-right">{{ number_format($item->nominal, 0, ',', '.') }},-</td>
                    <td class="text-center">{{ $item->bukti_id }}</td>
                </tr>
            @endforeach
        </tbody>
        <tfoot>
            <tr style="background-color: #e0e0e0;">
                <td colspan="4" class="text-right">**TOTAL PENGELUARAN**</td>
                <td class="text-right">**{{ number_format($totalPengeluaran, 0, ',', '.') }},-**</td>
                <td></td>
            </tr>
        </tfoot>
    </table>

    <!-- ======================================================= -->
    <!-- 4. DOKUMENTASI KEGIATAN -->
    <!-- ======================================================= -->
    <div class="page-break"></div>
    <h2>4. DOKUMENTASI KEGIATAN</h2>
    <p>Lampiran visual ini membuktikan kegiatan telah dilaksanakan sesuai rencana:</p>
    
    <!-- ✅ KOREKSI GAMBAR: IMPLEMENTASI BASE64 -->
    <div class="img-container">
        <!-- GAMBAR 1 (Gambar Dinamis dari Database) -->
        <div class="img-box" style="margin-right: 4%;">
            @if ($dokumentasiBase64)
                <img src="{{ $dokumentasiBase64 }}" alt="Dokumentasi Kegiatan">
            @else
                <p style="padding-top: 100px; color: #999;">Gambar Dokumentasi Gagal Dimuat</p>
            @endif
        </div>
        <!-- GAMBAR 2 (Placeholder Statis) -->
        <div class="img-box">
            @if ($placeholderBase64)
                <img src="{{ $placeholderBase64 }}" alt="Placeholder Peserta">
            @else
                 <p style="padding-top: 100px; color: #999;">Placeholder Gagal Dimuat</p>
            @endif
        </div>
    </div>
    <p style="margin-top: 10px; text-align: center;">Gambar 1. Suasana Pelaksanaan Utama dan Kehadiran Peserta.</p>

    <!-- ======================================================= -->
    <!-- 5. LEMBAR PENGESAHAN -->
    <!-- ======================================================= -->
    <div class="page-break"></div>
    <h2>5. LEMBAR PENGESAHAN</h2>

    <div style="text-align: right; margin-bottom: 50px;">
        {{ $kegiatan->kota }}, {{ $tgl_selesai_laporan }}
    </div>

    <table class="no-border" style="width: 90%; margin: 0 auto;">
        <thead>
            <tr class="text-center">
                <th style="width: 33%;">Disusun Oleh:</th>
                <th style="width: 33%;">Diperiksa Oleh:</th>
                <th style="width: 33%;">Disetujui Oleh:</th>
            </tr>
            <tr class="text-center">
                <th>**Bendahara Kegiatan**</th>
                <th>**Penanggung Jawab Kegiatan**</th>
                <th>**Kepala Lembaga/RT**</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td class="text-center" style="height: 100px;">
                    <p style="margin-top: 70px;">( ..................................... )</p>
                </td>
                <td class="text-center" style="height: 100px;">
                    <p style="margin-top: 70px;">( ..................................... )</p>
                </td>
                <td class="text-center" style="height: 100px;">
                    <p style="margin-top: 70px;">( ..................................... )</p>
                </td>
            </tr>
        </tbody>
    </table>
    <p style="margin-top: 50px; text-align: center; font-size: 10pt;">
        *Laporan ini dibuat sebagai bentuk pertanggungjawaban atas penggunaan dana kegiatan.*
    </p>

    <!-- Halaman Baru sebelum Lampiran Kuitansi Pertama -->
    <div class="page-break"></div>

    <!-- ======================================================= -->
    <!-- LAMPIRAN BUKTI KUITANSI (LOOPING) -->
    <!-- ======================================================= -->
    <h2 style="text-align: center;">LAMPIRAN BUKTI KUITANSI</h2>
    
    @foreach ($pengeluaran as $item)
        @if (!$loop->first)
            <div class="page-break"></div> 
        @endif

        <h3 style="text-align: center; font-size: 12pt; margin-top: 50px;">Bukti Kuitansi No. {{ $loop->iteration }} ({{ $item->bukti_id }})</h3>

        {{-- MEMANGGIL TEMPLATE KUITANSI TUNGGAL (File views/spj/spj.blade.php Anda) --}}
        @include('spj.spj', [
            'pemberi' => $item->pemberi ?? 'Sdr. BENDUM (Bendahara Umum)', 
            'terbilang' => $item->terbilang ?? 'Nilai Terbilang Tidak Disediakan', 
            'deskripsi' => $item->ket,
            'total' => $item->nominal, // Menggunakan kolom nominal
            'kota' => $kegiatan->kota,
            'tanggal' => $item->tgl_formatted, // Menggunakan tanggal yang sudah diformat
        ])
    @endforeach

</body>
</html>