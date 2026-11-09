/**
 * =========================================================================
 * UDT STUDIO — GOOGLE APPS SCRIPT CONNECTOR (100% NATIVE)
 * Analytical Development - Pharos Indonesia
 * =========================================================================
 *
 * Menggunakan layanan bawaan SpreadsheetApp & DriveApp sehingga TIDAK PERLU
 * mengaktifkan Google Sheets API / Drive API di Google Cloud Console.
 *
 * CARA UPDATE SCRIPT:
 * 1. Buka kembali proyek script Anda di https://script.google.com/
 * 2. Hapus semua kode lama di Code.gs, lalu tempelkan kode baru ini.
 * 3. Tekan Ctrl + S (Simpan).
 * 4. Klik tombol "Deploy" -> "Manage deployments" (Kelola penerapan)
 *    ATAU klik "Deploy" -> "New deployment" (Penerapan baru).
 *    - Jika lewat "Manage deployments": klik ikon Pensil (Edit) di kanan atas,
 *      pada bagian "Version" pilih "New version", lalu klik "Deploy".
 *    - Jika lewat "New deployment": pilih "Web app", Execute as: "Me",
 *      Who has access: "Anyone", lalu klik "Deploy" dan salin URL barunya.
 * =========================================================================
 */

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    ok: true,
    service: "UDT Studio Google Connector (Native)",
    status: "Active",
    message: "Konektor UDT Studio siap digunakan.",
    timestamp: new Date().toISOString()
  })).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      throw new Error("Payload permintaan kosong.");
    }

    var req = JSON.parse(e.postData.contents);
    var tool = req.tool;
    var input = req.input || {};

    var result = handleTool(tool, input);

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

function findSheetById(ss, sheetId) {
  var sheets = ss.getSheets();
  for (var i = 0; i < sheets.length; i++) {
    if (sheets[i].getSheetId() == sheetId) {
      return sheets[i];
    }
  }
  return null;
}

function writeRangeValues(ss, rangeStr, values) {
  if (!values || !values.length) return;
  var numRows = values.length;
  var numCols = 0;
  for (var i = 0; i < numRows; i++) {
    if (values[i] && values[i].length > numCols) {
      numCols = values[i].length;
    }
  }
  if (numCols === 0) return;

  var rect = [];
  for (var r = 0; r < numRows; r++) {
    var row = [];
    for (var c = 0; c < numCols; c++) {
      var v = (values[r] && c < values[r].length) ? values[r][c] : "";
      row.push(v === null || v === undefined ? "" : v);
    }
    rect.push(row);
  }

  var rg = ss.getRange(rangeStr);
  var sh = rg.getSheet();
  var targetRange = sh.getRange(rg.getRow(), rg.getColumn(), numRows, numCols);
  targetRange.setValues(rect);
}

function handleTool(tool, input) {
  // 1. Uji koneksi
  if (tool === "test_conn") {
    return { ok: true, timestamp: new Date().toISOString() };
  }

  // 2. Salin template file (DriveApp Native)
  if (tool === "copy_file") {
    var file = DriveApp.getFileById(input.fileId);
    var copied;
    if (input.parentId) {
      try {
        var folder = DriveApp.getFolderById(input.parentId);
        copied = file.makeCopy(input.title, folder);
      } catch (e) {
        copied = file.makeCopy(input.title);
      }
    } else {
      copied = file.makeCopy(input.title);
    }
    return {
      id: copied.getId(),
      title: copied.getName(),
      viewUrl: "https://docs.google.com/spreadsheets/d/" + copied.getId() + "/edit"
    };
  }

  // 3. Baca metadata spreadsheet (SpreadsheetApp Native)
  if (tool === "get_spreadsheet") {
    var ss = SpreadsheetApp.openById(input.spreadsheetId);
    var sheets = ss.getSheets().map(function(sh, idx) {
      return {
        properties: {
          sheetId: sh.getSheetId(),
          title: sh.getName(),
          index: idx,
          gridProperties: {
            rowCount: sh.getMaxRows(),
            columnCount: sh.getMaxColumns()
          }
        }
      };
    });
    return {
      properties: { title: ss.getName() },
      sheets: sheets
    };
  }

  // 4. Batch update struktur tab/sheet (SpreadsheetApp Native)
  if (tool === "update_spreadsheet") {
    var ss = SpreadsheetApp.openById(input.spreadsheetId);
    var requests = input.requests || [];
    var replies = [];

    for (var i = 0; i < requests.length; i++) {
      var r = requests[i];

      if (r.duplicateSheet) {
        var srcSh = findSheetById(ss, r.duplicateSheet.sourceSheetId) || ss.getSheets()[0];
        var newSh = srcSh.copyTo(ss);
        if (r.duplicateSheet.newSheetName) {
          newSh.setName(r.duplicateSheet.newSheetName);
        }
        replies.push({
          duplicateSheet: {
            properties: {
              sheetId: newSh.getSheetId(),
              title: newSh.getName()
            }
          }
        });
      } else if (r.deleteSheet) {
        var delSh = findSheetById(ss, r.deleteSheet.sheetId);
        if (delSh && ss.getSheets().length > 1) {
          ss.deleteSheet(delSh);
        }
        replies.push({});
      } else if (r.updateSheetProperties) {
        var props = r.updateSheetProperties.properties || {};
        var renSh = findSheetById(ss, props.sheetId);
        if (renSh && props.title) {
          renSh.setName(props.title);
        }
        replies.push({});
      } else if (r.appendDimension) {
        var appSh = findSheetById(ss, r.appendDimension.sheetId);
        if (appSh) {
          var len = r.appendDimension.length || 1;
          if (r.appendDimension.dimension === "ROWS") {
            appSh.insertRowsAfter(appSh.getMaxRows(), len);
          } else {
            appSh.insertColumnsAfter(appSh.getMaxColumns(), len);
          }
        }
        replies.push({});
      } else if (r.copyPaste) {
        var cpSrc = r.copyPaste.source;
        var cpDst = r.copyPaste.destination;
        var sSh = findSheetById(ss, cpSrc.sheetId);
        var dSh = findSheetById(ss, cpDst.sheetId);
        if (sSh && dSh) {
          var numRows = cpSrc.endRowIndex - cpSrc.startRowIndex;
          var numCols = cpSrc.endColumnIndex - cpSrc.startColumnIndex;
          var srcRange = sSh.getRange(cpSrc.startRowIndex + 1, cpSrc.startColumnIndex + 1, numRows, numCols);
          var dstRange = dSh.getRange(cpDst.startRowIndex + 1, cpDst.startColumnIndex + 1, numRows, numCols);
          srcRange.copyTo(dstRange);
        }
        replies.push({});
      } else {
        replies.push({});
      }
    }

    SpreadsheetApp.flush();
    return { replies: replies };
  }

  // 5. Batch update isi sel & formula (SpreadsheetApp Native)
  if (tool === "batch_update_values") {
    var ss = SpreadsheetApp.openById(input.spreadsheetId);
    var items = input.data || [];
    for (var i = 0; i < items.length; i++) {
      writeRangeValues(ss, items[i].range, items[i].values);
    }
    SpreadsheetApp.flush();
    return { totalUpdatedEntries: items.length };
  }

  // 6. Update nilai rentang tunggal (SpreadsheetApp Native)
  if (tool === "update_values") {
    var ss = SpreadsheetApp.openById(input.spreadsheetId);
    writeRangeValues(ss, input.range, input.values);
    SpreadsheetApp.flush();
    return { updatedRange: input.range };
  }

  // 7. Baca nilai rentang sel (SpreadsheetApp Native)
  if (tool === "get_values") {
    var ss = SpreadsheetApp.openById(input.spreadsheetId);
    var rg = ss.getRange(input.range);
    var vals = (input.valueRenderOption === "UNFORMATTED_VALUE")
      ? rg.getValues()
      : rg.getDisplayValues();
    return { range: input.range, values: vals };
  }

  // 8. Salin sheet/tab antar-file (SpreadsheetApp Native)
  if (tool === "copy_sheet_to") {
    var srcSS = SpreadsheetApp.openById(input.sourceSpreadsheetId);
    var dstSS = SpreadsheetApp.openById(input.destinationSpreadsheetId);
    var srcSh = findSheetById(srcSS, input.sourceSheetId) || srcSS.getSheets()[0];
    if (!srcSh) {
      throw new Error("Sheet sumber tidak ditemukan pada Master Report.");
    }
    var copiedSh = srcSh.copyTo(dstSS);
    SpreadsheetApp.flush();
    return {
      sheetId: copiedSh.getSheetId(),
      title: copiedSh.getName()
    };
  }

  // 9. Cari file di Drive (DriveApp Native)
  if (tool === "find_file") {
    var filesOut = [];
    var iter;
    if (input.parentId) {
      try {
        var folder = DriveApp.getFolderById(input.parentId);
        iter = folder.getFilesByName(input.title);
      } catch (e) {
        iter = DriveApp.getFilesByName(input.title);
      }
    } else {
      iter = DriveApp.getFilesByName(input.title);
    }
    while (iter.hasNext() && filesOut.length < 5) {
      var f = iter.next();
      if (!f.isTrashed() && f.getMimeType() === MimeType.GOOGLE_SHEETS) {
        filesOut.push({
          id: f.getId(),
          name: f.getName(),
          webViewLink: "https://docs.google.com/spreadsheets/d/" + f.getId() + "/edit"
        });
      }
    }
    return { files: filesOut };
  }

  // 10. Verifikasi folder output (DriveApp Native)
  if (tool === "verify_folder") {
    try {
      var folder = DriveApp.getFolderById(input.folderId);
      return {
        id: folder.getId(),
        name: folder.getName(),
        mimeType: "application/vnd.google-apps.folder"
      };
    } catch (e) {
      throw new Error("Folder tidak ditemukan atau akun tidak memiliki akses (" + (e.message || e) + ").");
    }
  }

  throw new Error("Alat '" + tool + "' tidak dikenali.");
}
