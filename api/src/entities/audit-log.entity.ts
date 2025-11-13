import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Task } from './task.entity';

export enum AuditAction {
    TASK_CREATED = 'TASK_CREATED',
    TASK_UPDATED = 'TASK_UPDATED',
    TASK_DELETED = 'TASK_DELETED',
    TASK_VIEWED = 'TASK_VIEWED',
    LOGIN = 'LOGIN',
    LOGOUT = 'LOGOUT',
}

@Entity('audit_logs')
export class AuditLog {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ManyToOne(() => User, (u) => u.auditLogs, {
        nullable: false,
        onDelete: 'CASCADE',
    })
    actor!: User;

    @ManyToOne(() => Task, {
        nullable: true,
        onDelete: 'SET NULL',
    })
    task?: Task | null;

    @Column({ type: 'text' })
    action!: AuditAction;

    // Arbitrary extra info (e.g. previous values, IP, etc.)
    @Column({ type: 'simple-json', nullable: true })
    meta?: Record<string, unknown> | null;

    @CreateDateColumn()
    createdAt!: Date;
}
