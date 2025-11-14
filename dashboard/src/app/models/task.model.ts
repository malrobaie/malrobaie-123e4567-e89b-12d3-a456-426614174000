export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  category?: string | null;
  status?: string | null;
  sortOrder?: number;
  checklist?: ChecklistItem[];
  createdAt: string;
  updatedAt: string;
  createdBy?: {
    id: string;
    displayName?: string;
  };
  assignee?: {
    id: string;
    displayName?: string;
  };
  organization?: {
    id: string;
    name?: string;
  };
}

export interface CreateTaskDto {
  title: string;
  description?: string;
  category?: string;
  status?: string;
  checklist?: ChecklistItem[];
  assigneeId?: string;
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  category?: string;
  status?: string;
  sortOrder?: number;
  checklist?: ChecklistItem[];
  assigneeId?: string;
}

