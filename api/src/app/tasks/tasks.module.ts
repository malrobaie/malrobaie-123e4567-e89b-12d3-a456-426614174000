import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from '../../entities/task.entity';
import { Organization } from '../../entities/organization.entity';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { AuditModule } from '../audit/audit.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Task, Organization]),
        AuditModule,
    ],
    providers: [TasksService],
    controllers: [TasksController],
    exports: [TasksService], // so Auth/Audit can use it later if needed
})
export class TasksModule { }