| ![Logo PT Pharos Indonesia](/C:/Users/Win%2010/.gemini/antigravity/brain/f11548dc-6320-4dc1-8f8a-153bf1f35b69/pharos_logo.png) | **PT. PHAROS INDONESIA** | | | | |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Nomor Protap** | : **P-AD-949-00** | | | | |
| **Judul Protap** | : **Pengoperasian, Verifikasi Data, dan Pemeliharaan Aplikasi UDT Studio** | | | | |
| **Tanggal Berlaku** | : | | | | |
| **Nomor Protap Edisi Sebelumnya** | : - | | | | |
| **Tanggal Berlaku Edisi Sebelumnya** | : - | | | | |
| **Jumlah Halaman** | : 7 Halaman + 3 Lampiran (diluar halaman lembar pengesahan ini) | | | | |
| **Referensi** | : 1. BPOM, Pedoman CPOB 2024, Klausul 7.7 Tentang Dokumentasi<br>2. BPOM, Pedoman CPOB 2024, Klausul 10.3 Tentang Pembuatan dan Pengendalian Dokumen<br>3. BPOM, Pedoman CPOB 2024, Aneks 7 Tentang Sistem Komputerisasi<br>4. Peraturan BPOM No. 11 Tahun 2022 Tentang Standar dan Persyaratan Uji Bioekivalensi<br>5. Dokumen Validasi Sistem Komputerisasi (CSV) UDT Studio, No. CSV-AD-UDT-2026-001, Ver 1.0<br>6. Internal Procedure | | | | |
| **Pengesahan Dokumen** | | | | | |
| **Peran** | **Nama** | **Jabatan** | **Tanda Tangan** | **Tanggal** | |
| **Disusun Oleh** | Yonathan Christyanto | R&D AD Supervisor | | | |
| **Diperiksa Oleh** | Iin Agreeani Sitohang | R&D AD Manager | | | |
| **Disetujui Oleh** | Yunita | QA Manager | | | |

---

## 1. TUJUAN
1.1. Memastikan pengoperasian aplikasi **UDT Studio** dalam pemrosesan data mentah instrumen, perhitungan persentase terlarut (% Terlarut), evaluasi faktor kemiripan ($f_2$), dan pembuatan laporan Uji Disolusi Terbanding (UDT) dilaksanakan dengan benar sehingga menjamin hasil analisa disolusi terbanding yang akurat dan memenuhi prinsip integritas data (*ALCOA+*).
1.2. Menjamin terpeliharanya integritas berkas sistem **UDT Studio** dan keamanan *Master Template* melalui cara pengoperasian, verifikasi data, dan pemeliharaan yang baik dan benar.

## 2. RUANG LINGKUP
2.1. Laboratorium R&D Analytical Development PT. Pharos Indonesia.

## 3. PENANGGUNG JAWAB
3.1. R&D Analytical Development Scientist dan Supervisor bertanggung jawab dalam melaksanakan protap ini.
3.2. R&D Analytical Development Manager bertanggung jawab atas pelaksanaan protap ini.

## 4. TATA LAKSANA

### 4.1. PERSIAPAN
4.1.1. Pastikan komputer kerja menggunakan peramban (*browser* Google Chrome atau Microsoft Edge) yang berfungsi dengan baik dan membuka berkas resmi aplikasi [`UDT Studio.html`](file:///c:/Users/Win%2010/.gemini/antigravity/scratch/udt-assistant/UDT%20Studio.html) yang telah tervalidasi.
4.1.2. Pastikan status validasi sistem komputerisasi **UDT Studio** masih berlaku dan berkas aplikasi tidak mengalami modifikasi tanpa otorisasi. Jika terjadi penyimpangan (tampilan rusak, rumus tidak berfungsi, atau berkas berubah) laporkan kepada PIC sistem untuk kemudian dilaporkan kepada Quality Assurance (QA).
4.1.3. Siapkan berkas luaran hasil analisis instrumen **HPLC** (format `.pdf` atau `.csv` dari CDS Agilent OpenLab / Shimadzu LabSolutions) atau **Spektrofotometer UV-Vis** (format `.pdf` atau `.csv` *Advanced Reads Report* Agilent Cary 60) untuk Produk Uji dan Produk Pembanding.
4.1.4. Pastikan penamaan injeksi/sampel pada berkas instrumen telah memuat identitas tipe sampel (`Standar 1–5`, `BS Tengah 1–2`, `BS Akhir 1–2`), nama produk, nomor batch, media pH (mis. `pH 1,2`; `pH 4,5`; `pH 6,8`; `Air`), nomor *vessel* (`v1–v12`), serta waktu sampling (mis. `5'`, `10'`, `15'`, `20'`, `30'`, `45'`, `60'`).
4.1.5. Sebelum memulai pengolahan data produk baru, tekan tombol **Reset Data** (`🗑️`) pada pojok kanan atas layar aplikasi dan klik **OK** pada kotak konfirmasi untuk memastikan sesi peramban bersih dari data analisis sebelumnya.

### 4.2. PENGOPERASIAN
4.2.1. Buka **Langkah 1 (`1. Unggah`)**. Seret dan lepaskan (*drag & drop*) atau klik tombol **Pilih file Uji** pada kotak **Produk Uji (Test)** untuk mengunggah berkas PDF/CSV Produk Uji, kemudian unggah berkas PDF/CSV Produk Pembanding pada kotak **Produk Pembanding (Reference / Komparator)**.
4.2.2. Pastikan *badge* status pada setiap berkas yang diunggah berwarna hijau dan menunjukkan jumlah baris injeksi yang terbaca secara lengkap (mis. `93 baris` untuk 1 media atau `372 baris` untuk 4 media). Jika mengunggah berkas CSV, pastikan pengaturan **Mulai Baris**, **Kolom sampel**, **Kolom Area**, dan **Kolom RT** telah sesuai, kemudian tekan tombol **Lanjut ke Verifikasi →**.

![Langkah 1 Unggah Data Mentah](/C:/Users/Win%2010/.gemini/antigravity/brain/f11548dc-6320-4dc1-8f8a-153bf1f35b69/step1_upload.png)

4.2.3. Pada **Langkah 2 (`2. Verifikasi & Standar`)**, pilih media disolusi pada panel kiri (**Pilih Media**) dan pastikan indikator status pada setiap media berwarna hijau (**`Siap`**).
4.2.4. Periksa kelengkapan injeksi **Larutan Standar** (minimal 5 replikat), **Bracketing Standard Tengah** (2 replikat), dan **Bracketing Standard Akhir** (2 replikat), serta pastikan matriks 12 *vessel* × titik waktu pada tabel Produk Uji dan Produk Pembanding terisi lengkap tanpa pesan `KOSONG` atau konflik area.
4.2.5. Pastikan pilihan pada *dropdown* **Pasangkan dengan Larutan Standar** untuk masing-masing batch Produk Uji dan Produk Pembanding telah terhubung ke set larutan standar yang tepat, kemudian tekan tombol **Lanjut ke Parameter →**.

![Langkah 2 Verifikasi dan Pemetaan Standar](/C:/Users/Win%2010/.gemini/antigravity/brain/f11548dc-6320-4dc1-8f8a-153bf1f35b69/step2_verify.png)

4.2.6. Pada **Langkah 3 (`3. Parameter & Perhitungan`)**, isi bagian **Kondisi Pengujian & Media Disolusi** meliputi **Zat Aktif (API)**, **Alat Uji (Apparatus)**: `2 (Paddle)`, `1 (Basket)`, atau `4 (Flow-through cell)`, **Kecepatan (RPM)**, **Instrumen Analitik** (`HPLC` atau `Spektrofotometer UV`), dan **Rujukan Metode**.
4.2.7. Lengkapi identitas dan parameter kuantitatif pada kartu **Parameter Produk Uji** dan **Parameter Produk Pembanding**: **Nama Produk**, **Nomor Batch**, **Pabrik Pembuat**, **MD / ED**, **Nama Analis**, **Tanggal Analisis**, **Label Claim (mg)**, **Pengenceran Standar (mL)**, **Pengenceran Sampel (mL)**, **Volume Media (mL)**, serta **Volume Sampling / Replacement (mL)**.
4.2.8. Masukkan nilai **Kadar / Potensi WS (%)** pada kartu **Parameter Baku Kerja (Working Standard)**. Jika standar berupa garam dan zat aktif pada label berupa basa bebas (atau sebaliknya), centang **Gunakan Koreksi Bobot Molekul (Mr)** dan masukkan nilai **Mr Bentuk Garam / Standar** serta **Mr Zat Aktif Bebas**.
4.2.9. Masukkan **Bobot Penimbangan WS (mg)** pada setiap kartu standar media disolusi (atau gunakan kolom **Set semua** lalu klik **Terapkan**), kemudian tekan tombol **Hitung & Lihat Hasil →**.

![Langkah 3 Parameter dan Penimbangan WS](/C:/Users/Win%2010/.gemini/antigravity/brain/f11548dc-6320-4dc1-8f8a-153bf1f35b69/step3_params.png)

4.2.10. Pada **Langkah 4 (`4. Hasil & f2`)**, periksa tabel **% Terlarut** per *vessel* (`Vessel 1` s/d `Vessel 12`) beserta nilai statistik **Min**, **Max**, **Rata-rata**, **SD**, dan **RSD (%)** untuk Produk Pembanding dan Produk Uji pada setiap media disolusi.
4.2.11. Periksa kotak **Hasil Evaluasi Faktor Kemiripan $f_2$** dan pastikan kesesuaian terhadap kriteria **Peraturan BPOM No. 11 Tahun 2022**:
- **a.** Apabila rata-rata % Terlarut Produk Pembanding dan Produk Uji keduanya mencapai $\ge 85\%$ pada menit ke-15, sistem menetapkan status **`Similar (Very Rapid ≥ 85% @ 15')`** tanpa memerlukan evaluasi statistik $f_2$.
- **b.** Apabila belum mencapai $\ge 85\%$ pada menit ke-15, sistem menghitung nilai $f_2$ dengan pemotongan otomatis (*cut-off*) pada titik waktu pertama saat kedua produk mencapai $\ge 85\%$. Profil dinyatakan **`50 – 100: Similar`** jika nilai $f_2$ berada pada rentang $50$ – $100$, atau **`< 50: Not Similar`** jika $f_2 < 50$.
- **c.** Periksa ada tidaknya *banner* peringatan **Perhatian Batas Variabilitas (% RSD)**. Sesuai Peraturan BPOM No. 11 Tahun 2022, batas maksimum % RSD adalah **20%** pada titik waktu pertama dan **10%** pada titik-titik waktu berikutnya. Jika batas ini terlampaui, laporkan kepada Supervisor untuk evaluasi lebih lanjut.

![Langkah 4 Evaluasi Hasil dan Kurva Disolusi](/C:/Users/Win%2010/.gemini/antigravity/brain/f11548dc-6320-4dc1-8f8a-153bf1f35b69/step4_results.png)

4.2.12. Tekan tombol **Unduh Laporan (PDF)** atau **Pratinjau Cetak (Print Preview)** untuk menghasilkan dokumen laporan resmi UDT. Cetak laporan, bubuhkan tanda tangan dan tanggal pada kolom **Dilakukan Oleh (Analis)**, lalu serahkan bersama lampiran data mentah instrumen kepada Supervisor/Manager untuk diverifikasi dan ditandatangani pada kolom **Diperiksa Oleh**.
4.2.13. Apabila diperlukan sinkronisasi ke Google Sheets departemen, buka **Langkah 5 (`5. Export ke Sheets`)**, pastikan koneksi Google Workspace / Apps Script berstatus **Terhubung**, pilih folder tujuan output, lalu tekan tombol **Kirim Semua Media ke Google Sheets**.

![Langkah 5 Ekspor ke Google Sheets](/C:/Users/Win%2010/.gemini/antigravity/brain/f11548dc-6320-4dc1-8f8a-153bf1f35b69/step5_export.png)

4.2.14. Catat penggunaan aplikasi yang telah dilakukan pada **Logsheet Penggunaan dan Verifikasi Aplikasi UDT Studio** (Lampiran 2 Protap P-AD-949-00).

### 4.3. PEMBERSIHAN DATA SESI DAN PENGAMANAN SISTEM
4.3.1. Setiap selesai mengunduh/mencetak laporan PDF dan mengekspor hasil ke Google Sheets, tekan tombol **Reset Data** (`🗑️`) pada pojok kanan atas aplikasi untuk menghapus parameter yang tersimpan pada memori peramban (`localStorage`).
4.3.2. Hindari menyimpan atau memodifikasi berkas kode sumber `UDT Studio.html` secara langsung menggunakan editor teks agar tidak merusak struktur rumus dan tanda tangan digital (*checksum* SHA-256).
4.3.3. Jangan mengubah tata letak baris dan kolom pada berkas `Master Calculation`, `Master Report`, dan `Master Summary` di dalam folder `Master Template` Google Drive.
4.3.4. Catat pembersihan sesi data dan verifikasi setelah penggunaan pada **Logsheet Penggunaan dan Verifikasi Aplikasi UDT Studio** (Lampiran 2 Protap P-AD-949-00).

### 4.4. VERIFIKASI BERKALA DAN MAINTENANCE
4.4.1. Lakukan verifikasi berkala tahunan (pemeriksaan nilai *checksum* SHA-256 berkas `UDT Studio.html` dan pengujian dataset baku) serta catat pada **Logsheet Verifikasi Berkala dan Maintenance** (Lampiran 3 Protap P-AD-949-00).
4.4.2. Jika terjadi kendala teknis atau perubahan kebutuhan regulasi yang membutuhkan pembaruan kode sumber aplikasi, catat kendala/aktivitas dan tindak lanjut yang dilakukan pada **Logsheet Verifikasi Berkala dan Maintenance** (Lampiran 3 Protap P-AD-949-00) serta ajukan melalui prosedur *Change Control* ke Quality Assurance (QA).

## 5. DEFINISI
5.1. **Uji Disolusi Terbanding (UDT):** Pengujian disolusi komparatif secara *in vitro* antara produk obat uji dan produk obat pembanding (komparator) pada beberapa media pH fisiologis untuk mengevaluasi kemiripan profil pelepasan zat aktif.
5.2. **Faktor Kemiripan ($f_2$):** Parameter statistik untuk menyatakan kemiripan dua kurva profil disolusi, di mana nilai $f_2 \ge 50$ (rentang $50$ – $100$) menunjukkan kemiripan profil disolusi antara produk uji dan produk pembanding.

## 6. DAFTAR LAMPIRAN
6.1. Lampiran 1 Protap P-AD-949-00 : Gambar Antarmuka Aplikasi UDT Studio
6.2. Lampiran 2 Protap P-AD-949-00 : Logsheet Penggunaan dan Verifikasi Aplikasi UDT Studio
6.3. Lampiran 3 Protap P-AD-949-00 : Logsheet Verifikasi Berkala dan Maintenance

## 7. DOKUMEN TERKAIT
7.1. Dokumen Validasi Sistem Komputerisasi (CSV) UDT Studio (`CSV-AD-UDT-2026-001`)
7.2. Protap P-AD-948-00 : Pengoperasian, Pembersihan, dan Perawatan Dissolution Tester Sotax CE 7smart

## 8. CATATAN PERUBAHAN DOKUMEN

| No. Revisi | Perubahan (Sebelum) | Perubahan (Setelah) | Tgl. Berlaku |
| :---: | :---: | :---: | :---: |
| 00 | N/A | Protap Baru | |

## 9. JADWAL KAJI ULANG PROTAP
9.1. Protap dikaji setiap 3 tahun terhitung sejak tanggal berlakunya protap ini dan apabila ada perubahan pada protap.

## 10. DISTRIBUSI

| NO | DEPARTEMEN |
| :---: | :--- |
| 1 | R&D Analytical Development |

---
**-------------------------------------- 11. AKHIR DARI PROTAP INI --------------------------------------**

---

## LAMPIRAN 1 PROTAP P-AD-949-00 : GAMBAR ANTARMUKA APLIKASI UDT STUDIO

![Gambar Antarmuka Aplikasi UDT Studio](/C:/Users/Win%2010/.gemini/antigravity/brain/f11548dc-6320-4dc1-8f8a-153bf1f35b69/lampiran1_overview.png)

**Keterangan:**

| Bagian 1 – 5 | Bagian 6 – 9 |
| :--- | :--- |
| **1.** Header & Identitas Aplikasi UDT Studio<br>**2.** Tombol Panduan Regulasi & Reset Data Sesi<br>**3.** Bilah Navigasi 5 Langkah (*Stepper Workflow*)<br>**4.** Panel Tombol Ekspor Laporan (PDF / Cetak / CSV / TSV)<br>**5.** Sidebar Navigasi Multi-Media Disolusi (pH 1,2; 4,5; 6,8; Air) | **6.** Tabel Profil % Terlarut Produk Pembanding (Vessel 1–12 & Statistik)<br>**7.** Tabel Profil % Terlarut Produk Uji (Vessel 1–12 & Statistik)<br>**8.** Kotak Evaluasi Faktor Kemiripan $f_2$ & Status PerBPOM No. 11/2022<br>**9.** Grafik Kurva Profil Disolusi Komparatif (Uji vs Pembanding) |

---

## LAMPIRAN 2 PROTAP P-AD-949-00 : LOGSHEET PENGGUNAAN DAN VERIFIKASI APLIKASI UDT STUDIO

- **NAMA SISTEM:** UDT STUDIO (COMPARATIVE DISSOLUTION REPORT GENERATOR v1.0)
- **KODE SISTEM:** PI - AD - CSV - 001

| BULAN | TANGGAL | NAMA PRODUK UJI & PEMBANDING | NO. BATCH | MEDIA | INSTRUMEN: HPLC | INSTRUMEN: UV-VIS | VERIFIKASI: STD & BS | VERIFIKASI: CETAK PDF | PEMBERSIHAN: RESET SESI | USER | KETERANGAN | VERIFIKASI SPV |
| :---: | :---: | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :--- | :---: |
| **NOV 2026** | Minggu, 01 Nov 2026 | | | | ☐ | ☐ | ☐ | ☐ | ☐ | | | ☐ |
| **NOV 2026** | Senin, 02 Nov 2026 | | | | ☐ | ☐ | ☐ | ☐ | ☐ | | | ☐ |
| **NOV 2026** | Selasa, 03 Nov 2026 | | | | ☐ | ☐ | ☐ | ☐ | ☐ | | | ☐ |
| **NOV 2026** | Rabu, 04 Nov 2026 | | | | ☐ | ☐ | ☐ | ☐ | ☐ | | | ☐ |
| **NOV 2026** | Kamis, 05 Nov 2026 | | | | ☐ | ☐ | ☐ | ☐ | ☐ | | | ☐ |
| **NOV 2026** | Jumat, 06 Nov 2026 | | | | ☐ | ☐ | ☐ | ☐ | ☐ | | | ☐ |
| **NOV 2026** | Sabtu, 07 Nov 2026 | | | | ☐ | ☐ | ☐ | ☐ | ☐ | | | ☐ |
| **NOV 2026** | Minggu, 08 Nov 2026 | | | | ☐ | ☐ | ☐ | ☐ | ☐ | | | ☐ |
| **NOV 2026** | Senin, 09 Nov 2026 | | | | ☐ | ☐ | ☐ | ☐ | ☐ | | | ☐ |
| **NOV 2026** | Selasa, 10 Nov 2026 | | | | ☐ | ☐ | ☐ | ☐ | ☐ | | | ☐ |

---

## LAMPIRAN 3 PROTAP P-AD-949-00 : LOGSHEET VERIFIKASI BERKALA DAN MAINTENANCE

| TANGGAL | NAMA SISTEM | KODE / VERSI | AKTIVITAS / PROBLEM | TINDAK LANJUT | MODUL / FILE (JENIS) | CHECKSUM SHA-256 | NAMA TEKNISI / PELAKSANA | VERIFIKASI PIC | KETERANGAN |
| :---: | :---: | :---: | :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| | | | | | | | | ☐ | |
| | | | | | | | | ☐ | |
| | | | | | | | | ☐ | |
| | | | | | | | | ☐ | |
| | | | | | | | | ☐ | |
| | | | | | | | | ☐ | |
| | | | | | | | | ☐ | |
| | | | | | | | | ☐ | |
