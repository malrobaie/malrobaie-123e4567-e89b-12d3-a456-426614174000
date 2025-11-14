import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
} from 'typeorm';
// Using string-based relations to avoid circular dependency issues
// import { User } from './user.entity';
// import { Task } from './task.entity';
// import { Organization } from './organization.entity';

export type AuditAction =
    | 'login'
    | 'create_task'
    | 'update_task'
    | 'delete_task';

@Entity('audit_logs')
export class AuditLog {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ManyToOne(() => require('./user.entity').User, (user: any) => user.auditLogs, {
        nullable: true,
        onDelete: 'SET NULL',
    })
    user!: any | null;

    @ManyToOne(() => require('./task.entity').Task, {
        nullable: true,
        onDelete: 'SET NULL',
    })
    task!: any | null;

    @ManyToOne(() => require('./organization.entity').Organization, {
        nullable: true,
        onDelete: 'SET NULL',
    })
    organization!: any | null;

    @Column({ type: 'text' })
    action!: AuditAction;

    @Column({ type: 'simple-json', nullable: true })
    details!: Record<string, unknown> | null;

    @CreateDateColumn()
    createdAt!: Date;
}

