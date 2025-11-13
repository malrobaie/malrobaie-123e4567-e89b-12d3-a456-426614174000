import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  Unique,
} from 'typeorm';
import { User } from './user.entity';
import { Organization } from './organization.entity';

// Keep Role here locally to avoid the tsconfig rootDir issue
export enum Role {
  Owner = 'Owner',
  Admin = 'Admin',
  Viewer = 'Viewer',
}

@Entity('memberships')
@Unique(['user', 'organization'])
export class Membership {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, (u: User) => u.memberships, { onDelete: 'CASCADE' })
  user!: User;

  @ManyToOne(() => Organization, (o: Organization) => o.memberships, {
    onDelete: 'CASCADE',
  })
  organization!: Organization;

  @Column({ type: 'text' })
  role!: Role;
}
