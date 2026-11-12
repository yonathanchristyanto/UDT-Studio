# Panduan Menyiapkan Google Apps Script Connector untuk UDT Studio
**Analytical Development - Pharos Indonesia**

Konektor ini memungkinkan UDT Studio untuk membuat dan mengisi file Google Sheets (Master Calculation, Report, dan Summary) secara otomatis **tanpa perlu login OAuth** dan **tanpa perlu menyalin token manual**.

---

## Cara Cepat (Rekomendasi Utama — Tanpa Perlu Salin Kode)

Proyek script konektor telah disiapkan di Google Drive lab. Anda hanya perlu membuka file script tersebut dan melakukan **Deploy**:

### 1. Buka File Script Konektor
Buka tautan proyek script berikut menggunakan peramban (masuk dengan akun Google lab/departemen Anda):
👉 **[Buka Proyek UDT Studio Connector di Google Apps Script](https://script.google.com/d/1iLVYbU3kOAxFbPSy2K5MJ9H9ykh7_mtaA00qpEe_QbOVVkUhtTqjGx4a/edit?usp=drive_link)**

*(Catatan: File ini juga tersedia di folder Google Drive `Project AI > UDT Studio Connector`)*

### 2. Deploy sebagai Web App
1. Di pojok kanan atas editor Apps Script, klik tombol biru **Terapkan** (*Deploy*) > pilih **Penerapan baru** (*New deployment*).
2. Di samping teks "Pilih jenis" (*Select type*), pastikan bertuliskan **Aplikasi web** (*Web app*).
3. Atur parameter deployment:
   - **Deskripsi** (*Description*): `UDT Studio Connector v1.0`
   - **Jalankan sebagai** (*Execute as*): **Saya / Me (`email akun Anda`)**
   - **Yang memiliki akses** (*Who has access*): **Siapa saja / Anyone** *(Wajib "Anyone" agar aplikasi UDT Studio di peramban dapat mengirim data tanpa hambatan blokir login)*.
4. Klik tombol **Terapkan** (*Deploy*).

### 3. Berikan Izin Akses (Hanya Sekali di Awal)
1. Jika muncul jendela *"Otorisasi diperlukan"* (*Authorization required*), klik **Beri akses** (*Authorize access*).
2. Pilih akun Google Anda.
3. Jika muncul layar *"Google belum memverifikasi aplikasi ini"* (*Google hasn't verified this app*):
   - Klik tulisan **Lanjutan** (*Advanced*) di kiri bawah.
   - Klik **Buka UDT Studio Connector (tidak aman)** / *Go to UDT Studio Connector (unsafe)*.
   - Klik **Izinkan** (*Allow*).

### 4. Salin URL Web App ke UDT Studio
1. Salin **URL aplikasi web** (*Web app URL*) yang muncul (format berakhiran `/exec`, contoh: `https://script.google.com/macros/s/AKfycb.../exec`).
2. Buka aplikasi **UDT Studio**, masuk ke **Langkah 5 (Export ke Sheets)**.
3. Tempelkan URL tersebut ke kolom input, lalu klik tombol **Hubungkan Web App**.
4. Status koneksi akan langsung berubah menjadi hijau: **Terhubung (Google Apps Script)**.

> 💡 **PENTING:** Langkah deploy ini hanya perlu dilakukan **1 kali**. URL yang sudah terhubung akan tersimpan secara otomatis di peramban untuk seluruh pengujian berikutnya.

---

## Opsi Alternatif: Deploy dari Salinan Kode Manual (`Code.gs`)
Jika Anda ingin membuat proyek script mandiri dari awal di Google Drive pribadi:
1. Buka [script.google.com](https://script.google.com/) > Klik **+ Proyek baru** (*New project*).
2. Salin seluruh isi berkas [`Code.gs`](./Code.gs) dan tempelkan ke editor, lalu tekan `Ctrl + S`.
3. Lakukan deploy seperti langkah 2 s/d 4 di atas.
