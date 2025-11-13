import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

import { TasksModule } from '../tasks/tasks.module';
import { TasksService } from '../tasks/tasks.service';
import { TasksController } from '../tasks/tasks.controller';

import { AuditModule } from '../audit/audit.module';

@Module({
  providers: [AuthService, TasksService],
  controllers: [AuthController, TasksController],
  imports: [TasksModule, AuditModule],
})
export class AuthModule {}
