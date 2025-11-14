import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Task } from '../../entities/task.entity';
import { Organization } from '../../entities/organization.entity';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class TasksService {
    constructor(
        @InjectRepository(Task)
        private readonly taskRepo: Repository<Task>,
        @InjectRepository(Organization)
        private readonly orgRepo: Repository<Organization>,
        private readonly auditService: AuditService,
    ) { }

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
     * Find all tasks accessible to the user (their org + child orgs)
     */
    async findAll(userOrgId: string) {
        const accessibleOrgIds = await this.getAccessibleOrganizationIds(userOrgId);
        
        return this.taskRepo.find({
            where: {
                organization: { id: In(accessibleOrgIds) },
            },
            relations: ['assignee', 'organization', 'createdBy'],
        });
    }

    /**
     * Find one task, ensuring it's accessible to the user
     */
    async findOne(id: string, userOrgId: string) {
        const accessibleOrgIds = await this.getAccessibleOrganizationIds(userOrgId);
        
        const task = await this.taskRepo.findOne({
            where: {
                id,
                organization: { id: In(accessibleOrgIds) },
            },
            relations: ['assignee', 'organization', 'createdBy'],
        });

        if (!task) {
            throw new NotFoundException('Task not found');
        }

        return task;
    }

    /**
     * Create a task in the user's organization
     */
    async create(data: Partial<Task>, userOrgId: string, userId: string) {
        // Ensure the task is created in the user's organization
        const task = this.taskRepo.create({
            ...data,
            organization: { id: userOrgId } as any,
            createdBy: { id: userId } as any,
        });
        const savedTask = await this.taskRepo.save(task);
        
        // Log task creation
        await this.auditService.logTaskCreation(
            userId,
            userOrgId,
            savedTask.id,
            savedTask.title,
        );
        
        return savedTask;
    }

    /**
     * Update a task, ensuring it's accessible to the user
     */
    async update(id: string, data: Partial<Task>, userOrgId: string, userId: string) {
        const accessibleOrgIds = await this.getAccessibleOrganizationIds(userOrgId);
        
        const existing = await this.taskRepo.findOne({
            where: {
                id,
                organization: { id: In(accessibleOrgIds) },
            },
            relations: ['assignee', 'createdBy', 'organization'],
        });

        if (!existing) {
            throw new NotFoundException('Task not found');
        }

        // Track changes for audit log
        const changes: Record<string, unknown> = {};
        Object.keys(data).forEach(key => {
            const typedKey = key as keyof Task;
            if (data[typedKey] !== undefined && existing[typedKey] !== data[typedKey]) {
                changes[key] = {
                    old: existing[typedKey],
                    new: data[typedKey],
                };
            }
        });

        // Merge the new fields into the existing entity
        const merged = this.taskRepo.merge(existing, data);
        const savedTask = await this.taskRepo.save(merged);

        // Log task update if there were changes
        if (Object.keys(changes).length > 0) {
            await this.auditService.logTaskUpdate(
                userId,
                userOrgId,
                savedTask.id,
                changes,
            );
        }

        return savedTask;
    }

    /**
     * Remove a task, ensuring it's accessible to the user
     */
    async remove(id: string, userOrgId: string, userId: string) {
        const accessibleOrgIds = await this.getAccessibleOrganizationIds(userOrgId);
        
        const task = await this.taskRepo.findOne({
            where: {
                id,
                organization: { id: In(accessibleOrgIds) },
            },
        });

        if (!task) {
            throw new NotFoundException('Task not found');
        }

        const taskTitle = task.title;
        await this.taskRepo.delete(id);

        // Log task deletion
        await this.auditService.logTaskDeletion(
            userId,
            userOrgId,
            id,
            taskTitle,
        );
    }
}
