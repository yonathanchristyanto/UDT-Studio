/**
 * =========================================================================
 * UDT STUDIO — GOOGLE APPS SCRIPT CONNECTOR
 * Analytical Development - Pharos Indonesia
 * =========================================================================
 *
 * Jembatan otomatis untuk menghubungkan aplikasi UDT Studio dengan
 * Google Drive & Google Sheets tanpa memerlukan login OAuth / token manual.
 *
 * PETUNJUK PENYIAPAN (CUKUP DILAKUKAN SEKALI):
 * 1. Buka https://script.google.com/ pada browser (gunakan akun departemen/lab).
 * 2. Klik tombol "+ New project" di pojok kiri atas.
 * 3. Beri nama proyek, misalnya: "UDT Studio Connector".
 * 4. Hapus seluruh isi pada file "Code.gs", lalu tempelkan (paste) seluruh
 *    kode dari file ini.
 * 5. Klik icon "Save" (gambar disket) atau tekan Ctrl + S.
 * 6. Klik tombol "Deploy" (warna biru di kanan atas) -> pilih "New deployment".
 * 7. Klik icon gerigi (Select type) di sebelah "Select type", pilih "Web app".
 * 8. Isi konfigurasi deployment:
 *    - Description: "UDT Studio Connector"
 *    - Execute as : "Me (email Anda/departemen)"
 *    - Who has access: "Anyone" (PENTING: pilih "Anyone" agar aplikasi dapat
 *      mengirim data tanpa popup login/token).
 * 9. Klik tombol "Deploy".
 * 10. Jika muncul "Authorization required", klik "Authorize access",
 *     pilih akun Google Anda, klik "Advanced", lalu klik "Go to UDT Studio Connector (unsafe)",
 *     dan klik "Allow".
 * 11. Salin (copy) "Web app URL" (URL yang berakhiran "/exec").
 * 12. Buka aplikasi UDT Studio -> Langkah 5 (Kirim ke Google Sheets) ->
 *     tempelkan URL tersebut ke kolom "URL Google Apps Script" dan klik "Hubungkan".
 * =========================================================================
 */

// Anchor scopes agar Google otomatis meminta izin Drive & Sheets saat deployment
function _scopeAnchors() {
  DriveApp.getRootFolder();
  SpreadsheetApp.getActive();
}

/**
 * Menangani permintaan GET (untuk uji koneksi dari browser atau ping)
 */
function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    ok: true,
    service: "UDT Studio Google Connector",
    status: "Active",
    message: "Konektor UDT Studio siap digunakan.",
    timestamp: new Date().toISOString()
  })).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Menangani permintaan POST dari aplikasi UDT Studio
 */
function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      throw new Error("Payload permintaan kosong.");
    }

    var req = JSON.parse(e.postData.contents);
    var tool = req.tool;
    var input = req.input || {};
    var token = ScriptApp.getOAuthToken();

    var result = handleTool(tool, input, token);

    return ContentService.createTextOutput(JSON.stringify({
      ok: true,
      data: result
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      ok: false,
      error: err.message || String(err)
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Eksekutor operasi Google Drive & Google Sheets
 */
function handleTool(tool, input, token) {
  var headers = {
    "Authorization": "Bearer " + token,
    "Content-Type": "application/json"
  };

  // 1. Uji koneksi
  if (tool === "test_conn") {
    return { ok: true, timestamp: new Date().toISOString() };
  }

  // 2. Salin template file (Drive API)
  if (tool === "copy_file") {
    var url = "https://www.googleapis.com/drive/v3/files/" + input.fileId + "/copy?supportsAllDrives=true";
    var payload = {
      name: input.title,
      parents: input.parentId ? [input.parentId] : []
    };
    var res = UrlFetchApp.fetch(url, {
      method: "post",
      headers: headers,
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    });

    // Jika gagal menyimpan ke parent folder tertentu, simpan ke My Drive
    if (res.getResponseCode() >= 400 && input.parentId) {
      delete payload.parents;
      res = UrlFetchApp.fetch(url, {
        method: "post",
        headers: headers,
        payload: JSON.stringify(payload),
        muteHttpExceptions: true
      });
    }

    if (res.getResponseCode() >= 400) {
      var err = JSON.parse(res.getContentText() || "{}");
      throw new Error((err.error && err.error.message) || ("Gagal menyalin file (HTTP " + res.getResponseCode() + ")"));
    }

    var data = JSON.parse(res.getContentText());
    return {
      id: data.id,
      title: data.name,
      viewUrl: "https://docs.google.com/spreadsheets/d/" + data.id + "/edit"
    };
  }

  // 3. Baca metadata spreadsheet (Sheets API)
  if (tool === "get_spreadsheet") {
    var qs = [];
    if (input.fields) {
      qs.push("fields=" + encodeURIComponent(Array.isArray(input.fields) ? input.fields.join(",") : input.fields));
    }
    if (input.includeGridData) qs.push("includeGridData=true");
    var qStr = qs.length ? "?" + qs.join("&") : "";
    var url = "https://sheets.googleapis.com/v4/spreadsheets/" + input.spreadsheetId + qStr;

    var res = UrlFetchApp.fetch(url, {
      method: "get",
      headers: { "Authorization": "Bearer " + token },
      muteHttpExceptions: true
    });
    if (res.getResponseCode() >= 400) {
      var err = JSON.parse(res.getContentText() || "{}");
      throw new Error((err.error && err.error.message) || ("Gagal membaca spreadsheet (HTTP " + res.getResponseCode() + ")"));
    }
    return JSON.parse(res.getContentText());
  }

  // 4. Batch update struktur tab/sheet (Sheets API)
  if (tool === "update_spreadsheet") {
    var url = "https://sheets.googleapis.com/v4/spreadsheets/" + input.spreadsheetId + ":batchUpdate";
    var res = UrlFetchApp.fetch(url, {
      method: "post",
      headers: headers,
      payload: JSON.stringify({ requests: input.requests }),
      muteHttpExceptions: true
    });
    if (res.getResponseCode() >= 400) {
      var err = JSON.parse(res.getContentText() || "{}");
      throw new Error((err.error && err.error.message) || ("Gagal memperbarui spreadsheet (HTTP " + res.getResponseCode() + ")"));
    }
    return JSON.parse(res.getContentText());
  }

  // 5. Batch update isi sel & formula (Sheets API)
  if (tool === "batch_update_values") {
    var url = "https://sheets.googleapis.com/v4/spreadsheets/" + input.spreadsheetId + "/values:batchUpdate";
    var res = UrlFetchApp.fetch(url, {
      method: "post",
      headers: headers,
      payload: JSON.stringify({
        valueInputOption: "USER_ENTERED",
        data: input.data
      }),
      muteHttpExceptions: true
    });
    if (res.getResponseCode() >= 400) {
      var err = JSON.parse(res.getContentText() || "{}");
      throw new Error((err.error && err.error.message) || ("Gagal menulis data ke spreadsheet (HTTP " + res.getResponseCode() + ")"));
    }
    return JSON.parse(res.getContentText());
  }

  // 6. Update nilai rentang tunggal (Sheets API)
  if (tool === "update_values") {
    var url = "https://sheets.googleapis.com/v4/spreadsheets/" + input.spreadsheetId + "/values/" + encodeURIComponent(input.range) + "?valueInputOption=USER_ENTERED";
    var res = UrlFetchApp.fetch(url, {
      method: "put",
      headers: headers,
      payload: JSON.stringify({ range: input.range, values: input.values }),
      muteHttpExceptions: true
    });
    if (res.getResponseCode() >= 400) {
      var err = JSON.parse(res.getContentText() || "{}");
      throw new Error((err.error && err.error.message) || ("Gagal menulis rentang nilai (HTTP " + res.getResponseCode() + ")"));
    }
    return JSON.parse(res.getContentText());
  }

  // 7. Baca nilai rentang sel (Sheets API)
  if (tool === "get_values") {
    var vo = input.valueRenderOption || "FORMATTED_VALUE";
    var url = "https://sheets.googleapis.com/v4/spreadsheets/" + input.spreadsheetId + "/values/" + encodeURIComponent(input.range) + "?valueRenderOption=" + vo;
    var res = UrlFetchApp.fetch(url, {
      method: "get",
      headers: { "Authorization": "Bearer " + token },
      muteHttpExceptions: true
    });
    if (res.getResponseCode() >= 400) {
      var err = JSON.parse(res.getContentText() || "{}");
      throw new Error((err.error && err.error.message) || ("Gagal membaca nilai rentang (HTTP " + res.getResponseCode() + ")"));
    }
    return JSON.parse(res.getContentText());
  }

  // 8. Salin sheet/tab antar-file (Sheets API)
  if (tool === "copy_sheet_to") {
    var url = "https://sheets.googleapis.com/v4/spreadsheets/" + input.sourceSpreadsheetId + "/sheets/" + input.sourceSheetId + ":copyTo";
    var res = UrlFetchApp.fetch(url, {
      method: "post",
      headers: headers,
      payload: JSON.stringify({ destinationSpreadsheetId: input.destinationSpreadsheetId }),
      muteHttpExceptions: true
    });
    if (res.getResponseCode() >= 400) {
      var err = JSON.parse(res.getContentText() || "{}");
      throw new Error((err.error && err.error.message) || ("Gagal menyalin tab sheet (HTTP " + res.getResponseCode() + ")"));
    }
    return JSON.parse(res.getContentText());
  }

  // 9. Cari file di Drive (Drive API)
  if (tool === "find_file") {
    var qParts = [
      "name = '" + String(input.title || "").replace(/'/g, "\\'") + "'",
      "mimeType = 'application/vnd.google-apps.spreadsheet'",
      "trashed = false"
    ];
    if (input.parentId) qParts.push("'" + input.parentId + "' in parents");
    var url = "https://www.googleapis.com/drive/v3/files?q=" + encodeURIComponent(qParts.join(" and ")) + "&fields=files(id,name,webViewLink)&pageSize=5&supportsAllDrives=true&includeItemsFromAllDrives=true";
    var res = UrlFetchApp.fetch(url, {
      method: "get",
      headers: { "Authorization": "Bearer " + token },
      muteHttpExceptions: true
    });
    if (res.getResponseCode() >= 400) return { files: [] };
    return JSON.parse(res.getContentText());
  }

  // 10. Verifikasi folder output (Drive API)
  if (tool === "verify_folder") {
    var folderId = input.folderId;
    var url = "https://www.googleapis.com/drive/v3/files/" + folderId + "?fields=id,name,mimeType&supportsAllDrives=true";
    var res = UrlFetchApp.fetch(url, {
      method: "get",
      headers: { "Authorization": "Bearer " + token },
      muteHttpExceptions: true
    });
    if (res.getResponseCode() >= 400) {
      var err = JSON.parse(res.getContentText() || "{}");
      throw new Error((err.error && err.error.message) || ("Folder tidak ditemukan (HTTP " + res.getResponseCode() + ")"));
    }
    var data = JSON.parse(res.getContentText());
    if (data.mimeType !== "application/vnd.google-apps.folder") {
      throw new Error("ID tersebut bukan folder Google Drive.");
    }
    return data;
  }

  throw new Error("Alat '" + tool + "' tidak dikenali.");
}
