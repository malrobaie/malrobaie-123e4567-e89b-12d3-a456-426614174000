import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { Task } from '../../entities/task.entity';
import { Organization } from '../../entities/organization.entity';
import { AuditService } from '../audit/audit.service';

describe('TasksService', () => {
    let service: TasksService;
    let taskRepo: jest.Mocked<Repository<Task>>;
    let orgRepo: jest.Mocked<Repository<Organization>>;
    let auditService: jest.Mocked<AuditService>;

    const mockOrg1 = { id: 'org-1', name: 'Org 1', parentId: null };
    const mockOrg2 = { id: 'org-2', name: 'Org 2', parentId: 'org-1' };
    const mockTask = {
        id: 'task-1',
        title: 'Test Task',
        description: 'Test Description',
        organization: mockOrg1,
        createdBy: { id: 'user-1' },
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                TasksService,
                {
                    provide: getRepositoryToken(Task),
                    useValue: {
                        find: jest.fn(),
                        findOne: jest.fn(),
                        create: jest.fn(),
                        save: jest.fn(),
                        merge: jest.fn(),
                        delete: jest.fn(),
                    },
                },
                {
                    provide: getRepositoryToken(Organization),
                    useValue: {
                        find: jest.fn(),
                    },
                },
                {
                    provide: AuditService,
                    useValue: {
                        logTaskCreation: jest.fn(),
                        logTaskUpdate: jest.fn(),
                        logTaskDeletion: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<TasksService>(TasksService);
        taskRepo = module.get(getRepositoryToken(Task));
        orgRepo = module.get(getRepositoryToken(Organization));
        auditService = module.get(AuditService);
    });

    describe('findAll', () => {
        it('should return tasks from user organization and child organizations', async () => {
            orgRepo.find.mockResolvedValue([mockOrg2] as any);
            taskRepo.find.mockResolvedValue([mockTask] as any);

            const result = await service.findAll('org-1');

            expect(orgRepo.find).toHaveBeenCalledWith({
                where: { parentId: 'org-1' },
            });
            expect(taskRepo.find).toHaveBeenCalledWith({
                where: {
                    organization: { id: expect.anything() },
                },
                relations: ['assignee', 'organization', 'createdBy'],
            });
            expect(result).toEqual([mockTask]);
        });

        it('should return tasks only from user organization when no child orgs', async () => {
            orgRepo.find.mockResolvedValue([]);
            taskRepo.find.mockResolvedValue([mockTask] as any);

            await service.findAll('org-1');

            expect(taskRepo.find).toHaveBeenCalledWith({
                where: {
                    organization: { id: expect.anything() },
                },
                relations: ['assignee', 'organization', 'createdBy'],
            });
        });
    });

    describe('findOne', () => {
        it('should return task when found in accessible organization', async () => {
            orgRepo.find.mockResolvedValue([]);
            taskRepo.findOne.mockResolvedValue(mockTask as any);

            const result = await service.findOne('task-1', 'org-1');

            expect(result).toEqual(mockTask);
        });

        it('should throw NotFoundException when task is not found', async () => {
            orgRepo.find.mockResolvedValue([]);
            taskRepo.findOne.mockResolvedValue(null);

            await expect(service.findOne('task-1', 'org-1')).rejects.toThrow(NotFoundException);
        });
    });

    describe('create', () => {
        it('should create task and log audit event', async () => {
            const taskData = { title: 'New Task', description: 'New Description' };
            const createdTask = { ...taskData, id: 'task-2', organization: mockOrg1 };

            taskRepo.create.mockReturnValue(createdTask as any);
            taskRepo.save.mockResolvedValue(createdTask as any);

            const result = await service.create(taskData, 'org-1', 'user-1');

            expect(taskRepo.create).toHaveBeenCalledWith({
                ...taskData,
                organization: { id: 'org-1' },
                createdBy: { id: 'user-1' },
            });
            expect(taskRepo.save).toHaveBeenCalled();
            expect(auditService.logTaskCreation).toHaveBeenCalledWith(
                'user-1',
                'org-1',
                'task-2',
                'New Task',
            );
            expect(result).toEqual(createdTask);
        });
    });

    describe('update', () => {
        it('should update task and log audit event', async () => {
            const existingTask = { ...mockTask, title: 'Old Title' };
            const updatedData = { title: 'New Title' };
            const mergedTask = { ...existingTask, ...updatedData };

            orgRepo.find.mockResolvedValue([]);
            taskRepo.findOne.mockResolvedValue(existingTask as any);
            taskRepo.merge.mockReturnValue(mergedTask as any);
            taskRepo.save.mockResolvedValue(mergedTask as any);

            const result = await service.update('task-1', updatedData, 'org-1', 'user-1');

            expect(auditService.logTaskUpdate).toHaveBeenCalledWith(
                'user-1',
                'org-1',
                'task-1',
                expect.objectContaining({
                    title: expect.objectContaining({
                        old: 'Old Title',
                        new: 'New Title',
                    }),
                }),
            );
            expect(result).toEqual(mergedTask);
        });

        it('should throw NotFoundException when task is not found', async () => {
            orgRepo.find.mockResolvedValue([]);
            taskRepo.findOne.mockResolvedValue(null);

            await expect(
                service.update('task-1', { title: 'New Title' }, 'org-1', 'user-1'),
            ).rejects.toThrow(NotFoundException);
        });
    });

    describe('remove', () => {
        it('should delete task and log audit event', async () => {
            orgRepo.find.mockResolvedValue([]);
            taskRepo.findOne.mockResolvedValue(mockTask as any);
            taskRepo.delete.mockResolvedValue({ affected: 1 } as any);

            await service.remove('task-1', 'org-1', 'user-1');

            expect(taskRepo.delete).toHaveBeenCalledWith('task-1');
            expect(auditService.logTaskDeletion).toHaveBeenCalledWith(
                'user-1',
                'org-1',
                'task-1',
                'Test Task',
            );
        });

        it('should throw NotFoundException when task is not found', async () => {
            orgRepo.find.mockResolvedValue([]);
            taskRepo.findOne.mockResolvedValue(null);

            await expect(service.remove('task-1', 'org-1', 'user-1')).rejects.toThrow(
                NotFoundException,
            );
        });
    });
});
