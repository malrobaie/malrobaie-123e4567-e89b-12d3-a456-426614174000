import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { Task } from '../../entities/task.entity';
import { Organization } from '../../entities/organization.entity';
import { AuditService } from '../audit/audit.service';

describe('TasksService - Organization Scoping & 2-Level Hierarchy Tests', () => {
  let service: TasksService;
  let taskRepo: jest.Mocked<Repository<Task>>;
  let orgRepo: jest.Mocked<Repository<Organization>>;
  let auditService: jest.Mocked<AuditService>;

  const mockTask = {
    id: 'task-123',
    title: 'Test Task',
    description: 'Description',
    category: 'Work',
    organization: { id: 'org-123' },
  };

  const mockChildOrgs = [
    { id: 'child-org-1', parentId: 'org-123' },
    { id: 'child-org-2', parentId: 'org-123' },
  ];

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
            remove: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Organization),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
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

  describe('findAll - 2-level hierarchy', () => {
    it('should return tasks from user org and child orgs', async () => {
      orgRepo.find.mockResolvedValue(mockChildOrgs as any);
      taskRepo.find.mockResolvedValue([mockTask] as any);

      const result = await service.findAll('org-123');

      expect(orgRepo.find).toHaveBeenCalledWith({ where: { parentId: 'org-123' } });
      expect(taskRepo.find).toHaveBeenCalledWith({
        where: { organization: { id: expect.anything() } },
        relations: ['assignee', 'organization', 'createdBy'],
      });
      expect(result).toEqual([mockTask]);
    });
  });

  describe('findOne', () => {
    it('should return task if accessible to user org', async () => {
      orgRepo.find.mockResolvedValue([]);
      taskRepo.findOne.mockResolvedValue(mockTask as any);

      const result = await service.findOne('task-123', 'org-123');

      expect(result).toEqual(mockTask);
    });

    it('should throw NotFoundException if task not found or not accessible', async () => {
      orgRepo.find.mockResolvedValue([]);
      taskRepo.findOne.mockResolvedValue(null);

      await expect(service.findOne('task-123', 'org-123'))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create task and log event', async () => {
      const createData = { title: 'New Task', description: 'Desc' };
      taskRepo.create.mockReturnValue(mockTask as any);
      taskRepo.save.mockResolvedValue(mockTask as any);

      const result = await service.create(createData, 'org-123', 'user-123');

      expect(taskRepo.create).toHaveBeenCalled();
      expect(taskRepo.save).toHaveBeenCalled();
      expect(auditService.logTaskCreation).toHaveBeenCalledWith('user-123', 'org-123', 'task-123', 'Test Task');
      expect(result).toEqual(mockTask);
    });
  });

  describe('update', () => {
    it('should update task if accessible and log changes', async () => {
      orgRepo.find.mockResolvedValue([]);
      taskRepo.findOne.mockResolvedValue(mockTask as any);
      const updatedTask = { ...mockTask, title: 'Updated' };
      taskRepo.merge.mockReturnValue(updatedTask as any);
      taskRepo.save.mockResolvedValue(updatedTask as any);

      const result = await service.update('task-123', { title: 'Updated' }, 'org-123', 'user-123');

      expect(taskRepo.merge).toHaveBeenCalled();
      expect(taskRepo.save).toHaveBeenCalled();
      expect(auditService.logTaskUpdate).toHaveBeenCalled();
      expect(result.title).toBe('Updated');
    });

    it('should throw NotFoundException if task not accessible', async () => {
      orgRepo.find.mockResolvedValue([]);
      taskRepo.findOne.mockResolvedValue(null);

      await expect(service.update('task-123', { title: 'Updated' }, 'org-123', 'user-123'))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete task if accessible and log event', async () => {
      orgRepo.find.mockResolvedValue([]);
      taskRepo.findOne.mockResolvedValue(mockTask as any);
      taskRepo.delete.mockResolvedValue({ affected: 1 } as any);

      await service.remove('task-123', 'org-123', 'user-123');

      expect(taskRepo.delete).toHaveBeenCalledWith('task-123');
      expect(auditService.logTaskDeletion).toHaveBeenCalledWith('user-123', 'org-123', 'task-123', 'Test Task');
    });

    it('should throw NotFoundException if task not accessible', async () => {
      orgRepo.find.mockResolvedValue([]);
      taskRepo.findOne.mockResolvedValue(null);

      await expect(service.remove('task-123', 'org-123', 'user-123'))
        .rejects.toThrow(NotFoundException);
    });
  });
});

