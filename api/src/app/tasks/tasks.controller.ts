import { Controller, Get, Param, Post, Body, Patch, Delete, UseGuards, BadRequestException } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard, RequireRole } from '../auth/roles.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { Role } from '@turbovets-task-manager/data';

@Controller('tasks')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TasksController {
    constructor(private readonly tasks: TasksService) { }

    @Get()
    getAll(@CurrentUser() user: any) {
        // All authenticated users can view tasks (Viewer, Admin, Owner)
        const membership = user.memberships?.[0];
        const userOrgId = membership?.organization?.id;
        if (!userOrgId) {
            throw new BadRequestException('User organization not found');
        }
        return this.tasks.findAll(userOrgId);
    }

    @Get(':id')
    getOne(@Param('id') id: string, @CurrentUser() user: any) {
        // All authenticated users can view tasks
        const membership = user.memberships?.[0];
        const userOrgId = membership?.organization?.id;
        if (!userOrgId) {
            throw new BadRequestException('User organization not found');
        }
        return this.tasks.findOne(id, userOrgId);
    }

    @Post()
    @RequireRole(Role.ADMIN, Role.OWNER)
    create(@Body() body: any, @CurrentUser() user: any) {
        // Only Admin+ can create tasks
        const membership = user.memberships?.[0];
        const userOrgId = membership?.organization?.id;
        if (!userOrgId) {
            throw new BadRequestException('User organization not found');
        }
        return this.tasks.create(body, userOrgId, user.id);
    }

    @Patch(':id')
    @RequireRole(Role.ADMIN, Role.OWNER)
    update(@Param('id') id: string, @Body() body: any, @CurrentUser() user: any) {
        // Only Admin+ can update tasks
        const membership = user.memberships?.[0];
        const userOrgId = membership?.organization?.id;
        if (!userOrgId) {
            throw new BadRequestException('User organization not found');
        }
        return this.tasks.update(id, body, userOrgId, user.id);
    }

    @Delete(':id')
    @RequireRole(Role.ADMIN, Role.OWNER)
    delete(@Param('id') id: string, @CurrentUser() user: any) {
        // Only Admin+ can delete tasks
        const membership = user.memberships?.[0];
        const userOrgId = membership?.organization?.id;
        if (!userOrgId) {
            throw new BadRequestException('User organization not found');
        }
        return this.tasks.remove(id, userOrgId, user.id);
    }
}
