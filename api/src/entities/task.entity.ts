import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Organization } from './organization.entity';

@Entity('tasks')
export class Task {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column()
    title!: string;

    @Column({ type: 'text', nullable: true })
    description!: string | null;

    @ManyToOne(() => User, (u: User) => u.createdTasks, { onDelete: 'CASCADE' })
    createdBy!: User;

    @ManyToOne(() => User, (u: User) => u.assignedTasks, {
        nullable: true,
        onDelete: 'SET NULL',
    })
    assignee!: User | null;

    @ManyToOne(() => Organization, (org: Organization) => org, {
        onDelete: 'CASCADE',
    })
    organization!: Organization;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
