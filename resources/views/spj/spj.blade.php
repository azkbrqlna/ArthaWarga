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

        /* JUDUL */
        .title {
            text-align: center;
            font-size: 18pt;
            font-weight: bold;
            text-decoration: underline;
            margin-top: 0; 
            margin-bottom: 30px; 
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
            font-size: 11pt; 
        }

        /* --- STYLE KOTAK TOTAL --- */
        .total-section {
            margin-top: 20px;
            text-align: right; 
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
        table.footer-table {
            width: 100%;
            margin-top: 30px;
            border-collapse: collapse;
            border: none; 
        }
        .footer-table td {
             border: none !important;
        }
        
        .footer-left { width: 40%; vertical-align: top; }
        
        /* KOREKSI: MENGATUR RATA TENGAH UNTUK SEL TANDA TANGAN */
        .footer-right { 
            width: 60%; 
            vertical-align: top; 
            text-align: center; 
        }

        .signature-block {
            width: 280px; 
            margin-left: auto;
            margin-right: auto;
            text-align: center; 
            display: block; 
        }
    </style>
</head>
<body>

    <div class="container">
        
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
                <!-- Footer Left kosong (tanpa border) -->
                <td class="footer-left"></td> 
                
                <!-- Footer Right (tanpa border) -->
                <td class="footer-right">
                    <div class="signature-block">
                        @php
                            // Set locale ke Bahasa Indonesia untuk pemformatan tanggal
                            \Carbon\Carbon::setLocale('id'); 
                            
                            try {
                                // Asumsi $tanggal datang sebagai 'd/m/Y' dari Controller
                                $formattedDate = \Carbon\Carbon::createFromFormat('d/m/Y', $tanggal)->isoFormat('D MMMM Y');
                            } catch (\Exception $e) {
                                $formattedDate = $tanggal; // Fallback jika format d/m/Y salah
                            }
                        @endphp
                        
                        <p>{{ $kota }}, {{ $formattedDate }}</p>
                        <p>Barang/Jasa sudah diterima dengan baik dan lengkap</p>
                        
                        <div style="margin-top: 60px;"></div> 
                        
                        <p>Penerima,</p>
                        
                        <div style="margin-top: 80px;"></div> 

                        <p>(.............................................)</p>
                    </div>
                </td>
            </tr>
        </table>

    </div>

</body>
</html>