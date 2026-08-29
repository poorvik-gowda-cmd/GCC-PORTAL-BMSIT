// ==========================================================
// GCC Portal — MOU & Research Adapters
// packages/google-adapters/src/adapters/mouAdapter.ts
// ==========================================================

import { SheetsClient } from '../sheetsClient';
import type { MouRecord, ResearchRecord, MouStatus } from '@gcc-portal/contracts';

// MOU sheet columns: 0:mou_id 1:partner_institution 2:logo_ref 3:country
// 4:collaboration_area 5:start_year 6:end_year 7:status 8:document_drive_id
const MOU_SHEET = 'MOUs';

// Research sheet: 0:research_id 1:title 2:authors 3:abstract
// 4:publication_date 5:journal_name 6:status 7:document_drive_id
const RESEARCH_SHEET = 'Research';

export class MouAdapter {
  constructor(private sheets: SheetsClient) {}

  async getApprovedMous(): Promise<MouRecord[]> {
    const rows = await this.sheets.getValues(`${MOU_SHEET}!A2:I`);
    return rows
      .filter((r) => r[0] && r[7] === 'APPROVED')
      .map((r) => ({
        mouId: r[0] ?? '',
        partnerInstitution: r[1] ?? '',
        logoRef: r[2] ?? null,
        country: r[3] ?? '',
        collaborationArea: r[4] ?? '',
        startYear: parseInt(r[5] ?? '0', 10),
        endYear: r[6] ? parseInt(r[6], 10) : null,
        status: r[7] as MouStatus,
        documentDriveId: r[8] ?? null,
      }));
  }

  async getAllMous(): Promise<MouRecord[]> {
    const rows = await this.sheets.getValues(`${MOU_SHEET}!A2:I`);
    return rows
      .filter((r) => r[0])
      .map((r) => ({
        mouId: r[0] ?? '',
        partnerInstitution: r[1] ?? '',
        logoRef: r[2] ?? null,
        country: r[3] ?? '',
        collaborationArea: r[4] ?? '',
        startYear: parseInt(r[5] ?? '0', 10),
        endYear: r[6] ? parseInt(r[6], 10) : null,
        status: r[7] as MouStatus,
        documentDriveId: r[8] ?? null,
      }));
  }
}

export class ResearchAdapter {
  constructor(private sheets: SheetsClient) {}

  async getAllResearch(): Promise<ResearchRecord[]> {
    const rows = await this.sheets.getValues(`${RESEARCH_SHEET}!A2:H`);
    return rows
      .filter((r) => r[0])
      .map((r) => ({
        researchId: r[0] ?? '',
        title: r[1] ?? '',
        authors: r[2] ?? '',
        abstract: r[3] ?? '',
        publicationDate: r[4] ?? null,
        journalName: r[5] ?? null,
        status: r[6] ?? '',
        documentDriveId: r[7] ?? null,
      }));
  }

  async addResearchRecord(record: Omit<ResearchRecord, 'researchId'> & { researchId: string }): Promise<void> {
    const row = [
      record.researchId,
      record.title,
      record.authors,
      record.abstract,
      record.publicationDate ?? '',
      record.journalName ?? '',
      record.status,
      record.documentDriveId ?? '',
    ];
    await this.sheets.appendValues(`${RESEARCH_SHEET}!A:H`, [row]);
  }
}
