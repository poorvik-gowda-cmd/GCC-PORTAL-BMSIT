// ==========================================================
// GCC Portal — Events & Registrations Adapter
// packages/google-adapters/src/adapters/eventsAdapter.ts
// ==========================================================

import { SheetsClient } from '../sheetsClient';
import type { GccEvent, EventRegistration, EventStatus, RegistrationStatus } from '@gcc-portal/contracts';

const EVENTS_SHEET = 'Events';
const REGS_SHEET = 'Registrations';

// Events columns (0-indexed):
// 0:event_id 1:title 2:short_description 3:full_description 4:category
// 5:venue 6:start_date 7:end_date 8:registration_status 9:event_status
// 10:capacity 11:banner_image_ref 12:created_by 13:created_at 14:updated_at

function rowToEvent(row: string[]): GccEvent {
  return {
    eventId: row[0] ?? '',
    title: row[1] ?? '',
    shortDescription: row[2] ?? '',
    fullDescription: row[3] ?? '',
    category: row[4] ?? '',
    venue: row[5] ?? '',
    startDate: row[6] ?? '',
    endDate: row[7] ?? '',
    registrationStatus: row[8] as RegistrationStatus,
    eventStatus: row[9] as EventStatus,
    capacity: row[10] ? parseInt(row[10], 10) : null,
    bannerImageRef: row[11] ?? null,
    createdBy: row[12] ?? '',
    createdAt: row[13] ?? '',
    updatedAt: row[14] ?? '',
  };
}

// Registrations columns (0-indexed):
// 0:registration_id 1:event_id 2:full_name 3:email 4:phone
// 5:college_name 6:usn 7:department 8:custom_fields 9:registered_at

function rowToRegistration(row: string[]): EventRegistration {
  let customFields: Record<string, string> | null = null;
  try {
    customFields = row[8] ? JSON.parse(row[8]) : null;
  } catch { /* ignore */ }

  return {
    registrationId: row[0] ?? '',
    eventId: row[1] ?? '',
    fullName: row[2] ?? '',
    email: row[3] ?? '',
    phone: row[4] ?? '',
    department: row[7] ?? null,
    customFields,
    registeredAt: row[9] ?? '',
  };
}

export class EventsAdapter {
  constructor(private sheets: SheetsClient) {}

  async getPublishedEvents(): Promise<GccEvent[]> {
    const rows = await this.sheets.getValues(`${EVENTS_SHEET}!A2:O`);
    return rows.filter((r) => r[0] && r[9] === 'PUBLISHED').map(rowToEvent);
  }

  async getAllEvents(): Promise<GccEvent[]> {
    const rows = await this.sheets.getValues(`${EVENTS_SHEET}!A2:O`);
    return rows.filter((r) => r[0]).map(rowToEvent);
  }

  async getEventById(eventId: string): Promise<GccEvent | null> {
    const all = await this.getAllEvents();
    return all.find((e) => e.eventId === eventId) ?? null;
  }

  async createEvent(event: GccEvent): Promise<void> {
    const row = [
      event.eventId,
      event.title,
      event.shortDescription,
      event.fullDescription,
      event.category,
      event.venue,
      event.startDate,
      event.endDate,
      event.registrationStatus,
      event.eventStatus,
      event.capacity?.toString() ?? '',
      event.bannerImageRef ?? '',
      event.createdBy,
      event.createdAt,
      event.updatedAt,
    ];
    await this.sheets.appendValues(`${EVENTS_SHEET}!A:O`, [row]);
  }

  async publishEvent(eventId: string, status: 'PUBLISHED' | 'DRAFT'): Promise<void> {
    const result = await this.sheets.findRowByKey(EVENTS_SHEET, 0, eventId);
    if (!result) throw new Error(`Event ${eventId} not found`);
    const [rowIndex] = result;
    const now = new Date().toISOString();
    await this.sheets.updateValues(`${EVENTS_SHEET}!J${rowIndex + 1}`, [[status]]);
    await this.sheets.updateValues(`${EVENTS_SHEET}!O${rowIndex + 1}`, [[now]]);
  }

  async setRegistrationStatus(eventId: string, status: RegistrationStatus): Promise<void> {
    const result = await this.sheets.findRowByKey(EVENTS_SHEET, 0, eventId);
    if (!result) throw new Error(`Event ${eventId} not found`);
    const [rowIndex] = result;
    await this.sheets.updateValues(`${EVENTS_SHEET}!I${rowIndex + 1}`, [[status]]);
  }

  // ---- Registrations ----

  async getRegistrationsByEvent(eventId: string): Promise<EventRegistration[]> {
    const rows = await this.sheets.getValues(`${REGS_SHEET}!A2:J`);
    return rows.filter((r) => r[0] && r[1] === eventId).map(rowToRegistration);
  }

  async isDuplicateRegistration(eventId: string, email: string): Promise<boolean> {
    const regs = await this.getRegistrationsByEvent(eventId);
    return regs.some((r) => r.email.toLowerCase() === email.toLowerCase());
  }

  async addRegistration(reg: {
    registrationId: string;
    eventId: string;
    fullName: string;
    email: string;
    phone: string;
    collegeName?: string | undefined;
    usn?: string | undefined;
    department?: string | undefined;
    customFields?: Record<string, string> | undefined;
  }): Promise<void> {
    const row = [
      reg.registrationId,
      reg.eventId,
      reg.fullName,
      reg.email,
      reg.phone,
      reg.collegeName ?? '',
      reg.usn ?? '',
      reg.department ?? '',
      reg.customFields ? JSON.stringify(reg.customFields) : '',
      new Date().toISOString(),
    ];
    await this.sheets.appendValues(`${REGS_SHEET}!A:J`, [row]);
  }

  /**
   * Generate stable Registration ID: REG-YYYY-NNN-XXXX
   */
  static generateRegistrationId(year: number, eventSeq: number, regSeq: number): string {
    return `REG-${year}-${String(eventSeq).padStart(3, '0')}-${String(regSeq).padStart(4, '0')}`;
  }
}
