<!DOCTYPE html>
<html>
<head>
    <title>Kuitansi SPJ</title>
    <style>
        /* 1. SETUP HALAMAN */
        @page {
            size: A4 portrait;
            margin: 0;
        }

        /* 2. RESET BODY */
        body {
            margin: 0;
            padding: 0;
            font-family: 'Times New Roman', serif;
            font-size: 11pt;
            line-height: 1.4;
            background-color: #fff;
        }

        /* 3. CONTAINER */
        .container {
            width: 170mm;        
            margin: 20mm auto;   
            box-sizing: border-box; 
            padding: 0;          
            position: relative;
        }

        /* --- HEADER INFO DIHAPUS --- */

        /* JUDUL */
        .title {
            text-align: center;
            font-size: 18pt;
            font-weight: bold;
            text-decoration: underline;
            margin-top: 0;      /* Langsung di atas */
            margin-bottom: 30px; /* Jarak ke tabel */
            letter-spacing: 2px;
            text-transform: uppercase;
            clear: both;
        }

        /* --- TABEL UTAMA --- */
        table.main-table {
            width: 100%;
            border-collapse: collapse;
            border: 1px solid #000; 
            margin-bottom: 10px;
        }
        table.main-table > tbody > tr {
            border-bottom: 1px solid #000; 
        }
        table.main-table > tbody > tr > td {
            vertical-align: top;
            padding: 10px 8px;
        }

        .col-label { width: 140px; font-style: italic; white-space: nowrap; font-weight: bold; }
        .col-sep { width: 15px; text-align: center; }

        /* BOX TERBILANG */
        .terbilang-box {
            background-color: #dce0e6;
            border: 1px solid #000;
            padding: 8px 10px;
            font-weight: bold;
            font-style: italic;
            display: block;
            line-height: 1.3;
        }

        /* --- STYLE KOTAK TOTAL --- */
        .total-section {
            margin-top: 20px;
            text-align: right; /* Rata kanan */
        }
        
        .total-box-inline {
            display: inline-block;
            vertical-align: middle;
            border: 2px solid #000;
            background-color: #dce0e6;
            padding: 8px 15px;
            font-weight: bold;
            font-size: 12pt;
            min-width: 150px;
            text-align: center;
            margin-left: 5px;
        }

        /* FOOTER (TTD) */
        .footer-table {
            width: 100%;
            margin-top: 30px;
            border-collapse: collapse;
        }
        .footer-left { width: 40%; vertical-align: top; }
        .footer-right { width: 60%; vertical-align: top; text-align: right; }

        .signature-block {
            display: inline-block;
            text-align: left;
            width: 280px;
        }
    </style>
</head>
<body>

    <div class="container">
        
        <!-- HEADER NOMOR DIHAPUS SESUAI REQUEST -->

        <!-- JUDUL -->
        <div class="title">KUITANSI</div>

        <!-- TABEL UTAMA -->
        <table class="main-table">
            <tbody>
                <!-- BARIS 1 -->
                <tr>
                    <td class="col-label">Sudah terima dari</td>
                    <td class="col-sep">:</td>
                    <td style="font-weight: bold;">{{ $pemberi }}</td>
                </tr>
                
                <!-- BARIS 2 -->
                <tr>
                    <td class="col-label">Uang sebanyak</td>
                    <td class="col-sep">:</td>
                    <td>
                        <div class="terbilang-box">
                            {{ $terbilang }}
                        </div>
                    </td>
                </tr>
                
                <!-- BARIS 3 (ISI DESKRIPSI + TOTAL) -->
                <tr>
                    <td class="col-label">Guna membayar</td>
                    <td class="col-sep">:</td>
                    <td style="text-align: justify;">
                        <!-- Deskripsi Text -->
                        {{ $deskripsi }}

                        <!-- DAFTAR BARANG DIHAPUS, GANTI LANGSUNG TOTAL -->
                        <div class="total-section">
                            <span style="font-weight: bold; font-size: 11pt; margin-right: 5px;">JUMLAH = </span>
                            <div class="total-box-inline">
                                Rp. {{ number_format($total, 0, ',', '.') }},-
                            </div>
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>

        <!-- FOOTER TTD -->
        <table class="footer-table">
            <tr>
                <td class="footer-left"></td>
                <td class="footer-right">
                    <div class="signature-block">
                        <p>{{ $kota }}, {{ $tanggal }}</p>
                        <p>Barang/Jasa sudah diterima dengan baik dan lengkap</p>
                        <br>
                        <p>Penerima,</p>
                        <br><br><br><br>
                        <p>(.............................................)</p>
                    </div>
                </td>
            </tr>
        </table>

    </div>

</body>
</html>