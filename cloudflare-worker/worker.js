/**
 * =========================================================================
 * UDT STUDIO — CLOUDFLARE WORKER BRIDGE (COMPOSIO PLATFORM + GEMINI AI)
 * Pengganti Google Apps Script (Tanpa Deploy/Redeploy Code.gs & Tanpa Token 1 Jam)
 * =========================================================================
 */

const COMPOSIO_BASE_URL = 'https://backend.composio.dev';
const DEFAULT_SHARED_USER_ID = 'udt_lab_shared';
const GOOGLE_ID_RE = /^[a-zA-Z0-9_-]{8,160}$/;
const ALLOWED_TOOLKITS = new Set(['googledrive', 'googlesheets']);

// Cache session ID per isolate worker agar ekspor multi-langkah tetap cepat
let cachedSession = { cacheKey: '', sessionId: '' };

function parseAllowedOrigins(env) {
  const raw = String((env && env.ALLOWED_ORIGINS) || '*').trim();
  if (!raw || raw === '*') return { allowAll: true, list: [] };
  return {
    allowAll: false,
    list: raw.split(',').map(s => s.trim()).filter(Boolean)
  };
}

function buildCorsHeaders(request, env) {
  const origin = request.headers.get('Origin') || '';
  const cfg = parseAllowedOrigins(env);
  const headers = {
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-UDT-Token',
    'Access-Control-Max-Age': '86400'
  };
  if (cfg.allowAll) {
    headers['Access-Control-Allow-Origin'] = '*';
  } else if (origin && cfg.list.includes(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
    headers['Vary'] = 'Origin';
  } else if (cfg.list.length) {
    headers['Access-Control-Allow-Origin'] = cfg.list[0];
    headers['Vary'] = 'Origin';
  }
  return headers;
}

function isOriginPermitted(request, env) {
  const origin = request.headers.get('Origin');
  if (!origin) return true;
  const cfg = parseAllowedOrigins(env);
  return cfg.allowAll || cfg.list.includes(origin);
}

function jsonResponse(payload, status, corsHeaders) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...corsHeaders
    }
  });
}

function safeTimingEqual(a, b) {
  const sa = String(a || '');
  const sb = String(b || '');
  const len = Math.max(sa.length, sb.length);
  let diff = sa.length ^ sb.length;
  for (let i = 0; i < len; i++) {
    diff |= (sa.charCodeAt(i) || 0) ^ (sb.charCodeAt(i) || 0);
  }
  return diff === 0;
}

function verifyClientAccess(request, env) {
  const expected = String((env && env.UDT_ACCESS_TOKEN) || '').trim();
  if (!expected) return true;
  const xTok = request.headers.get('X-UDT-Token') || '';
  const auth = request.headers.get('Authorization') || '';
  const bearer = auth.toLowerCase().startsWith('bearer ') ? auth.slice(7).trim() : '';
  return safeTimingEqual(xTok, expected) || safeTimingEqual(bearer, expected);
}

function getSharedUserId(env) {
  return String((env && env.COMPOSIO_USER_ID) || DEFAULT_SHARED_USER_ID).trim() || DEFAULT_SHARED_USER_ID;
}

function assertGoogleId(val, label = 'ID Google') {
  const s = String(val || '').trim();
  if (!GOOGLE_ID_RE.test(s)) {
    throw new Error(`${label} tidak valid.`);
  }
  return s;
}

function requireComposioKey(env) {
  const key = String((env && env.COMPOSIO_API_KEY) || '').trim();
  if (!key) {
    throw new Error('COMPOSIO_API_KEY belum diset pada Secrets Backend / Cloudflare Worker.');
  }
  return key;
}

async function composioFetch(env, path, { method = 'GET', body } = {}) {
  const apiKey = requireComposioKey(env);
  const headers = {
    'x-api-key': apiKey,
    'Content-Type': 'application/json'
  };
  const init = { method, headers };
  if (body !== undefined) {
    init.body = JSON.stringify(body);
  }
  const res = await fetch(`${COMPOSIO_BASE_URL}${path}`, init);
  const text = await res.text();
  let json = {};
  try {
    json = text ? JSON.parse(text) : {};
  } catch (e) {
    json = { raw: text };
  }
  if (!res.ok) {
    const baseMsg = (json && (json.message || json.error?.message || json.error)) || `Composio HTTP ${res.status}`;
    const msgStr = typeof baseMsg === 'string' ? baseMsg : JSON.stringify(baseMsg);
    const extra = json && (json.errors || json.error?.errors || json.details);
    const detailStr = extra ? ` — ${typeof extra === 'string' ? extra : JSON.stringify(extra)}` : '';
    const err = new Error(`${msgStr}${detailStr} [${path}]`);
    err.status = res.status;
    throw err;
  }
  return json;
}

async function getConnectionStatus(env) {
  const userId = getSharedUserId(env);
  const composioConfigured = Boolean(String((env && env.COMPOSIO_API_KEY) || '').trim());
  const geminiConfigured = Boolean(String((env && env.GEMINI_API_KEY) || '').trim());
  const emptyToolkit = { connected: false, status: 'NOT_CONNECTED', id: '' };

  if (!composioConfigured) {
    return {
      userId,
      composioConfigured: false,
      geminiConfigured,
      connected: false,
      drive: { ...emptyToolkit },
      sheets: { ...emptyToolkit }
    };
  }

  const q = new URLSearchParams({
    user_ids: userId,
    toolkit_slugs: 'googledrive,googlesheets'
  });
  const data = await composioFetch(env, `/api/v3/connected_accounts?${q.toString()}`, { method: 'GET' });
  const items = Array.isArray(data.items) ? data.items : [];

  const pickToolkitState = (slug) => {
    const matching = items.filter(it => String(it?.toolkit?.slug || '').toLowerCase() === slug);
    const active = matching.find(it => String(it?.status || '').toUpperCase() === 'ACTIVE');
    const chosen = active || matching[0];
    if (!chosen) return { ...emptyToolkit };
    const status = String(chosen.status || 'UNKNOWN').toUpperCase();
    return {
      connected: status === 'ACTIVE',
      status,
      id: String(chosen.id || '')
    };
  };

  const drive = pickToolkitState('googledrive');
  const sheets = pickToolkitState('googlesheets');

  return {
    userId,
    composioConfigured: true,
    geminiConfigured,
    connected: Boolean(drive.connected && sheets.connected),
    drive,
    sheets
  };
}

async function getOrCreateSession(env, forceRefresh = false) {
  const apiKey = requireComposioKey(env);
  const userId = getSharedUserId(env);
  const cacheKey = `${userId}::${apiKey.slice(-10)}`;
  if (!forceRefresh && cachedSession.sessionId && cachedSession.cacheKey === cacheKey) {
    return cachedSession.sessionId;
  }

  const created = await composioFetch(env, '/api/v3.1/tool_router/session', {
    method: 'POST',
    body: {
      user_id: userId,
      toolkits: { enable: ['googledrive', 'googlesheets'] }
    }
  });
  const sessionId = String(created.session_id || created.id || '').trim();
  if (!sessionId) {
    throw new Error('Composio tidak mengembalikan session_id.');
  }
  cachedSession = { cacheKey, sessionId };
  return sessionId;
}

async function withSessionRetry(env, fn) {
  let sessionId = await getOrCreateSession(env, false);
  try {
    return await fn(sessionId);
  } catch (err) {
    if (err && (err.status === 404 || /session.*not\s*found/i.test(err.message || ''))) {
      sessionId = await getOrCreateSession(env, true);
      return await fn(sessionId);
    }
    throw err;
  }
}

async function createConnectLink(env, toolkit, callbackUrl) {
  const tk = String(toolkit || '').trim().toLowerCase();
  if (!ALLOWED_TOOLKITS.has(tk)) {
    throw new Error(`Toolkit '${toolkit}' tidak didukung. Gunakan 'googledrive' atau 'googlesheets'.`);
  }
  const body = { toolkit: tk };
  const cb = String(callbackUrl || '').trim();
  if (cb && /^https?:\/\//i.test(cb)) {
    body.callback_url = cb;
  }

  const callLink = (payload) => withSessionRetry(env, (sessionId) =>
    composioFetch(env, `/api/v3.1/tool_router/session/${encodeURIComponent(sessionId)}/link`, {
      method: 'POST',
      body: payload
    })
  );

  let res;
  try {
    res = await callLink(body);
  } catch (err) {
    if (body.callback_url && err && err.status === 400) {
      res = await callLink({ toolkit: tk });
    } else {
      throw err;
    }
  }

  const redirectUrl = String(res.redirect_url || res.redirectUrl || '').trim();
  if (!redirectUrl) {
    throw new Error(`Composio tidak mengembalikan redirect_url untuk ${tk}.`);
  }
  return {
    id: String(res.id || ''),
    redirect_url: redirectUrl,
    status: String(res.status || 'INITIATED'),
    toolkit: tk
  };
}

function formatGoogleUpstreamError(status, payload, toolkit, extraId) {
  let rawMsg = '';
  if (payload && typeof payload === 'object') {
    rawMsg = payload.error?.message || payload.message || JSON.stringify(payload);
  } else {
    rawMsg = String(payload || '');
  }
  const low = rawMsg.toLowerCase();
  if (low.includes('file not found')) {
    const detail = /file not found\s*:/i.test(rawMsg) ? rawMsg : `File not found${extraId ? ': ' + extraId : ''}`;
    return `${detail}. Akun Google yang terhubung di Composio belum memiliki akses ke file/folder ini. Pastikan file template & folder output sudah dibagikan ke akun Google tersebut.`;
  }
  if (status === 401 || low.includes('connected account') || low.includes('not connected') || low.includes('unauthenticated')) {
    const label = toolkit === 'googledrive' ? 'Google Drive' : 'Google Sheets';
    return `${label} belum terhubung atau otorisasi kedaluwarsa di Composio. Klik tombol Hubungkan ${label} pada panel Koneksi Google di Langkah 5.`;
  }
  return rawMsg || `Google API HTTP ${status}`;
}

async function proxyGoogle(env, toolkit, endpointUrl, method = 'GET', { body, parameters, extraId } = {}) {
  const payload = {
    toolkit_slug: toolkit,
    endpoint: endpointUrl,
    method
  };
  if (body !== undefined) payload.body = body;
  if (Array.isArray(parameters) && parameters.length) {
    payload.parameters = parameters.map(p => ({
      name: p.name,
      value: String(p.value ?? ''),
      type: p.type || p.in || 'query'
    }));
  }

  const res = await withSessionRetry(env, (sessionId) =>
    composioFetch(env, `/api/v3.1/tool_router/session/${encodeURIComponent(sessionId)}/proxy_execute`, {
      method: 'POST',
      body: payload
    })
  );

  const resultType = res.result_type || res.resultType || 'completed';
  if (resultType === 'blocked') {
    throw new Error(res.error || res.message || res.block_reason || 'Permintaan ditolak oleh kebijakan sesi Composio.');
  }

  let data = res.data;
  if (typeof data === 'string') {
    try { data = JSON.parse(data); } catch (e) {}
  }

  const upstreamStatus = Number(res.status || 200);
  if (upstreamStatus >= 400) {
    throw new Error(formatGoogleUpstreamError(upstreamStatus, data, toolkit, extraId));
  }
  return data;
}

async function callGeminiJson(env, promptText, responseSchema) {
  const apiKey = String((env && env.GEMINI_API_KEY) || '').trim();
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY belum diset pada Secrets Backend / Cloudflare Worker.');
  }
  const payload = {
    contents: [{ parts: [{ text: promptText }] }],
    generationConfig: {
      temperature: 0.1,
      responseMimeType: 'application/json',
      responseSchema
    }
  };

  const candidateModels = ['gemini-3.1-flash-lite', 'gemini-3-flash-preview', 'gemini-3.8-flash'];
  let lastErr = '';

  for (const modelName of candidateModels) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey
      },
      body: JSON.stringify(payload)
    });
    const jsonRes = await response.json().catch(() => ({}));
    if (response.ok && !jsonRes.error) {
      const aiText = String(jsonRes?.candidates?.[0]?.content?.parts?.[0]?.text || '').trim();
      if (!aiText) throw new Error('Respons Gemini API kosong.');
      return JSON.parse(aiText.replace(/^```json\s*/i, '').replace(/```$/i, '').trim());
    }
    lastErr = jsonRes?.error?.message || `HTTP ${response.status}`;
    if (response.status !== 404 && response.status !== 429) {
      break;
    }
  }
  throw new Error(lastErr || 'Gagal memanggil Gemini API.');
}

function canonNumericToken(raw) {
  let s = String(raw || '').trim().replace(/^[+-]/, '').replace(/\s+/g, '');
  if (!s || !/\d/.test(s)) return '';
  const hasComma = s.includes(',');
  const hasDot = s.includes('.');
  if (hasComma && hasDot) {
    if (s.lastIndexOf(',') > s.lastIndexOf('.')) {
      s = s.replace(/\./g, '').replace(',', '.');
    } else {
      s = s.replace(/,/g, '');
    }
  } else if (hasComma) {
    const parts = s.split(',');
    if (parts.length > 2) s = parts.join('');
    else s = parts[0] + '.' + parts[1];
  } else if (hasDot) {
    const parts = s.split('.');
    if (parts.length > 2) s = parts.join('');
  }
  return s;
}

function buildTextNumberLookup(rawText) {
  const exact = new Set();
  const canon = new Set();
  const matches = String(rawText || '').match(/\d+(?:[.,]\d+)*/g) || [];
  for (const tok of matches) {
    exact.add(tok);
    const c = canonNumericToken(tok);
    if (c) canon.add(c);
  }
  return { exact, canon };
}

function isVerifiedAreaInText(areaStr, lookup) {
  const trimmed = String(areaStr || '').trim();
  if (!trimmed || !/^[+-]?\d[\d.,]*$/.test(trimmed)) return false;
  const c = canonNumericToken(trimmed);
  if (!c) return false;
  const n = Number(c);
  if (!Number.isFinite(n)) return false;
  const unsigned = trimmed.replace(/^[+-]/, '');
  return lookup.exact.has(unsigned) || lookup.canon.has(c);
}

async function resolveSamplesWithGemini(env, names) {
  const rawNames = Array.isArray(names) ? names.slice(0, 300) : [];
  if (!rawNames.length) return [];

  const systemInstruction =
    'Anda adalah asisten laboratorium farmasi untuk uji disolusi terbanding (UDT). ' +
    'Tugas Anda mengekstrak informasi dari setiap nama sampel kromatogram/spektro non-standar menjadi JSON array dengan panjang dan urutan yang sama persis dengan daftar input. ' +
    'Untuk setiap entri, kembalikan objek dengan field: ' +
    'originalName (string nama persis dari input), ' +
    "type ('sample'|'std'|'bsMid'|'bsEnd'|'ignore'), " +
    'batch (string kode batch jika ada, atau string kosong "" jika tidak ada—jangan isi \'N/A\'), ' +
    "medium ('1,2'|'4,5'|'6,8'|'Air'|'Release'|'1,0'|'7,2'|'7,5' atau string kosong \"\" jika tidak disebut), " +
    'time (angka menit sampling atau null jika bukan sampel/tidak ada), ' +
    'vessel (angka nomor vessel 1-12 atau null jika bukan sampel/tidak ada).';

  const schema = {
    type: 'ARRAY',
    items: {
      type: 'OBJECT',
      properties: {
        originalName: { type: 'STRING' },
        type: { type: 'STRING', enum: ['sample', 'std', 'bsMid', 'bsEnd', 'ignore'] },
        batch: { type: 'STRING' },
        medium: { type: 'STRING' },
        time: { type: 'NUMBER', nullable: true },
        vessel: { type: 'INTEGER', nullable: true }
      },
      required: ['originalName', 'type', 'batch', 'medium']
    }
  };

  return await callGeminiJson(
    env,
    `${systemInstruction}\n\nBerikut daftar nama sampel mentah yang perlu dirapikan:\n${JSON.stringify(rawNames)}`,
    schema
  );
}

async function resolveMediaWithGemini(env, mediaNames) {
  const list = Array.isArray(mediaNames) ? mediaNames.slice(0, 50) : [];
  if (!list.length) return [];
  const prompt =
    'Anda adalah analis disolusi farmasi. Petakan setiap nama media disolusi non-standar berikut ke kode baku UDT Studio: ' +
    "'1,2' (HCl 0.1N / SGF / pH 1.2), '4,5' (Buffer Asetat / Acetate pH 4.5), '6,8' (Buffer Fosfat / Phosphate / SIF pH 6.8), " +
    "'Air' (Water / Aquades / Purified Water), 'Release' (Media QC Release), '1,0', '7,2', '7,5', atau '__keep__' jika benar-benar media khusus lain (mis. pH 5,5 atau surfaktan khusus yang harus terpisah). " +
    `Daftar nama media:\n${JSON.stringify(list)}`;
  const schema = {
    type: 'ARRAY',
    items: {
      type: 'OBJECT',
      properties: {
        originalMedia: { type: 'STRING' },
        targetMedia: { type: 'STRING' }
      },
      required: ['originalMedia', 'targetMedia']
    }
  };
  return await callGeminiJson(env, prompt, schema);
}

async function parseRawTableWithGemini(env, input = {}) {
  const fileName = String(input.fileName || '').trim();
  const rawText = String(input.text || '').slice(0, 40000);
  if (rawText.trim().length < 10) {
    return { rows: [], rejectedCount: 0, meta: {} };
  }

  const prompt =
    'Anda adalah parser laporan instrumen laboratorium farmasi (HPLC / UHPLC / UV-Vis Spectrophotometer) untuk uji disolusi. ' +
    'Ekstrak seluruh baris injeksi standar dan sampel dari teks laporan mentah berikut. ' +
    'ATURAN KETAT ANTI-HALUSINASI:\n' +
    '1. Salin `areaStr` (nilai Peak Area / Absorbance / Height utama analit) PERSIS karakter-per-karakter sesuai angka yang tertulis di dokumen. DILARANG membulatkan, menghitung, atau mengarang angka.\n' +
    '2. Abaikan baris statistik/ringkasan seperti Sum, Mean, Average, StdDev, SD, RSD, %RSD, Min, Max, atau Total.\n' +
    '3. Isi `rtStr` dengan waktu retensi (RT menit) persis dari teks bila ada, atau "" jika instrumen UV/tanpa RT.\n' +
    '4. Ekstrak metadata header bila tertulis: `compound` (nama zat aktif), `operator` (nama analis), `runDate` (format YYYY-MM-DD bila ada, selain itu "").\n\n' +
    `Nama File: ${fileName}\n--- MULAI TEKS DOKUMEN ---\n${rawText}\n--- AKHIR TEKS DOKUMEN ---`;

  const schema = {
    type: 'OBJECT',
    properties: {
      meta: {
        type: 'OBJECT',
        properties: {
          compound: { type: 'STRING' },
          operator: { type: 'STRING' },
          runDate: { type: 'STRING' }
        }
      },
      rows: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            name: { type: 'STRING' },
            rtStr: { type: 'STRING' },
            areaStr: { type: 'STRING' }
          },
          required: ['name', 'areaStr']
        }
      }
    },
    required: ['rows']
  };

  const parsed = await callGeminiJson(env, prompt, schema);
  const lookup = buildTextNumberLookup(rawText);
  const summaryRe = /^(sum|mean|average|avg|stddev|std\s*dev|sd|rsd|%rsd|total|min|max|minimum|maximum)$/i;
  const rawRows = Array.isArray(parsed && parsed.rows) ? parsed.rows : [];
  const verifiedRows = [];
  let rejectedCount = 0;

  for (const r of rawRows) {
    const name = String((r && r.name) || '').replace(/\s+/g, ' ').trim();
    const areaStr = String((r && r.areaStr) || '').trim();
    const rtStr = String((r && r.rtStr) || '').trim();
    if (!name || summaryRe.test(name)) continue;
    if (!isVerifiedAreaInText(areaStr, lookup)) {
      rejectedCount++;
      continue;
    }
    const validRt = rtStr && isVerifiedAreaInText(rtStr, lookup) ? rtStr : '';
    verifiedRows.push({ name, rtStr: validRt, areaStr });
  }

  const m = (parsed && parsed.meta) || {};
  return {
    rows: verifiedRows,
    rejectedCount,
    meta: {
      compound: String(m.compound || '').trim(),
      operator: String(m.operator || '').trim(),
      runDate: /^\d{4}-\d{2}-\d{2}$/.test(String(m.runDate || '').trim()) ? String(m.runDate).trim() : ''
    }
  };
}

async function handleTool(tool, input = {}, env) {
  if (tool === 'test_conn') {
    const status = await getConnectionStatus(env);
    return {
      ok: true,
      service: 'UDT Studio Cloudflare + Composio Bridge',
      timestamp: new Date().toISOString(),
      ...status
    };
  }

  if (tool === 'get_connect_link') {
    return await createConnectLink(env, input.toolkit, input.callbackUrl);
  }

  if (tool === 'verify_folder') {
    const folderId = assertGoogleId(input.folderId, 'Folder ID');
    const data = await proxyGoogle(
      env,
      'googledrive',
      `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(folderId)}`,
      'GET',
      {
        extraId: folderId,
        parameters: [
          { name: 'fields', value: 'id,name,mimeType', type: 'query' },
          { name: 'supportsAllDrives', value: 'true', type: 'query' }
        ]
      }
    );
    if (!data || data.mimeType !== 'application/vnd.google-apps.folder') {
      throw new Error('ID tersebut bukan folder Google Drive.');
    }
    return data;
  }

  if (tool === 'find_file') {
    const title = String(input.title || '').replace(/'/g, "\\'");
    if (!title) return { files: [] };
    const qParts = [
      `name = '${title}'`,
      "mimeType = 'application/vnd.google-apps.spreadsheet'",
      'trashed = false'
    ];
    if (input.parentId) {
      const pid = assertGoogleId(input.parentId, 'Folder Output');
      qParts.push(`'${pid}' in parents`);
    }
    const data = await proxyGoogle(
      env,
      'googledrive',
      'https://www.googleapis.com/drive/v3/files',
      'GET',
      {
        parameters: [
          { name: 'q', value: qParts.join(' and '), type: 'query' },
          { name: 'fields', value: 'files(id,name,webViewLink)', type: 'query' },
          { name: 'pageSize', value: '5', type: 'query' },
          { name: 'supportsAllDrives', value: 'true', type: 'query' },
          { name: 'includeItemsFromAllDrives', value: 'true', type: 'query' }
        ]
      }
    );
    return { files: (data && Array.isArray(data.files)) ? data.files : [] };
  }

  if (tool === 'copy_file') {
    const fileId = assertGoogleId(input.fileId, 'File Template');
    const title = String(input.title || 'UDT Output').trim();
    const copyParams = [{ name: 'supportsAllDrives', value: 'true', type: 'query' }];
    const parentId = input.parentId ? assertGoogleId(input.parentId, 'Folder Output') : '';
    let warning = '';
    let data;

    try {
      data = await proxyGoogle(
        env,
        'googledrive',
        `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}/copy`,
        'POST',
        {
          extraId: fileId,
          parameters: copyParams,
          body: parentId ? { name: title, parents: [parentId] } : { name: title }
        }
      );
    } catch (err) {
      const msg = String((err && err.message) || err || '');
      const isNonFolderAuthErr = /COMPOSIO_API_KEY|belum terhubung|Connect Link|Session|ditolak|kedaluwarsa|UNAUTHENTICATED|HTTP 401|HTTP 429/i.test(msg);
      if (!parentId || isNonFolderAuthErr) throw err;
      warning = `PERINGATAN: tidak dapat menyalin ke folder output (${msg}). File disimpan di My Drive akun terhubung.`;
      data = await proxyGoogle(
        env,
        'googledrive',
        `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}/copy`,
        'POST',
        {
          extraId: fileId,
          parameters: copyParams,
          body: { name: title }
        }
      );
    }

    return {
      id: data.id,
      title: data.name || title,
      viewUrl: `https://docs.google.com/spreadsheets/d/${data.id}/edit`,
      ...(warning ? { warning } : {})
    };
  }

  if (tool === 'get_spreadsheet') {
    const spreadsheetId = assertGoogleId(input.spreadsheetId, 'Spreadsheet ID');
    const parameters = [];
    if (input.fields) {
      const fVal = Array.isArray(input.fields) ? input.fields.join(',') : String(input.fields);
      if (fVal) parameters.push({ name: 'fields', value: fVal, type: 'query' });
    }
    if (input.includeGridData) {
      parameters.push({ name: 'includeGridData', value: 'true', type: 'query' });
    }
    if (Array.isArray(input.ranges)) {
      input.ranges.forEach(r => parameters.push({ name: 'ranges', value: String(r), type: 'query' }));
    }
    return await proxyGoogle(
      env,
      'googlesheets',
      `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}`,
      'GET',
      { extraId: spreadsheetId, parameters }
    );
  }

  if (tool === 'update_spreadsheet') {
    const spreadsheetId = assertGoogleId(input.spreadsheetId, 'Spreadsheet ID');
    return await proxyGoogle(
      env,
      'googlesheets',
      `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}:batchUpdate`,
      'POST',
      {
        extraId: spreadsheetId,
        body: { requests: Array.isArray(input.requests) ? input.requests : [] }
      }
    );
  }

  if (tool === 'batch_update_values') {
    const spreadsheetId = assertGoogleId(input.spreadsheetId, 'Spreadsheet ID');
    return await proxyGoogle(
      env,
      'googlesheets',
      `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}/values:batchUpdate`,
      'POST',
      {
        extraId: spreadsheetId,
        body: {
          valueInputOption: 'USER_ENTERED',
          data: Array.isArray(input.data) ? input.data : []
        }
      }
    );
  }

  if (tool === 'update_values') {
    const spreadsheetId = assertGoogleId(input.spreadsheetId, 'Spreadsheet ID');
    const range = String(input.range || '').trim();
    if (!range) throw new Error('Parameter range wajib diisi.');
    return await proxyGoogle(
      env,
      'googlesheets',
      `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}/values/${encodeURIComponent(range)}`,
      'PUT',
      {
        extraId: spreadsheetId,
        parameters: [{ name: 'valueInputOption', value: 'USER_ENTERED', type: 'query' }],
        body: { range, values: Array.isArray(input.values) ? input.values : [] }
      }
    );
  }

  if (tool === 'get_values') {
    const spreadsheetId = assertGoogleId(input.spreadsheetId, 'Spreadsheet ID');
    const range = String(input.range || '').trim();
    if (!range) throw new Error('Parameter range wajib diisi.');
    const valueRenderOption = String(input.valueRenderOption || 'FORMATTED_VALUE');
    return await proxyGoogle(
      env,
      'googlesheets',
      `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}/values/${encodeURIComponent(range)}`,
      'GET',
      {
        extraId: spreadsheetId,
        parameters: [{ name: 'valueRenderOption', value: valueRenderOption, type: 'query' }]
      }
    );
  }

  if (tool === 'copy_sheet_to') {
    const srcId = assertGoogleId(input.sourceSpreadsheetId, 'Master Report ID');
    const dstId = assertGoogleId(input.destinationSpreadsheetId, 'Spreadsheet Tujuan');
    const sheetId = input.sourceSheetId;
    if (sheetId === undefined || sheetId === null || sheetId === '') {
      throw new Error('sourceSheetId wajib diisi.');
    }
    return await proxyGoogle(
      env,
      'googlesheets',
      `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(srcId)}/sheets/${encodeURIComponent(String(sheetId))}:copyTo`,
      'POST',
      {
        extraId: srcId,
        body: { destinationSpreadsheetId: dstId }
      }
    );
  }

  if (tool === 'resolve_samples_ai') {
    return await resolveSamplesWithGemini(env, input.names);
  }

  if (tool === 'resolve_media_ai') {
    return await resolveMediaWithGemini(env, input.mediaNames);
  }

  if (tool === 'parse_raw_table_ai') {
    return await parseRawTableWithGemini(env, input);
  }

  throw new Error(`Alat '${tool}' tidak dikenali pada Backend Bridge.`);
}

export default {
  async fetch(request, env) {
    const cors = buildCorsHeaders(request, env);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors });
    }

    if (!isOriginPermitted(request, env)) {
      return jsonResponse({ ok: false, error: 'Origin tidak diizinkan oleh kebijakan CORS.' }, 403, cors);
    }

    if (!verifyClientAccess(request, env)) {
      return jsonResponse({ ok: false, error: 'Akses ditolak: UDT Access Token tidak valid.' }, 401, cors);
    }

    if (request.method === 'GET') {
      const url = new URL(request.url);
      if (url.searchParams.get('check') === '1') {
        try {
          const data = await handleTool('test_conn', {}, env);
          return jsonResponse({ ok: true, data }, 200, cors);
        } catch (err) {
          return jsonResponse({ ok: false, error: err.message || String(err) }, 200, cors);
        }
      }
      return jsonResponse({
        ok: true,
        service: 'UDT Studio Cloudflare + Composio Bridge',
        status: 'Active',
        composioConfigured: Boolean(String((env && env.COMPOSIO_API_KEY) || '').trim()),
        geminiConfigured: Boolean(String((env && env.GEMINI_API_KEY) || '').trim()),
        timestamp: new Date().toISOString()
      }, 200, cors);
    }

    if (request.method !== 'POST') {
      return jsonResponse({ ok: false, error: 'Metode HTTP harus GET atau POST.' }, 405, cors);
    }

    try {
      const rawText = await request.text();
      if (!rawText) {
        throw new Error('Payload permintaan kosong.');
      }
      const req = JSON.parse(rawText);
      const data = await handleTool(req.tool, req.input || {}, env);
      return jsonResponse({ ok: true, data }, 200, cors);
    } catch (err) {
      return jsonResponse({ ok: false, error: err.message || String(err) }, 200, cors);
    }
  }
};
