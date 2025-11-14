import { Controller, Get, Param, Post, Body, Put, Delete, UseGuards, BadRequestException } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard, RequireRole } from '../auth/roles.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { Role } from '@turbovets-task-manager/data';
import type { AuthenticatedUser, CreateTaskDto, UpdateTaskDto } from '../auth/types';

@Controller('tasks')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TasksController {
    constructor(private readonly tasks: TasksService) { }

    @Get()
    getAll(@CurrentUser() user: AuthenticatedUser) {
        // All authenticated users can view tasks (Viewer, Admin, Owner)
        const membership = user.memberships?.[0];
        const userOrgId = membership?.organization?.id;
        if (!userOrgId) {
            throw new BadRequestException('User organization not found');
        }
        return this.tasks.findAll(userOrgId);
    }

    @Post()
    @RequireRole(Role.ADMIN, Role.OWNER)
    create(@Body() body: CreateTaskDto, @CurrentUser() user: AuthenticatedUser) {
        // Only Admin+ can create tasks
        const membership = user.memberships?.[0];
        const userOrgId = membership?.organization?.id;
        if (!userOrgId) {
            throw new BadRequestException('User organization not found');
        }
        return this.tasks.create(body, userOrgId, user.id);
    }

    @Put(':id')
    @RequireRole(Role.ADMIN, Role.OWNER)
    update(@Param('id') id: string, @Body() body: UpdateTaskDto, @CurrentUser() user: AuthenticatedUser) {
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
    delete(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
        // Only Admin+ can delete tasks
        const membership = user.memberships?.[0];
        const userOrgId = membership?.organization?.id;
        if (!userOrgId) {
            throw new BadRequestException('User organization not found');
        }
        return this.tasks.remove(id, userOrgId, user.id);
    }
}
