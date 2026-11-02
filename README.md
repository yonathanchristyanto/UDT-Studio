# UDT Report Generator v1.0
**Asisten UDT (Uji Disolusi Terbanding) Otomatis — Dari Data HPLC ke Evaluasi Regulasi & Google Sheets**

Aplikasi web modern berbasis klien murni (HTML5, Vanilla JS, CSS3, PDF.js) untuk memproses, memverifikasi, mengkalkulasi, dan mengevaluasi data profil disolusi terbanding dari instrumen HPLC (PDF Sequence Summary Report / CSV) sesuai pedoman resmi **BPOM, FDA, dan EMA**.

---

### ✨ Fitur Utama
1. **Kotak Unggah Terpisah (Dual-Dropzone):**
   - Pemisahan data **Produk Uji (Test Product)** dan **Produk Pembanding (Reference / Inovator)**.
   - Perhitungan profil disolusi produk pembanding otomatis dari file kromatogram tanpa perlu pengetikan manual.
2. **Kaidah Penamaan Fleksibel & Penggabungan BS Otomatis (Auto-Merge):**
   - Mendukung format baku laboratorium: `<Batch> MD <pH> <Waktu>' <Vessel>` atau `<Produk> <Batch> MD <pH> <Waktu>' <Vessel>`.
   - Menggabungkan bracketing standards (`BS Mid` / `BS End`) yang terpencar di file berbeda secara cerdas berdasarkan tanggal dan medium.
3. **Konfirmasi & Pemetaan Larutan Standar:**
   - Deteksi otomatis seluruh set standar per medium pH.
   - Pemetaan fleksibel ke masing-masing batch sampel serta penimbangan bobot WS yang terintegrasi di blok perhitungan.
4. **Evaluasi Otomatis Faktor Kemiripan ($f_2$) Menurut Regulasi (BPOM / FDA / EMA):**
   - **Kaidah Cut-off 85%:** Maksimal 1 titik pengamatan setelah pelepasan mencapai $\ge 85\%$ untuk kedua formulasi.
   - **Kondisi Very Rapid Dissolution:** Profil dinyatakan serupa tanpa perlu uji statistik $f_2$ jika keduanya $\ge 85\%$ pada 15 menit.
   - **Pemeriksaan Batas Variabilitas (% RSD):** Maksimal 20% pada titik awal ($\le 15$ menit) dan maksimal 10% pada titik berikutnya.
   - Visualisasi kurva profil disolusi interaktif (SVG).
5. **Otomatisasi Google Sheets & Sheet Report:**
   - Menghasilkan tab data kalkulasi untuk produk pembanding dan tiap batch produk uji.
   - Pembuatan tab `Report <Batch>` individual untuk tiap batch uji yang dikalkulasi.

---

### 🚀 Cara Menjalankan
Cukup buka file `index.html` atau `UDT report generator v.1.0.html` pada browser modern (Google Chrome, Microsoft Edge, Mozilla Firefox, atau Safari). Tidak memerlukan server backend.
