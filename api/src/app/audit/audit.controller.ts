import { Controller, Get, UseGuards, Query, BadRequestException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard, RequireRole } from '../auth/roles.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { AuditService } from './audit.service';
import { Role } from '@turbovets-task-manager/data';

@Controller('audit-log')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AuditController {
    constructor(private readonly auditService: AuditService) {}

    @Get()
    @RequireRole(Role.ADMIN, Role.OWNER)
    async getAuditLogs(
        @CurrentUser() user: any,
        @Query('limit') limit?: string,
    ) {
        // Only Admin+ can view audit logs
        const membership = user.memberships?.[0];
        const userOrgId = membership?.organization?.id;
        
        if (!userOrgId) {
            throw new BadRequestException('User organization not found');
        }

        const limitNum = limit ? parseInt(limit, 10) : 100;
        const logs = await this.auditService.findByOrganization(userOrgId, limitNum);

        return {
            logs: logs.map(log => ({
                id: log.id,
                action: log.action,
                userId: log.user?.id || null,
                userEmail: log.user?.email || null,
                organizationId: log.organization?.id || null,
                organizationName: log.organization?.name || null,
                taskId: log.task?.id || null,
                taskTitle: log.task?.title || null,
                details: log.details,
                createdAt: log.createdAt,
            })),
        };
    }
}
