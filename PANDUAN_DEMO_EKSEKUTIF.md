# PANDUAN DEMO EKSEKUTIF: UDT STUDIO (v1.2)
**Dokumen Strategis & Panduan Skenario Presentasi ke Manajemen / Atasan**
*Analytical Development & Regulatory Quality Control — PT Pharos Indonesia*

---

## 🎯 1. Ringkasan Eksekutif (Executive Summary)

Uji Disolusi Terbanding (UDT) adalah pengujian registrasi kritis yang disyaratkan oleh **Peraturan Badan POM No. 11 Tahun 2022 (tentang Tata Laksana Uji Bioekivalensi)**, **US-FDA**, dan **EMA** untuk membuktikan bioekivalensi produk obat kopi terhadap produk inovator (komparator). 

Selama ini, pengolahan data kromatogram HPLC atau absorbansi UV dilakukan secara **manual di spreadsheet Excel** yang memakan waktu **2 hingga 3 jam per pengujian**, rentan terhadap *human error* (salah ketik area, salah rumus $f_2$, salah memotong titik 85%, atau salah pemetaan larutan standar), serta sulit diaudit kepatuhan integritas datanya (*ALCOA+ principle*).

**UDT Studio** dikembangkan untuk mentransformasi alur kerja ini menjadi otomatisasi murni berbasis peramban (*client-side web app*), memangkas waktu kerja menjadi **kurang dari 90 detik**, dengan evaluasi regulasi otomatis yang ketat, visualisasi interaktif, ekspor PDF resmi siap cetak, serta sinkronisasi langsung ke Google Sheets korporat.

```
+-------------------------------------------------------------------------------+
|                       PERBANDINGAN EFISIENSI KERJA                            |
+-------------------------------------------------------------------------------+
| PARAMETER EVALUASI    | CARA LAMA (EXCEL MANUAL)    | DENGAN UDT STUDIO       |
+-----------------------+-----------------------------+-------------------------+
| Waktu Pengerjaan      | 120 - 180 menit             | < 2 menit               |
| Ekstraksi Data        | Salin-tempel ribuan angka   | Drag & drop (PDF / CSV) |
| Pemetaan Standar & BS | Manual & rawan tertukar     | Auto-detect & merge BS  |
| Penentuan Cut-off 85% | Rawan salah interpretasi    | 100% Otomatis regulatori|
| Uji Kepatuhan % RSD   | Sering terlewat / manual    | Peringatan instan       |
| Pembuatan Laporan     | Format rentan bergeser      | PDF A4 resmi + GSheets  |
+-------------------------------------------------------------------------------+
```

---

## 💼 2. Business Value & Nilai Tambah bagi Perusahaan

1. **Efisiensi Waktu & Produktivitas Laboratorium (>95% Time-Saving):**
   - Dari 12 vessel $\times$ 7 titik waktu $\times$ 4 media $\times$ 2 produk = **672 data titik kromatogram** per proyek UDT lengkap.
   - Pengerjaan selesai dalam hitungan detik tanpa perlu pengetikan manual satu angka pun.
2. **Kepatuhan Regulasi Penuh (BPOM, FDA, EMA):**
   - **Kaidah Cut-off 85%:** Mengikutsertakan maksimal 1 titik waktu setelah kedua produk mencapai pelepasan $\ge 85\%$.
   - **Very Rapid Dissolution:** Otomatis mendeteksi pelepasan $\ge 85\%$ pada menit ke-15, membebaskan kalkulasi $f_2$ sesuai pedoman resmi.
   - **Pemeriksaan Batas Variabilitas (% RSD / Koefisien Variasi):** Sesuai Peraturan BPOM No. 11 Tahun 2022, batas variabilitas ditetapkan $\le 20\%$ pada titik waktu pertama dan $\le 10\%$ pada titik-titik waktu berikutnya.
3. **Kemandirian & Keamanan Data (Zero Server / Pure Client-Side):**
   - Seluruh pemrosesan (pembacaan PDF kromatogram, parsing CSV, kalkulasi matematika, visualisasi SVG, dan cetak PDF) berjalan 100% di browser lokal analis.
   - Data formulasi rahasia perusahaan tidak dikirim ke server pihak ketiga manapun.
4. **Fleksibilitas Instrumen Laboratorium:**
   - Mendukung instrumen **HPLC** (Agilent ChemStation, Waters Empower) dan **Spektrofotometer UV-Vis** (Agilent Cary 60 / Shimadzu).

---

## 🎬 3. Panduan Alur Demo Langkah Demi Langkah (Step-by-Step Script)

Buka aplikasi [index.html](file:///c:/Users/Win%2010/.gemini/antigravity/scratch/udt-assistant/index.html) di Google Chrome atau Microsoft Edge.

### LANGKAH 1: Unggah Data (Dual-Dropzone)
*Pesan Kunci untuk Atasan:* *"Aplikasi memisahkan kotak unggah Produk Uji dan Produk Pembanding sehingga analis tidak akan pernah salah tertukar data."*
1. Tunjukkan kotak kiri **Produk Uji (Test Product)** dan kotak kanan **Produk Pembanding (Reference)**.
2. Tarik dan lepas file CSV atau PDF dari folder paket demo ke masing-masing dropzone.
3. Tunjukkan bahwa sistem langsung membaca nama file, jumlah injeksi, dan mengekstrak metadata instrumen secara otomatis.

### LANGKAH 2: Konfirmasi Standar & Larutan Kalibrasi
*Pesan Kunci untuk Atasan:* *"Sistem memiliki kecerdasan buatan aturan (rule-based intelligence) untuk mengelompokkan 5 standar utama dan menggabungkan bracketing standards (BS Mid dan BS End) secara otomatis walaupun terpencar di beberapa file terpisah."*
1. Klik **Lanjut: Standar**.
2. Tunjukkan kartu per media:
   - Status 5/5 Injeksi Standar Utama (dengan perhitungan rata-rata dan % RSD larutan standar).
   - Status 2/2 Injeksi BS Mid dan 2/2 Injeksi BS End.
   - Tunjukkan input bobot penimbangan WS (mg) yang terintegrasi.

### LANGKAH 3: Kondisi Disolusi & Parameter Uji
*Pesan Kunci untuk Atasan:* *"Parameter otomatis terisi dari metadata kromatogram, namun analis tetap memiliki fleksibilitas penuh untuk menyesuaikan kondisi lab."*
1. Klik **Lanjut: Parameter**.
2. Tunjukkan parameter produk uji vs pembanding (Kadar Klaim Label LC, Volume Media, Labu Pengenceran, Faktor Pengenceran Sampel, % Kemurnian Baku WS).
3. Tunjukkan dropdown otomatis aparatus (Paddle, Basket), RPM, instrumen (HPLC / UV Cary 60), serta nama analis.

### LANGKAH 4: Hasil & Evaluasi Regulasi (The "Wow" Moment)
*Pesan Kunci untuk Atasan:* *"Ini adalah inti inovasi: kalkulasi instan % terlarut per vessel, kurva profil pelepasan interaktif mulai dari origin (0,0), dan evaluasi regulasi resmi (BPOM/FDA/EMA) dengan badge visual yang tegas."*
1. Klik **Lanjut: Hasil & Kurva**.
2. Tunjukkan:
   - **Tabel Profil Disolusi:** Data 12 vessel per titik waktu lengkap dengan Rata-rata, Standar Deviasi (SD), dan % RSD.
   - **Kurva Disolusi Interaktif:** Garis biru/hijau solid untuk Produk Uji vs garis abu-abu/kuning putus-putus untuk Komparator, dilengkapi titik penanda dan koordinat tooltip interaktif.
   - **Kotak Evaluasi $f_2$:** Skor faktor kemiripan, jumlah titik $n$ yang valid, status cut-off 85%, dan status regulasi (Similar / Not Similar / Very Rapid).
3. Klik tombol **Unduh Laporan (PDF)** untuk mendemonstrasikan dokumen laporan A4 resmi siap tanda tangan.

### LANGKAH 5: Otomatisasi Google Sheets Terintegrasi
*Pesan Kunci untuk Atasan:* *"Hasil tidak hanya berhenti di PDF, melainkan langsung ditulis ke ekosistem spreadsheet master korporat PT Pharos Indonesia secara terstruktur dan terotomatisasi."*
1. Tunjukkan 3 tombol ekspor:
   - **Salin & Tulis Master Calculation:** Membuat spreadsheet perhitungan lengkap per batch.
   - **Buat Tab Report:** Menambahkan tab laporan resmi dan rumus formula live $f_2$.
   - **Kirim ke Master Summary:** Menghubungkan ke rekapitulasi master portofolio disolusi.
2. Tunjukkan progress bar modern berwarna gradien yang mengalir mulus dengan status persentase dan warna hijau saat selesai.

---

## 🧪 4. Empat Skenario Demo Siap Pakai (Demo Scenarios)

Seluruh dataset telah dibuat dan tersimpan rapi pada direktori:  
`sample-data/demo-package/`

---

### SKENARIO 1: Multi-Media Komprehensif (Similar & Very Rapid 15')
- **Folder:** `sample-data/demo-package/01_Empagliflozin_HPLC_Similar_and_VeryRapid/`
- **File Test:** `csv/Empagliflozin_Test_AllMedia_4Media.csv` (atau `pdf/`)
- **File Ref:** `csv/Jardiance_Ref_AllMedia_4Media.csv` (atau `pdf/`)
- **Tujuan Pembuktian:**
  - Menunjukkan kemampuan memproses **4 media disolusi sekaligus** dalam 1 kali unggah (pH 1.2, pH 4.5, pH 6.8, dan Purified Water).
  - **Hasil pH 1.2:** **Similar (Very Rapid $\ge 85\%$ @ 15')**. Kedua produk terdisolusi $>85\%$ pada menit ke-15 (Ref: 92.6%, Uji: 92.2%). Sistem memunculkan catatan regulasi: *"Kurva disolusi dianggap similar tanpa perlu evaluasi statistik f2 sesuai pedoman FDA/EMA/BPOM."*
  - **Hasil pH 4.5, 6.8, Air:** **Similar ($f_2 \approx 70 - 75$)**. Pelepasan bertahap, cut-off titik 85% bekerja sempurna.

---

### SKENARIO 2: Formulasi Prototype Gagal (NOT SIMILAR / $f_2 < 50$)
- **Folder:** `sample-data/demo-package/02_Candesartan_HPLC_NotSimilar/`
- **File Test:** `csv/Candesartan_Test_pH_6.8_NotSimilar.csv`
- **File Ref:** `csv/Blopress_Ref_pH_6.8.csv`
- **Tujuan Pembuktian:**
  - Membuktikan kepada atasan bahwa sistem **tidak bias** dan **objektif**. Bila formulasi uji R&D mengalami pelepasan lambat (*dissolution lag*), sistem langsung mendeteksi ketidakmiripan.
  - **Hasil:** **NOT SIMILAR ($f_2 = 31.15 < 50$)**.
  - Badge peringatan oranye/merah muncul dengan jelas, kurva grafik memperlihatkan deviasi nyata di mana Candesartan Uji tertinggal jauh di bawah Blopress Inovator.

---

### SKENARIO 3: Fleksibilitas Instrumen Spektrofotometer UV-Vis (Agilent Cary 60)
- **Folder:** `sample-data/demo-package/03_Metformin_UV_Cary60_Rapid/`
- **File Test:** `csv/Metformin_Test_pH_6.8_Cary60.csv` (atau `pdf/Metformin_Test_pH_6.8_Cary60.pdf`)
- **File Ref:** `csv/Glucophage_Ref_pH_6.8_Cary60.csv` (atau `pdf/Glucophage_Ref_pH_6.8_Cary60.pdf`)
- **Tujuan Pembuktian:**
  - Menunjukkan fleksibilitas laboratorium: zat aktif dengan absorbansi UV kuat (seperti Metformin HCl) tidak perlu HPLC mahal, melainkan langsung menggunakan laporan **Advanced Reads Report Cary 60**.
  - Sistem otomatis membaca kolom absorbansi (*Sample Readings*) dan mengevaluasi profil disolusi secara instan.
  - **Hasil:** **Similar (Very Rapid / Rapid Dissolution)**.

---

### SKENARIO 4: Pengawasan Mutu & Audit Regulasi (High % RSD Warning)
- **Folder:** `sample-data/demo-package/04_Atorvastatin_HPLC_HighRSD_Warning/`
- **File Test:** `csv/Atorvastatin_Test_pH_4.5_HighRSD.csv`
- **File Ref:** `csv/Lipitor_Ref_pH_4.5.csv`
- **Tujuan Pembuktian:**
  - Menunjukkan fitur **Regulatory Compliance Guardrail**.
  - Lampiran Peraturan BPOM No. 11 Tahun 2022 (dan pedoman FDA/EMA) mensyaratkan % RSD antar-vessel $\le 20\%$ pada titik waktu pertama dan $\le 10\%$ pada titik-titik waktu berikutnya agar evaluasi $f_2$ sah secara statistik.
  - Pada sampel uji Atorvastatin ini, variasi vessel menit ke-5 mencapai **26.4% (> 20%)** dan menit ke-20 mencapai **10.6% (> 10%)**.
  - **Hasil:** Meskipun rata-ratanya menghasilkan nilai $f_2 \approx 56$, sistem **secara cerdas memunculkan peringatan:**  
    `Peringatan: Variabilitas (% RSD) melebihi batas regulasi pada menit 5' (Limit 20%: Ref 3.2%, Uji 26.4%) dan menit 20' (Limit 10%: Ref 0.9%, Uji 10.6%)`.
  - Poin ini membuktikan kepada manajemen QA bahwa aplikasi melindungi perusahaan dari risiko penolakan registrasi oleh Badan POM akibat data yang tidak memenuhi kriteria validitas statistik.

---

## ❓ 5. Panduan Menjawab Pertanyaan Kritis Atasan (Q&A Cheat Sheet)

**T1: Apakah aplikasi ini aman dari kebocoran formula rahasia?**
> *Jawaban:* Sangat aman. UDT Studio adalah aplikasi murni berbasis klien (HTML5 & Vanilla JavaScript). Seluruh kalkulasi, parsing file, dan rendering grafik berjalan di memori browser komputer analis tanpa ada server penampung di luar.

**T2: Apakah rumus perhitungan $f_2$ dan cut-off nya sudah sesuai Farmakope dan Pedoman BPOM?**
> *Jawaban:* Ya, 100% patuh pada Peraturan BPOM No. 11 Tahun 2022, FDA Guidance for Industry (Dissolution Testing of Immediate Release Solid Oral Dosage Forms), dan EMA Guideline. Menggunakan rumus logaritmik baku $f_2 = 50 \cdot \log_{10} \left[ \left(1 + \frac{1}{n} \sum (R_t - T_t)^2 \right)^{-0.5} \cdot 100 \right]$, kaidah batas 85% titik ke-1, pembebasan uji untuk Very Rapid Dissolution ($\ge 85\%$ pada 15 menit), serta batas koefisien variasi (% CV) maksimal 20% pada titik waktu pertama dan maksimal 10% pada titik kedua hingga akhir.

**T3: Apakah analis harus menginstall software atau server khusus?**
> *Jawaban:* Tidak perlu instalasi server atau software berbayar. Cukup klik ganda file `index.html` pada browser modern apa saja (Google Chrome, Microsoft Edge, Safari, Firefox).

**T4: Bagaimana jika ada file kromatogram yang standar atau bracketing-nya terpisah di run yang berbeda?**
> *Jawaban:* UDT Studio dilengkapi algoritma *Auto-Merge Bracketing Standards*. File bracketing yang diunggah terpisah akan otomatis diikat ke kelompok medium dan tanggal uji yang sesuai untuk melengkapi kuota 5 Standar, 2 BS Mid, dan 2 BS End.

---

*Disiapkan untuk Tim Analytical Development & Regulatory Affairs — PT Pharos Indonesia*
