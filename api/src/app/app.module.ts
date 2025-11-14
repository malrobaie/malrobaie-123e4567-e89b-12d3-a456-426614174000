import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../app/auth/auth.module';
import { UsersModule } from '../app/users/users.module';
import { TasksModule } from '../app/tasks/tasks.module';
import { AuditModule } from '../app/audit/audit.module';
import { User } from '../entities/user.entity';
import { Organization } from '../entities/organization.entity';
import { Task } from '../entities/task.entity';
import { Membership } from '../entities/membership.entity';
import { AuditLog } from '../entities/audit-log.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'db.sqlite',
      entities: [User, Organization, Task, Membership, AuditLog],
      synchronize: true,
    }),
    AuthModule,
    UsersModule,
    TasksModule,
    AuditModule,
  ],
})
export class AppModule { }
