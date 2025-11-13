import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToMany,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';
import { Membership } from './membership.entity';
import { Task } from './task.entity';
import { AuditLog } from './audit-log.entity';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ unique: true })
    email!: string;

    @Column()
    name!: string;

    @Column({ default: true })
    isActive!: boolean;

    @OneToMany(() => Membership, (m: Membership) => m.user)
    memberships!: Membership[];

    @OneToMany(() => Task, (t: Task) => t.assignee)
    assignedTasks!: Task[];

    @OneToMany(() => Task, (t: Task) => t.createdBy)
    createdTasks!: Task[];

    @OneToMany(() => AuditLog, (log: AuditLog) => log.actor)
    auditLogs!: AuditLog[];

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
