import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../app/auth/auth.module';
import { UsersModule } from '../app/users/users.module';
import { TasksModule } from '../app/tasks/tasks.module';
import { AuditModule } from '../app/audit/audit.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'db.sqlite',
      autoLoadEntities: true,
      synchronize: true,
    }),
    AuthModule,
    UsersModule,
    TasksModule,
    AuditModule,
  ],
})
export class AppModule { }
