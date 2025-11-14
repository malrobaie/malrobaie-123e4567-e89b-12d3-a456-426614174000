import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLog } from '../../entities/audit-log.entity';
import { Organization } from '../../entities/organization.entity';
import { AuditService } from './audit.service';
import { AuditController } from './audit.controller';

@Module({
  imports: [TypeOrmModule.forFeature([AuditLog, Organization])],
  providers: [AuditService],
  controllers: [AuditController],
  exports: [AuditService], // Export so other modules can use it
})
export class AuditModule {}
