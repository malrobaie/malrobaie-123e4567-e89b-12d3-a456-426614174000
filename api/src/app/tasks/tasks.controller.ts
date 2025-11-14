import { Controller, Get, Param, Post, Body, Patch, Delete } from '@nestjs/common';
import { TasksService } from './tasks.service';

@Controller('tasks')
export class TasksController {
    constructor(private readonly tasks: TasksService) { }

    @Get()
    getAll() {
        console.log('✅ GET /api/tasks - Fetching all tasks');
        return this.tasks.findAll();
    }

    @Get(':id')
    getOne(@Param('id') id: string) {
        console.log(`✅ GET /api/tasks/${id} - Fetching task by ID`);
        return this.tasks.findOne(id);
    }

    @Post()
    create(@Body() body: any) {
        console.log('✅ POST /api/tasks - Creating new task:', body);
        return this.tasks.create(body);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() body: any) {
        console.log(`✅ PATCH /api/tasks/${id} - Updating task:`, body);
        return this.tasks.update(id, body);
    }

    @Delete(':id')
    delete(@Param('id') id: string) {
        console.log(`✅ DELETE /api/tasks/${id} - Deleting task`);
        return this.tasks.remove(id);
    }
}
