export interface Task {
  id: string;
  title: string;
  description?: string;
  category?: string | null;
  status?: string | null;
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
  assigneeId?: string;
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  category?: string;
  status?: string;
  assigneeId?: string;
}

