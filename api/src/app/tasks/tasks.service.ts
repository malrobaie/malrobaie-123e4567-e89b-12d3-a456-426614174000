import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from '../../entities/task.entity';

@Injectable()
export class TasksService {
    constructor(
        @InjectRepository(Task)
        private readonly taskRepo: Repository<Task>,
    ) { }

    // TODO: refine DTOs
    findAll() {
        return this.taskRepo.find({ relations: ['assignee', 'organization'] });
    }

    findOne(id: string) {
        return this.taskRepo.findOne({
            where: { id },
            relations: ['assignee', 'organization'],
        });
    }

    async create(data: Partial<Task>) {
        const task = this.taskRepo.create(data);
        return this.taskRepo.save(task);
    }

    async update(id: string, data: Partial<Task>) {
        // Load the existing task so relations stay consistent
        const existing = await this.taskRepo.findOne({
            where: { id },
            relations: ['assignee', 'createdBy', 'organization'],
        });

        if (!existing) {
            // you can also return null if you prefer
            throw new Error('Task not found');
        }

        // Merge the new fields into the existing entity
        const merged = this.taskRepo.merge(existing, data);

        // Save handles DeepPartial/relations cleanly
        return this.taskRepo.save(merged);
    }


    async remove(id: string) {
        await this.taskRepo.delete(id);
    }
}
