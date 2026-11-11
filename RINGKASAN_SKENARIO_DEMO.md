# LEMBAR RUJUKAN CEPAT SKENARIO DEMO UDT STUDIO
*(Quick-Reference Card untuk Live Demo Presenter)*

Gunakan tabel ini sebagai panduan cepat saat mendemonstrasikan file kepada atasan atau tim manajemen.

---

### 📋 Tabel Rujukan Cepat 4 Skenario Pengujian

| Skenario | Nama Produk & Batch | Media Pengujian | Instrumen | File Uji (Test) | File Pembanding (Ref) | Hasil Utama di Layar | Poin Penting untuk Dijelaskan |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **1. Multi-Media & Very Rapid** | **Empagliflozin 25 mg** (`F0048J26A`) vs **Jardiance 25 mg** (`F0006H26A`) | **4 Media:**<br>• pH 1.2<br>• pH 4.5<br>• pH 6.8<br>• Air (Water) | HPLC Agilent 1260 (C18) | `Empagliflozin_Test_AllMedia_4Media.csv`<br>*(atau versi .pdf)* | `Jardiance_Ref_AllMedia_4Media.csv`<br>*(atau versi .pdf)* | • **pH 1.2:** `Similar (Very Rapid ≥ 85% @ 15')`<br>• **pH 4.5:** `Similar` ($f_2 \approx 74.2$)<br>• **pH 6.8:** `Similar` ($f_2 \approx 72.8$)<br>• **Air:** `Similar` ($f_2 \approx 68.5$) | Tunjukkan bahwa aplikasi otomatis memisahkan 4 media dari 1 file gabungan, mendeteksi aturan pelepasan cepat 15 menit (BPOM/FDA/EMA), dan menerapkan cut-off titik 85%. |
| **2. Formulasi Beda / Gagal** | **Candesartan 16 mg** (`F0091L26B`) vs **Blopress 16 mg** (`B8014K26A`) | Buffer Fosfat **pH 6.8** (+ 0.05% Tween 20) | HPLC Shimadzu Prominence | `Candesartan_Test_pH_6.8_NotSimilar.csv`<br>*(atau .pdf)* | `Blopress_Ref_pH_6.8.csv`<br>*(atau .pdf)* | • **Status:** `NOT SIMILAR`<br>• **Skor:** $f_2 = 31.15$ ($< 50$)<br>• **Badge:** Warna Oranye/Merah | Tunjukkan bahwa sistem bersikap objektif dan tidak bias. Jika formulasi prototype uji mengalami keterlambatan pelepasan zat aktif, sistem secara tegas menetapkan status *Not Similar*. |
| **3. Spektrofotometer UV-Vis** | **Metformin HCl 500 mg** (`F0012A26A`) vs **Glucophage 500 mg** (`G0088F26A`) | Buffer Fosfat **pH 6.8** | Spektrofotometer UV Agilent Cary 60 | `Metformin_Test_pH_6.8_Cary60.csv`<br>*(atau .pdf Cary 60)* | `Glucophage_Ref_pH_6.8_Cary60.csv`<br>*(atau .pdf Cary 60)* | • **Status:** `Similar (Very Rapid / Rapid)`<br>• **Skor:** $f_2 = 83.76$ | Tunjukkan fleksibilitas instrumen: tidak hanya kromatogram HPLC, aplikasi mampu membaca laporan *Advanced Reads Report Cary 60* (absorbansi/readings) secara native. |
| **4. Peringatan Variabilitas Mutu** | **Atorvastatin 20 mg** (`F0077C26A`) vs **Lipitor 20 mg** (`L0042D26A`) | Buffer Asetat **pH 4.5** | HPLC Agilent 1260 | `Atorvastatin_Test_pH_4.5_HighRSD.csv`<br>*(atau .pdf)* | `Lipitor_Ref_pH_4.5.csv`<br>*(atau .pdf)* | • **Nilai $f_2$:** Rerata numerik $\ge 50$<br>• **Peringatan Muncul:**<br>`Variabilitas (% RSD) melebihi batas regulasi pada menit 5' (26.4% > limit 20%) & 20' (10.6% > limit 10%)` | Fitur pengawasan mutu (*Regulatory Compliance Guardrail*). Membuktikan bahwa aplikasi mematuhi kaidah variabilitas Peraturan BPOM No. 11 Tahun 2022 (titik ke-1 maks. 20%, titik ke-2 dst. maks. 10%) agar hasil uji disolusi tidak ditolak oleh regulator akibat variasi antar-vessel yang tidak terkontrol. |

---

### 💡 Tips & Trik Saat Demo Live:
1. **Untuk Demo Tercepat (Flash Demo < 2 Menit):**  
   Gunakan **Skenario 1 (AllMedia)**. Cukup tarik 1 file Test dan 1 file Ref ke dropzone, lalu klik **Lanjut** berturut-turut sampai ke Langkah 4 untuk memperlihatkan 4 kurva disolusi interaktif dan cetak PDF instan.
2. **Untuk Menunjukkan Nilai Regulasi & Integritas Data:**  
   Gunakan **Skenario 2 (Not Similar)** lalu bandingkan dengan **Skenario 4 (High RSD Warning)** untuk menunjukkan kecerdasan audit sistem.
3. **Untuk Menguji Fleksibilitas Format File:**  
   Gunakan file `.pdf` kromatogram langsung ke dropzone untuk membuktikan bahwa analis tidak perlu mengonversi file ke CSV terlebih dahulu!
