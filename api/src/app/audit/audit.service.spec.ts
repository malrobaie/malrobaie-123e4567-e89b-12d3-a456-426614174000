import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditService } from './audit.service';
import { AuditLog } from '../../entities/audit-log.entity';
import { Organization } from '../../entities/organization.entity';

describe('AuditService - Audit Logging Tests', () => {
  let service: AuditService;
  let auditRepo: jest.Mocked<Repository<AuditLog>>;
  let orgRepo: jest.Mocked<Repository<Organization>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditService,
        {
          provide: getRepositoryToken(AuditLog),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Organization),
          useValue: {
            find: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuditService>(AuditService);
    auditRepo = module.get(getRepositoryToken(AuditLog));
    orgRepo = module.get(getRepositoryToken(Organization));
  });

  describe('logLogin', () => {
    it('should create login audit log', async () => {
      const mockLog = { id: 'log-1', action: 'login' };
      auditRepo.create.mockReturnValue(mockLog as any);
      auditRepo.save.mockResolvedValue(mockLog as any);

      await service.logLogin('user-123', 'org-123');

      expect(auditRepo.create).toHaveBeenCalledWith(expect.objectContaining({
        user: { id: 'user-123' },
        organization: { id: 'org-123' },
        action: 'login',
        task: null,
      }));
      expect(auditRepo.save).toHaveBeenCalled();
    });
  });

  describe('logTaskCreation', () => {
    it('should create task creation audit log', async () => {
      const mockLog = { id: 'log-1', action: 'create_task' };
      auditRepo.create.mockReturnValue(mockLog as any);
      auditRepo.save.mockResolvedValue(mockLog as any);

      await service.logTaskCreation('user-123', 'org-123', 'task-123', 'Test Task');

      expect(auditRepo.create).toHaveBeenCalledWith(expect.objectContaining({
        user: { id: 'user-123' },
        organization: { id: 'org-123' },
        task: { id: 'task-123' },
        action: 'create_task',
      }));
      expect(auditRepo.save).toHaveBeenCalled();
    });
  });

  describe('logTaskUpdate', () => {
    it('should create task update audit log', async () => {
      const mockLog = { id: 'log-1', action: 'update_task' };
      auditRepo.create.mockReturnValue(mockLog as any);
      auditRepo.save.mockResolvedValue(mockLog as any);

      await service.logTaskUpdate('user-123', 'org-123', 'task-123', { title: 'Updated' });

      expect(auditRepo.create).toHaveBeenCalledWith(expect.objectContaining({
        user: { id: 'user-123' },
        organization: { id: 'org-123' },
        task: { id: 'task-123' },
        action: 'update_task',
      }));
      expect(auditRepo.save).toHaveBeenCalled();
    });
  });

  describe('logTaskDeletion', () => {
    it('should create task deletion audit log', async () => {
      const mockLog = { id: 'log-1', action: 'delete_task' };
      auditRepo.create.mockReturnValue(mockLog as any);
      auditRepo.save.mockResolvedValue(mockLog as any);

      await service.logTaskDeletion('user-123', 'org-123', 'task-123', 'Test Task');

      expect(auditRepo.create).toHaveBeenCalledWith(expect.objectContaining({
        user: { id: 'user-123' },
        organization: { id: 'org-123' },
        task: { id: 'task-123' },
        action: 'delete_task',
      }));
      expect(auditRepo.save).toHaveBeenCalled();
    });
  });

  describe('findByOrganization - 2-level hierarchy', () => {
    it('should return audit logs for org and child orgs', async () => {
      const mockChildOrgs = [
        { id: 'child-org-1', parentId: 'org-123' },
        { id: 'child-org-2', parentId: 'org-123' },
      ];
      const mockLogs = [{ id: 'log-1', action: 'login' }];

      orgRepo.find.mockResolvedValue(mockChildOrgs as any);
      auditRepo.find.mockResolvedValue(mockLogs as any);

      const result = await service.findByOrganization('org-123');

      expect(orgRepo.find).toHaveBeenCalledWith({ where: { parentId: 'org-123' } });
      expect(auditRepo.find).toHaveBeenCalledWith(expect.objectContaining({
        relations: ['user', 'organization', 'task'],
        order: { createdAt: 'DESC' },
      }));
      expect(result).toEqual(mockLogs);
    });
  });
});

