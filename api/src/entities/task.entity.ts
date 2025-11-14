import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';
// Using string-based relations to avoid circular dependency issues
// import { User } from './user.entity';
// import { Organization } from './organization.entity';

@Entity('tasks')
export class Task {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column()
    title!: string;

    @Column({ type: 'text', nullable: true })
    description!: string | null;

    @Column({ type: 'text', nullable: true })
    category!: string | null;

    // Use lazy-loaded function references to avoid ESM "Cannot access 'User' before initialization"
    @ManyToOne(() => require('./user.entity').User, (user: any) => user.createdTasks, {
        onDelete: 'CASCADE',
    })
    createdBy!: any;

    @ManyToOne(() => require('./user.entity').User, (user: any) => user.assignedTasks, {
        nullable: true,
        onDelete: 'SET NULL',
    })
    assignee!: any | null;

    @ManyToOne(() => require('./organization.entity').Organization, (org: any) => org.tasks, {
        onDelete: 'CASCADE',
    })
    organization!: any;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}

