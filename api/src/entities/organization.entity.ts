import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
// Using string-based relations to avoid circular dependency issues
// import { User } from './user.entity';
// import { Task } from './task.entity';
// import { Membership } from './membership.entity';

@Entity('organizations')
export class Organization {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  name!: string;

  @OneToMany(() => require('./user.entity').User, (user: any) => user.organization)
  users!: any[];

  @OneToMany(() => require('./task.entity').Task, (task: any) => task.organization)
  tasks!: any[];

  @OneToMany(() => require('./membership.entity').Membership, (membership: any) => membership.organization)
  memberships!: any[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

