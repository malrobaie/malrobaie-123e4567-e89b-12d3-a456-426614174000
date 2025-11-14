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
import * as bcrypt from 'bcrypt';

async function seed(dataSource: DataSource) {
  const userRepo = dataSource.getRepository(User);

  const userCount = await userRepo.count();
  if (userCount > 0) {
    Logger.log('🌱 Seed skipped — users already exist');
    return;
  }

  Logger.log('🌱 Seeding initial users...');

  const passwordHash = await bcrypt.hash('password123', 10);

  await userRepo.save([
    {
      email: 'owner@example.com',
      passwordHash,
    },
    {
      email: 'admin@example.com',
      passwordHash,
    },
    {
      email: 'viewer@example.com',
      passwordHash,
    },
  ]);


  Logger.log('🌱 Seeding completed');
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
