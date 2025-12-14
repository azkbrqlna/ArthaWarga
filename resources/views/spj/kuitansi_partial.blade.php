<style>
    /* === SATU-SATUNYA KOTAK BESAR KUITANSI === */
    .kuitansi-outer {
        width: 95%;
        margin: 0 auto;
        border: 1px solid #000;
        padding: 10px;
        box-sizing: border-box;
        background-color: #fff;
        font-family: 'Times New Roman', serif;
        font-size: 10pt;
    }

    /* --- WRAPPER ISI (TANPA BORDER) --- */
    .kuitansi-box {
        width: 100%;
        margin: 0 auto;
        box-sizing: border-box;
        padding: 0;
    }

    /* --- HEADER --- */
    .k-header {
        text-align: center;
        margin-bottom: 15px;
    }

    .k-title {
        font-size: 12pt;
        font-weight: bold;
        text-transform: uppercase;
        text-decoration: underline;
    }

    /* --- TABEL DATA UTAMA --- */
    table.k-table {
        width: 100%;
        border-collapse: collapse;
        border: 1px solid #000;
        margin-bottom: 15px;
    }

    table.k-table tr {
        border-bottom: 1px solid #000;
    }

    table.k-table tr:last-child {
        border-bottom: none;
    }

    table.k-table td {
        vertical-align: top;
        /* KOREKSI 1: Kurangi padding TD */
        padding: 2px;
        font-size: 9.5pt;
    }

    /* Kolom */
    .col-label {
        /* KOREKSI 2: Kurangi lebar kolom label */
        width: 25%;
        font-weight: bold;
        font-style: italic;
        font-size: 8.5pt;
        white-space: nowrap;
    }

    .col-sep {
        /* KOREKSI 2: Kurangi lebar kolom pemisah */
        width: 1%;
        text-align: center;
    }

    .col-val {
        /* KOREKSI 2: Lebar kolom nilai disisakan */
        width: 74%;
        /* KOREKSI 3: Hapus padding kiri berlebih */
        padding-left: 0;
    }

    /* --- TERBILANG --- */
    .box-terbilang {
        background-color: #e0e0e0;
        border: 1px solid #000;
        padding: 5px 8px;
        font-style: italic;
        font-weight: bold;
        font-size:8pt;
        /* Width 95% agar ada sedikit padding dari parent */
        width: 92%;
        display: block;
    }

    /* --- DESKRIPSI & TOTAL --- */
    .desc-container {
        min-height: 25px;
        margin-bottom: 5px;
    }

    table.total-table {
        float: right;
        border-collapse: collapse;
        margin-top: 5px;
    }

    .label-jumlah {
        font-weight: bold;
        padding-right: 8px;
        font-size: 10pt;
        white-space: nowrap;
    }

    .box-total-final {
        background-color: #e0e0e0;
        border: 2px solid #000;
        padding: 6px 14px;
        font-weight: bold;
        min-width: 130px;
        text-align: center;
        display: inline-block;
    }

    /* --- TANDA TANGAN --- */
    .area-ttd {
        margin-top: 10px;
        width: 100%;
    }

    .ttd-kanan {
        float: right;
        width: 50%;
        text-align: center;
        font-size: 9pt;
    }

    .clearfix::after {
        content: "";
        clear: both;
        display: table;
    }
</style>

<div class="kuitansi-outer">
    <div class="kuitansi-box">

        <div class="k-header">
            <span class="k-title">
                {{ Str::limit($kuitansi['pemberi'], 40) ? 'KUITANSI' : 'KUITANSI' }}
            </span>
        </div>

        <table class="k-table">
            <tr>
                <td class="col-label">Sudah terima dari</td>
                <td class="col-sep">:</td>
                <td class="col-val">
                    <b>{{ Str::limit($kuitansi['pemberi'], 40) }}</b>
                </td>
            </tr>

            <tr>
                <td class="col-label">Uang sebanyak</td>
                <td class="col-sep">:</td>
                <td class="col-val">
                    <div class="box-terbilang">
                        {{ $kuitansi['terbilang'] }}
                    </div>
                </td>
            </tr>

            <tr>
                <td class="col-label">Guna membayar</td>
                <td class="col-sep">:</td>
                <td class="col-val">
                    <div class="desc-container">
                        {{ $kuitansi['deskripsi'] }}
                    </div>

                    <table class="total-table">
                        <tr>
                            <td class="label-jumlah">JUMLAH =</td>
                            <td>
                                <div class="box-total-final">
                                    Rp. {{ number_format($kuitansi['total'], 0, ',', '.') }},-
                                </div>
                            </td>
                        </tr>
                    </table>

                    <div style="clear: both;"></div>
                </td>
            </tr>
        </table>

        <div class="area-ttd clearfix">
            <div class="ttd-kanan">
                <p style="margin: 0 0 8px 0;">
                    {{ $kuitansi['kota'] }}, {{ $kuitansi['tanggal'] }}
                </p>

                <p style="margin: 0 0 20px 0;">
                    Barang/Jasa sudah diterima dengan baik<br>
                    dan lengkap
                </p>

                <p>Penerima,</p>

                <p
                    style="
                        margin-top: 40px;
                        font-weight: bold;
                        display: inline-block;
                        padding: 0 10px 2px 10px;
                    "
                >
                    {{ Str::limit($kuitansi['penerima_ttd'], 30, '...') }}
                </p>
            </div>
        </div>

    </div>
</div>
