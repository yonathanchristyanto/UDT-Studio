# Panduan Menyiapkan Google Apps Script Connector untuk UDT Studio
**Analytical Development - Pharos Indonesia**

Konektor ini memungkinkan UDT Studio untuk membuat dan mengisi file Google Sheets (Master Calculation, Report, dan Summary) secara otomatis **tanpa perlu login OAuth** dan **tanpa perlu menyalin token manual**.

---

### Langkah 1: Buka Google Apps Script
1. Buka browser dan masuk ke [Google Apps Script](https://script.google.com/) menggunakan akun Google departemen atau akun lab yang memiliki akses ke template disolusi.
2. Di pojok kiri atas, klik tombol **+ Proyek baru** (*New project*).
3. Beri nama proyek di kiri atas (klik tulisan "Proyek tanpa judul"), ganti menjadi: **UDT Studio Connector**.

---

### Langkah 2: Tempelkan Kode Script
1. Pada editor, hapus seluruh kode bawaan yang ada di file `Code.gs` (`function myFunction() { ... }`).
2. Buka file [`Code.gs`](./Code.gs) di folder ini, salin seluruh kodenya, lalu tempelkan (*paste*) ke editor Google Apps Script.
3. Klik tombol **Simpan** (ikon disket) atau tekan `Ctrl + S`.

---

### Langkah 3: Deploy sebagai Web App
1. Di pojok kanan atas, klik tombol **Terapkan** (*Deploy*) > pilih **Penerapan baru** (*New deployment*).
2. Di samping teks "Pilih jenis" (*Select type*), klik ikon **roda gigi / gerigi**, lalu pilih **Aplikasi web** (*Web app*).
3. Atur pengaturannya sebagai berikut:
   - **Deskripsi** (*Description*): `UDT Studio Connector`
   - **Jalankan sebagai** (*Execute as*): **Saya / Me (`email akun Anda/departemen`)**
   - **Yang memiliki akses** (*Who has access*): **Siapa saja / Anyone** *(PENTING: Jangan pilih "Only myself", pilih "Anyone" agar aplikasi UDT Studio bisa mengirim data tanpa memunculkan login)*.
4. Klik tombol **Terapkan** (*Deploy*).

---

### Langkah 4: Berikan Izin Akses (Hanya Muncul Sekali di Awal)
1. Google akan menampilkan jendela pop-up bertuliskan *"Otorisasi diperlukan"* (*Authorization required*). Klik **Beri akses** (*Authorize access*).
2. Pilih akun Google Anda.
3. Jika muncul layar peringatan *"Google belum memverifikasi aplikasi ini"* (*Google hasn't verified this app*):
   - Klik tulisan **Lanjutan** (*Advanced*) di bagian bawah.
   - Klik **Buka UDT Studio Connector (tidak aman)** / *Go to UDT Studio Connector (unsafe)*.
   - Klik **Izinkan** (*Allow*).

---

### Langkah 5: Salin URL Web App ke UDT Studio
1. Setelah deployment berhasil, Google akan menampilkan **URL aplikasi web** (*Web app URL*) yang berakhiran `/exec`. Contoh formatnya:
   `https://script.google.com/macros/s/AKfycbx.../exec`
2. Klik tombol **Salin** (*Copy*).
3. Buka aplikasi **UDT Studio**, masuk ke **Langkah 5 (Kirim ke Google Sheets)**.
4. Tempelkan URL tersebut ke kolom **URL Google Apps Script**, lalu klik tombol **Hubungkan**.
5. Status koneksi akan langsung berubah menjadi hijau: **Terhubung (Google Apps Script)**.

URL ini akan tersimpan otomatis di browser komputer Anda, sehingga untuk penggunaan berikutnya Anda tidak perlu mengulang langkah ini lagi.
