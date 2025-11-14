import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';
// Using string-based relations to avoid circular dependency issues
// import { User } from './user.entity';
// import { Organization } from './organization.entity';
import { Role } from '@turbovets-task-manager/data';

@Entity('memberships')
@Unique(['user', 'organization'])
export class Membership {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // Use lazy-loaded function references to avoid ESM "Cannot access 'User' before initialization"
  @ManyToOne(() => require('./user.entity').User, (user: any) => user.memberships, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  user!: any;

  @ManyToOne(() => require('./organization.entity').Organization, (org: any) => org.memberships, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  organization!: any;

  @Column({ type: 'text', default: 'viewer' })
  role!: Role;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
