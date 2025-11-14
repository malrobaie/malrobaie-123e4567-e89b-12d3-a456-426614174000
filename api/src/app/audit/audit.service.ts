import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { AuditLog, AuditAction } from '../../entities/audit-log.entity';
import { Organization } from '../../entities/organization.entity';

@Injectable()
export class AuditService {
    constructor(
        @InjectRepository(AuditLog)
        private readonly auditLogRepo: Repository<AuditLog>,
        @InjectRepository(Organization)
        private readonly orgRepo: Repository<Organization>,
    ) {}

    /**
     * Log an audit event
     */
    async log(
        action: AuditAction,
        userId: string | null,
        organizationId: string | null,
        taskId: string | null = null,
        details: Record<string, unknown> | null = null,
    ): Promise<AuditLog> {
        const auditLog = this.auditLogRepo.create({
            action,
            user: userId ? { id: userId } as any : null,
            organization: organizationId ? { id: organizationId } as any : null,
            task: taskId ? { id: taskId } as any : null,
            details,
        });

        return this.auditLogRepo.save(auditLog);
    }

    /**
     * Get accessible organization IDs for a user (their org + child orgs for 2-level hierarchy)
     */
    private async getAccessibleOrganizationIds(userOrgId: string): Promise<string[]> {
        const accessibleIds = [userOrgId];
        
        // Find child organizations (where parentId = userOrgId)
        const childOrgs = await this.orgRepo.find({
            where: { parentId: userOrgId },
        });
        
        accessibleIds.push(...childOrgs.map(org => org.id));
        
        return accessibleIds;
    }

    /**
     * Find audit logs for an organization (including child orgs for 2-level hierarchy)
     */
    async findByOrganization(organizationId: string, limit = 100): Promise<AuditLog[]> {
        const accessibleOrgIds = await this.getAccessibleOrganizationIds(organizationId);
        
        return this.auditLogRepo.find({
            where: {
                organization: { id: In(accessibleOrgIds) },
            },
            relations: ['user', 'organization', 'task'],
            order: {
                createdAt: 'DESC',
            },
            take: limit,
        });
    }

    /**
     * Log a login event
     */
    async logLogin(userId: string, organizationId: string): Promise<AuditLog> {
        return this.log('login', userId, organizationId, null, {
            timestamp: new Date().toISOString(),
        });
    }

    /**
     * Log a task creation event
     */
    async logTaskCreation(userId: string, organizationId: string, taskId: string, taskTitle: string): Promise<AuditLog> {
        return this.log('create_task', userId, organizationId, taskId, {
            taskTitle,
            timestamp: new Date().toISOString(),
        });
    }

    /**
     * Log a task update event
     */
    async logTaskUpdate(userId: string, organizationId: string, taskId: string, changes: Record<string, unknown>): Promise<AuditLog> {
        return this.log('update_task', userId, organizationId, taskId, {
            changes,
            timestamp: new Date().toISOString(),
        });
    }

    /**
     * Log a task deletion event
     */
    async logTaskDeletion(userId: string, organizationId: string, taskId: string, taskTitle: string): Promise<AuditLog> {
        return this.log('delete_task', userId, organizationId, taskId, {
            taskTitle,
            timestamp: new Date().toISOString(),
        });
    }

    /**
     * Log a permission denial event
     */
    async logPermissionDenial(
        userId: string,
        organizationId: string,
        action: string,
        resource: string,
        reason: string,
    ): Promise<AuditLog> {
        return this.log('permission_denied', userId, organizationId, null, {
            deniedAction: action,
            resource,
            reason,
            timestamp: new Date().toISOString(),
        });
    }
}
