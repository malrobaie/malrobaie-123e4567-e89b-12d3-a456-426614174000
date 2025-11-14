/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */
import 'reflect-metadata';

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { DataSource } from 'typeorm';
import { User } from './entities/user.entity';
import { Organization } from './entities/organization.entity';
import { Membership } from './entities/membership.entity';
import { Task } from './entities/task.entity';
import { Role } from '@turbovets-task-manager/data';
import * as bcrypt from 'bcrypt';

async function seed(dataSource: DataSource) {
  const userRepo = dataSource.getRepository(User);
  const orgRepo = dataSource.getRepository(Organization);
  const membershipRepo = dataSource.getRepository(Membership);
  const taskRepo = dataSource.getRepository(Task);

  const userCount = await userRepo.count();
  if (userCount > 0) {
    Logger.log('🌱 Seed skipped — users already exist');
    return;
  }

  Logger.log('🌱 Seeding database...');

  const passwordHash = await bcrypt.hash('password123', 10);

  // Create Organizations (2-level hierarchy)
  const techCorp = await orgRepo.save({
    name: 'TechCorp',
    parentId: null,
  });

  const techCorpSales = await orgRepo.save({
    name: 'TechCorp Sales',
    parentId: techCorp.id,
  });

  const financeInc = await orgRepo.save({
    name: 'FinanceInc',
    parentId: null,
  });

  // Create Users
  const ownerUser = await userRepo.save({
    email: 'owner@techcorp.com',
    passwordHash,
    displayName: 'Tech Owner',
  });

  const adminUser = await userRepo.save({
    email: 'admin@techcorp.com',
    passwordHash,
    displayName: 'Tech Admin',
  });

  const viewerUser = await userRepo.save({
    email: 'viewer@techcorp.com',
    passwordHash,
    displayName: 'Tech Viewer',
  });

  const financeAdmin = await userRepo.save({
    email: 'admin@finance.com',
    passwordHash,
    displayName: 'Finance Admin',
  });

  // Create Memberships (User-Organization-Role)
  await membershipRepo.save([
    {
      user: ownerUser,
      organization: techCorp,
      role: Role.OWNER,
    },
    {
      user: adminUser,
      organization: techCorp,
      role: Role.ADMIN,
    },
    {
      user: viewerUser,
      organization: techCorp,
      role: Role.VIEWER,
    },
    {
      user: financeAdmin,
      organization: financeInc,
      role: Role.ADMIN,
    },
  ]);

  // Create Sample Tasks
  await taskRepo.save([
    {
      title: 'Complete Q4 Report',
      description: 'Finalize quarterly financial report',
      category: 'Work',
      organization: techCorp,
      createdBy: adminUser,
      assignee: adminUser,
    },
    {
      title: 'Review Sales Pipeline',
      description: 'Analyze sales opportunities for next quarter',
      category: 'Work',
      organization: techCorpSales,
      createdBy: adminUser,
      assignee: viewerUser,
    },
    {
      title: 'Team Building Event',
      description: 'Organize team building activity',
      category: 'Personal',
      organization: techCorp,
      createdBy: ownerUser,
      assignee: null,
    },
  ]);

  Logger.log('🌱 Seeding completed successfully');
  Logger.log('   📊 Organizations: TechCorp (parent), TechCorp Sales (child), FinanceInc');
  Logger.log('   👥 Users: owner@techcorp.com, admin@techcorp.com, viewer@techcorp.com, admin@finance.com');
  Logger.log('   🔑 Password: password123');
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Access the TypeORM data source from Nest
  const dataSource = app.get(DataSource);

  // Run seed once
  await seed(dataSource);

  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  const port = process.env.PORT || 3000;
  await app.listen(port);

  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`
  );
}

bootstrap();
