# UDT Studio (v1.2)
**Studio Uji Disolusi Terbanding (UDT) Otomatis — Dari Data HPLC/UV ke Evaluasi Regulasi, Ekspor PDF & Google Sheets**

Aplikasi web modern berbasis klien murni (HTML5, Vanilla JS, CSS3, PDF.js, jsPDF) untuk memproses, memverifikasi, mengkalkulasi, dan mengevaluasi data profil disolusi terbanding dari instrumen HPLC (PDF Sequence Summary Report / CSV) sesuai pedoman resmi **BPOM, FDA, dan EMA**.

---

### ✨ Fitur Utama
1. **Kotak Unggah Terpisah (Dual-Dropzone):**
   - Pemisahan data **Produk Uji (Test Product)** dan **Produk Pembanding (Reference / Inovator)**.
   - Perhitungan profil disolusi produk pembanding otomatis dari file kromatogram tanpa perlu pengetikan manual.
   - Deteksi otomatis baris data CSV (mulai baris ke-11) dan ekstraksi metadata kromatografi (operator, kolom, serial, senyawa, tanggal pengujian).
2. **Kaidah Penamaan Fleksibel & Penggabungan BS Otomatis (Auto-Merge):**
   - Mendukung format baku laboratorium: `<Batch> MD <pH> <Waktu>' <Vessel>` atau `<Produk> <Batch> MD <pH> <Waktu>' <Vessel>`.
   - Menggabungkan bracketing standards (`BS Mid` / `BS End`) yang terpencar di file berbeda secara cerdas berdasarkan tanggal dan medium.
3. **Konfirmasi & Pemetaan Larutan Standar & Kondisi Disolusi:**
   - Deteksi otomatis seluruh set standar per medium pH.
   - Pemetaan fleksibel ke masing-masing batch sampel serta penimbangan bobot WS yang terintegrasi di blok perhitungan.
   - Deteksi otomatis nomor batch dan zat aktif (API).
   - Penyesuaian kondisi disolusi: jenis media (dropdown + manual), aparatus (Paddle, Basket, Flow-Through Cell), rotasi RPM, instrumen (HPLC / Spektrofotometer UV), dan *Method Reference* (ditulis ke sel E15 tab Report).
4. **Evaluasi Otomatis Faktor Kemiripan ($f_2$) Menurut Regulasi (BPOM / FDA / EMA):**
   - **Kaidah Cut-off 85%:** Maksimal 1 titik pengamatan setelah pelepasan mencapai $\ge 85\%$ untuk kedua formulasi.
   - **Kondisi Very Rapid Dissolution:** Profil dinyatakan serupa tanpa perlu uji statistik $f_2$ jika keduanya $\ge 85\%$ pada 15 menit.
   - **Pemeriksaan Batas Variabilitas (% RSD):** Maksimal 20% pada titik awal ($\le 15$ menit) dan maksimal 10% pada titik berikutnya.
   - Visualisasi kurva profil disolusi interaktif (SVG) mulai dari titik origin $(0, 0)$.
5. **Ekspor Laporan PDF Langsung:**
   - Tombol **Unduh Laporan (PDF)** menghasilkan dokumen A4 siap cetak memuat identitas pengujian, tabel % terlarut per vessel, nilai statistik (Rata-rata, SD, % RSD), dan kotak evaluasi $f_2$ beserta catatan cutoff regulasi.
6. **Otomatisasi Google Sheets (Calculation, Report, Summary):**
   - **Calculation:** Membuat spreadsheet berisi tab kalkulasi untuk produk pembanding dan tiap batch produk uji dengan penamaan `<Nama Produk> <Nomor Batch>`.
   - **Report:** Menambahkan tab `Report` ke spreadsheet hasil kalkulasi, memetakan % terlarut aktif, rumus sum kuadrat $f_2$, nilai $n$, dan referensi metode (sel E15).
   - **Summary:** Memindahkan data ke spreadsheet Master Summary per kelompok tanggal pengujian dan batch secara terstruktur.
   - Pilihan folder Google Drive untuk lokasi penyimpanan hasil.

---

### 🚀 Cara Menjalankan
Cukup buka file `index.html` pada browser modern (Google Chrome, Microsoft Edge, Mozilla Firefox, atau Safari). Tidak memerlukan server backend.
