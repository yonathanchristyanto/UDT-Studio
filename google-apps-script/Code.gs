/**
 * =========================================================================
 * UDT STUDIO — GOOGLE APPS SCRIPT CONNECTOR (FAST NATIVE)
 * Analytical Development - Pharos Indonesia
 * =========================================================================
 */

// Fungsi tanpa if(false) agar Google Apps Script mendeteksi izin penuh Drive
// (untuk menyimpan langsung ke Folder Output, bukan ke My Drive)
function aktifkanIzinFolderDrive() {
  var temp = DriveApp.createFile("tes_izin_folder_udt.txt", "ok");
  temp.setTrashed(true);
  Logger.log("BERHASIL! Izin simpan ke Folder Output Google Drive sudah aktif!");
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    ok: true,
    service: "UDT Studio Google Connector (Fast Native)",
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

function colToNum(colStr) {
  var s = colStr.replace(/\$/g, "").toUpperCase();
  var n = 0;
  for (var i = 0; i < s.length; i++) {
    n = n * 26 + (s.charCodeAt(i) - 64);
  }
  return n;
}

function numToCol(n) {
  var s = "";
  while (n > 0) {
    var m = (n - 1) % 26;
    s = String.fromCharCode(65 + m) + s;
    n = Math.floor((n - m) / 26);
  }
  return s;
}

function buildExactA1Range(rangeStr, numRows, numCols) {
  var bangIdx = rangeStr.lastIndexOf("!");
  var prefix = bangIdx >= 0 ? rangeStr.slice(0, bangIdx + 1) : "";
  var a1 = bangIdx >= 0 ? rangeStr.slice(bangIdx + 1) : rangeStr;
  var startCell = a1.split(":")[0];
  var m = startCell.match(/^\$?([A-Za-z]+)\$?(\d+)$/);
  if (!m) return rangeStr;
  var startCol = colToNum(m[1]);
  var startRow = parseInt(m[2], 10);
  if (numRows === 1 && numCols === 1) {
    return prefix + m[1].toUpperCase() + startRow;
  }
  var endCol = numToCol(startCol + numCols - 1);
  var endRow = startRow + numRows - 1;
  return prefix + m[1].toUpperCase() + startRow + ":" + endCol + endRow;
}

// Write-only (tanpa memanggil getRow/getColumn) agar dieksekusi instan dalam 1 batch oleh V8
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

  var exactRange = buildExactA1Range(rangeStr, numRows, numCols);
  ss.getRange(exactRange).setValues(rect);
}

function handleTool(tool, input) {
  if (tool === "test_conn") {
    return { ok: true, timestamp: new Date().toISOString() };
  }

  // Utamakan menyimpan langsung ke Folder Output via DriveApp.makeCopy(title, folder)
  if (tool === "copy_file") {
    var copiedId = "";
    var copiedName = "";

    if (input.parentId) {
      try {
        var folder = DriveApp.getFolderById(input.parentId);
        var file = DriveApp.getFileById(input.fileId);
        var copiedInFolder = file.makeCopy(input.title, folder);
        copiedId = copiedInFolder.getId();
        copiedName = copiedInFolder.getName();
      } catch (folderCopyErr) {}
    }

    if (!copiedId) {
      var srcSS = SpreadsheetApp.openById(input.fileId);
      var newSS = srcSS.copy(input.title);
      copiedId = newSS.getId();
      copiedName = newSS.getName();

      if (input.parentId) {
        try {
          var targetFolder = DriveApp.getFolderById(input.parentId);
          DriveApp.getFileById(copiedId).moveTo(targetFolder);
        } catch (moveErr) {}
      }
    }

    return {
      id: copiedId,
      title: copiedName,
      viewUrl: "https://docs.google.com/spreadsheets/d/" + copiedId + "/edit"
    };
  }

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

  if (tool === "batch_update_values") {
    var ss = SpreadsheetApp.openById(input.spreadsheetId);
    var items = input.data || [];
    for (var i = 0; i < items.length; i++) {
      writeRangeValues(ss, items[i].range, items[i].values);
    }
    SpreadsheetApp.flush();
    return { totalUpdatedEntries: items.length };
  }

  if (tool === "update_values") {
    var ss = SpreadsheetApp.openById(input.spreadsheetId);
    writeRangeValues(ss, input.range, input.values);
    SpreadsheetApp.flush();
    return { updatedRange: input.range };
  }

  if (tool === "get_values") {
    var ss = SpreadsheetApp.openById(input.spreadsheetId);
    var rg = ss.getRange(input.range);
    var vals = (input.valueRenderOption === "UNFORMATTED_VALUE")
      ? rg.getValues()
      : rg.getDisplayValues();
    return { range: input.range, values: vals };
  }

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

  if (tool === "find_file") {
    var filesOut = [];
    try {
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
    } catch (e) {}
    return { files: filesOut };
  }

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
