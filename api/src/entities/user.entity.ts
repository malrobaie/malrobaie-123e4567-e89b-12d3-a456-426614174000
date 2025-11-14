import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    OneToMany,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';
// Using string-based relations to avoid circular dependency issues
// import { Organization } from './organization.entity';
// import { Task } from './task.entity';
// import { AuditLog } from './audit-log.entity';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ unique: true })
    email!: string;

    @Column()
    passwordHash!: string;

    @Column({ type: 'text', nullable: true })
    displayName!: string | null;

    @ManyToOne(() => require('./organization.entity').Organization, (org: any) => org.users, {
        nullable: true,
        onDelete: 'SET NULL',
    })
    organization!: any | null;

    @OneToMany(() => require('./task.entity').Task, (task: any) => task.createdBy)
    createdTasks!: any[];

    @OneToMany(() => require('./task.entity').Task, (task: any) => task.assignee)
    assignedTasks!: any[];

    @OneToMany(() => require('./audit-log.entity').AuditLog, (log: any) => log.user)
    auditLogs!: any[];

    @OneToMany(() => require('./membership.entity').Membership, (membership: any) => membership.user)
    memberships!: any[];

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
