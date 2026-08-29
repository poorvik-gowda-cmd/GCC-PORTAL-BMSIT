// ==========================================================
// GCC Portal — Tasks Adapter (Google Sheets operational store)
// packages/google-adapters/src/adapters/tasksAdapter.ts
// ==========================================================

import { SheetsClient } from '../sheetsClient';
import type { Task, TaskStatus, TaskPriority, DepartmentId } from '@gcc-portal/contracts';
import { computeIsOverdue } from '@gcc-portal/permissions';

const SHEET = 'Tasks';
// Column order in Tasks sheet (0-indexed):
// 0:task_id 1:title 2:description 3:department 4:assigned_to 5:assigned_to_name
// 6:assigned_by 7:deadline 8:priority 9:status 10:latest_update
// 11:president_remark 12:created_at 13:updated_at 14:completed_at

function rowToTask(row: string[]): Task {
  const status = row[9] as TaskStatus;
  const deadline = row[7] ?? '';
  const computedStatus: TaskStatus =
    computeIsOverdue(deadline, status) && status !== 'COMPLETED' ? 'OVERDUE' : status;

  return {
    taskId: row[0] ?? '',
    title: row[1] ?? '',
    description: row[2] ?? '',
    department: row[3] as DepartmentId,
    assignedTo: row[4] ?? '',
    assignedToName: row[5] ?? '',
    assignedBy: row[6] ?? '',
    deadline,
    priority: row[8] as TaskPriority,
    status: computedStatus,
    latestUpdate: row[10] ?? null,
    presidentRemark: row[11] ?? null,
    createdAt: row[12] ?? '',
    updatedAt: row[13] ?? '',
    completedAt: row[14] ?? null,
  };
}

export class TasksAdapter {
  constructor(private sheets: SheetsClient) {}

  async getAllTasks(): Promise<Task[]> {
    const rows = await this.sheets.getValues(`${SHEET}!A2:O`);
    return rows.filter((r) => r[0]).map(rowToTask);
  }

  async getTasksByDepartment(department: DepartmentId): Promise<Task[]> {
    const all = await this.getAllTasks();
    return all.filter((t) => t.department === department);
  }

  async getTaskById(taskId: string): Promise<Task | null> {
    const all = await this.getAllTasks();
    return all.find((t) => t.taskId === taskId) ?? null;
  }

  async getTasksByAssignee(userId: string): Promise<Task[]> {
    const all = await this.getAllTasks();
    return all.filter((t) => t.assignedTo === userId);
  }

  async createTask(task: Omit<Task, 'status' | 'latestUpdate' | 'presidentRemark' | 'completedAt'>): Promise<void> {
    const now = new Date().toISOString();
    const row = [
      task.taskId,
      task.title,
      task.description,
      task.department,
      task.assignedTo,
      task.assignedToName,
      task.assignedBy,
      task.deadline,
      task.priority,
      'NOT_STARTED',
      '',  // latestUpdate
      '',  // presidentRemark
      now, // createdAt
      now, // updatedAt
      '',  // completedAt
    ];
    await this.sheets.appendValues(`${SHEET}!A:O`, [row]);
  }

  async updateTaskStatus(
    taskId: string,
    status: TaskStatus,
    latestUpdate: string
  ): Promise<void> {
    const result = await this.sheets.findRowByKey(SHEET, 0, taskId);
    if (!result) throw new Error(`Task ${taskId} not found`);

    const [rowIndex, row] = result;
    const now = new Date().toISOString();
    const completedAt = status === 'COMPLETED' ? now : (row[14] ?? '');

    // Update status (col J = index 9), latestUpdate (col K = 10), updatedAt (col N = 13), completedAt (col O = 14)
    await this.sheets.updateValues(`${SHEET}!J${rowIndex + 1}:O${rowIndex + 1}`, [
      [status, latestUpdate, row[11] ?? '', now, completedAt],
    ]);
  }

  async addPresidentRemark(taskId: string, remark: string): Promise<void> {
    const result = await this.sheets.findRowByKey(SHEET, 0, taskId);
    if (!result) throw new Error(`Task ${taskId} not found`);
    const [rowIndex] = result;
    const now = new Date().toISOString();
    // Update presidentRemark (col L = index 11) and updatedAt (col N = 13)
    await this.sheets.updateValues(`${SHEET}!L${rowIndex + 1}`, [[remark]]);
    await this.sheets.updateValues(`${SHEET}!N${rowIndex + 1}`, [[now]]);
  }

  /**
   * Generate a stable task ID: TASK-YYYY-NNN
   */
  static generateTaskId(year: number, sequence: number): string {
    return `TASK-${year}-${String(sequence).padStart(3, '0')}`;
  }
}
