import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditService } from './audit.service';
import { AuditLog } from '../../entities/audit-log.entity';
import { Organization } from '../../entities/organization.entity';

describe('AuditService', () => {
    let service: AuditService;
    let auditLogRepo: jest.Mocked<Repository<AuditLog>>;
    let orgRepo: jest.Mocked<Repository<Organization>>;

    const mockOrg1 = { id: 'org-1', name: 'Org 1', parentId: null };
    const mockOrg2 = { id: 'org-2', name: 'Org 2', parentId: 'org-1' };
    const mockAuditLog = {
        id: 'log-1',
        action: 'login' as const,
        user: { id: 'user-1', email: 'test@example.com' },
        organization: mockOrg1,
        details: { timestamp: '2024-01-01T00:00:00Z' },
        createdAt: new Date(),
    };

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
        auditLogRepo = module.get(getRepositoryToken(AuditLog));
        orgRepo = module.get(getRepositoryToken(Organization));
    });

    describe('log', () => {
        it('should create and save audit log', async () => {
            const createdLog = { ...mockAuditLog };
            auditLogRepo.create.mockReturnValue(createdLog as any);
            auditLogRepo.save.mockResolvedValue(createdLog as any);

            const result = await service.log('login', 'user-1', 'org-1', null, { test: 'data' });

            expect(auditLogRepo.create).toHaveBeenCalledWith({
                action: 'login',
                user: { id: 'user-1' },
                organization: { id: 'org-1' },
                task: null,
                details: { test: 'data' },
            });
            expect(auditLogRepo.save).toHaveBeenCalledWith(createdLog);
            expect(result).toEqual(createdLog);
        });
    });

    describe('logLogin', () => {
        it('should log login event', async () => {
            const createdLog = { ...mockAuditLog };
            auditLogRepo.create.mockReturnValue(createdLog as any);
            auditLogRepo.save.mockResolvedValue(createdLog as any);

            await service.logLogin('user-1', 'org-1');

            expect(auditLogRepo.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    action: 'login',
                    user: { id: 'user-1' },
                    organization: { id: 'org-1' },
                    details: expect.objectContaining({
                        timestamp: expect.any(String),
                    }),
                }),
            );
        });
    });

    describe('logTaskCreation', () => {
        it('should log task creation event', async () => {
            const createdLog = { ...mockAuditLog, action: 'create_task' as const };
            auditLogRepo.create.mockReturnValue(createdLog as any);
            auditLogRepo.save.mockResolvedValue(createdLog as any);

            await service.logTaskCreation('user-1', 'org-1', 'task-1', 'New Task');

            expect(auditLogRepo.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    action: 'create_task',
                    task: { id: 'task-1' },
                    details: expect.objectContaining({
                        taskTitle: 'New Task',
                    }),
                }),
            );
        });
    });

    describe('logTaskUpdate', () => {
        it('should log task update event', async () => {
            const createdLog = { ...mockAuditLog, action: 'update_task' as const };
            auditLogRepo.create.mockReturnValue(createdLog as any);
            auditLogRepo.save.mockResolvedValue(createdLog as any);

            const changes = { title: { old: 'Old', new: 'New' } };
            await service.logTaskUpdate('user-1', 'org-1', 'task-1', changes);

            expect(auditLogRepo.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    action: 'update_task',
                    task: { id: 'task-1' },
                    details: expect.objectContaining({
                        changes,
                    }),
                }),
            );
        });
    });

    describe('logTaskDeletion', () => {
        it('should log task deletion event', async () => {
            const createdLog = { ...mockAuditLog, action: 'delete_task' as const };
            auditLogRepo.create.mockReturnValue(createdLog as any);
            auditLogRepo.save.mockResolvedValue(createdLog as any);

            await service.logTaskDeletion('user-1', 'org-1', 'task-1', 'Deleted Task');

            expect(auditLogRepo.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    action: 'delete_task',
                    task: { id: 'task-1' },
                    details: expect.objectContaining({
                        taskTitle: 'Deleted Task',
                    }),
                }),
            );
        });
    });

    describe('findByOrganization', () => {
        it('should return audit logs from organization and child organizations', async () => {
            orgRepo.find.mockResolvedValue([mockOrg2] as any);
            auditLogRepo.find.mockResolvedValue([mockAuditLog] as any);

            const result = await service.findByOrganization('org-1', 100);

            expect(orgRepo.find).toHaveBeenCalledWith({
                where: { parentId: 'org-1' },
            });
            expect(auditLogRepo.find).toHaveBeenCalledWith({
                where: {
                    organization: { id: expect.anything() },
                },
                relations: ['user', 'organization', 'task'],
                order: {
                    createdAt: 'DESC',
                },
                take: 100,
            });
            expect(result).toEqual([mockAuditLog]);
        });

        it('should respect limit parameter', async () => {
            orgRepo.find.mockResolvedValue([]);
            auditLogRepo.find.mockResolvedValue([]);

            await service.findByOrganization('org-1', 50);

            expect(auditLogRepo.find).toHaveBeenCalledWith(
                expect.objectContaining({
                    take: 50,
                }),
            );
        });
    });
});
