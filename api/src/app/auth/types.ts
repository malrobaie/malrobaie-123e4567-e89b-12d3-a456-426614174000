export interface AuthenticatedUser {
    id: string;
    email: string;
    displayName?: string | null;
    memberships?: Array<{
        role?: string;
        organization?: {
            id: string;
            name?: string;
        };
    }>;
}

export interface CreateTaskDto {
    title: string;
    description?: string;
    category?: string;
    status?: string;
    checklist?: Array<{ id: string; text: string; completed: boolean }>;
}

export interface UpdateTaskDto {
    title?: string;
    description?: string;
    category?: string;
    status?: string;
    sortOrder?: number;
    checklist?: Array<{ id: string; text: string; completed: boolean }>;
}

