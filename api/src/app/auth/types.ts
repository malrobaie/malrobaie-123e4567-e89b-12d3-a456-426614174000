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
}

export interface UpdateTaskDto {
    title?: string;
    description?: string;
    category?: string;
    status?: string;
}

