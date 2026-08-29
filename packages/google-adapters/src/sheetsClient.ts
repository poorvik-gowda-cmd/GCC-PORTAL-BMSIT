// ==========================================================
// GCC Portal — Google Sheets Base Client
// packages/google-adapters/src/sheetsClient.ts
// ==========================================================

import { getGoogleAccessToken, type ServiceAccountCredentials } from './googleAuth';

const SHEETS_BASE = 'https://sheets.googleapis.com/v4/spreadsheets';
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const FETCH_TIMEOUT_MS = 15_000;
const MAX_RETRIES = 3;
const RETRYABLE_STATUS = new Set([429, 500, 502, 503, 504]);

export interface SheetRange {
  values: string[][];
}

async function fetchWithTimeout(url: string, init: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error('Google Sheets request timed out');
    }
    throw new Error('Google Sheets request failed');
  } finally {
    clearTimeout(id);
  }
}

/**
 * Retry a read-only Sheets fetch with exponential backoff.
 * NEVER use this for writes (append/update) — retrying writes can duplicate data.
 */
async function fetchWithRetry(url: string, init: RequestInit): Promise<Response> {
  let lastStatus = 0;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    if (attempt > 0) {
      const delayMs = Math.min(1000 * 2 ** (attempt - 1), 8000);
      await new Promise((r) => setTimeout(r, delayMs));
    }
    const resp = await fetchWithTimeout(url, init);
    if (resp.ok || !RETRYABLE_STATUS.has(resp.status)) {
      return resp;
    }
    lastStatus = resp.status;
    console.warn(`[SheetsClient] Transient error ${resp.status}, attempt ${attempt + 1}/${MAX_RETRIES + 1}`);
  }
  throw new Error(`Google Sheets read failed after ${MAX_RETRIES + 1} attempts (last HTTP ${lastStatus})`);
}

export class SheetsClient {
  private spreadsheetId: string;
  private credentials: ServiceAccountCredentials;

  constructor(spreadsheetId: string, credentials: ServiceAccountCredentials) {
    this.spreadsheetId = spreadsheetId;
    this.credentials = credentials;
  }

  private async getToken(): Promise<string> {
    return getGoogleAccessToken(this.credentials, SCOPES);
  }

  /**
   * Read values from a sheet range. Retries on transient errors.
   * @param range e.g. "Tasks!A2:Z"
   */
  async getValues(range: string): Promise<string[][]> {
    const token = await this.getToken();
    const url = `${SHEETS_BASE}/${this.spreadsheetId}/values/${encodeURIComponent(range)}`;
    const resp = await fetchWithRetry(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!resp.ok) throw new Error(`Sheets read error: HTTP ${resp.status}`);
    const data = (await resp.json()) as { values?: string[][] };
    return data.values ?? [];
  }

  /**
   * Append rows to a sheet range.
   * NOT retried — appending is not idempotent.
   */
  async appendValues(range: string, values: string[][]): Promise<void> {
    const token = await this.getToken();
    const url = `${SHEETS_BASE}/${this.spreadsheetId}/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;
    const resp = await fetchWithTimeout(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ values }),
    });
    if (!resp.ok) throw new Error(`Sheets append error: HTTP ${resp.status}`);
  }

  /**
   * Update values in a specific range (overwrite).
   * NOT retried — update is idempotent by range, but we still avoid retrying
   * to prevent unintended multi-writes on network ambiguity.
   */
  async updateValues(range: string, values: string[][]): Promise<void> {
    const token = await this.getToken();
    const url = `${SHEETS_BASE}/${this.spreadsheetId}/values/${encodeURIComponent(range)}?valueInputOption=USER_ENTERED`;
    const resp = await fetchWithTimeout(url, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ values }),
    });
    if (!resp.ok) throw new Error(`Sheets update error: HTTP ${resp.status}`);
  }

  /**
   * Find a row by a key value in a specific column.
   * Returns [rowIndex (1-based), rowValues] or null.
   */
  async findRowByKey(
    sheetName: string,
    keyColumn: number,
    keyValue: string
  ): Promise<[number, string[]] | null> {
    const rows = await this.getValues(`${sheetName}!A:Z`);
    for (let i = 0; i < rows.length; i++) {
      if (rows[i]?.[keyColumn] === keyValue) {
        return [i + 1, rows[i] ?? []];
      }
    }
    return null;
  }
}



