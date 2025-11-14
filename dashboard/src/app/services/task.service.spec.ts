import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TaskService } from './task.service';
import { Task } from '../models/task.model';

describe('TaskService', () => {
  let service: TaskService;
  let httpMock: HttpTestingController;

  const mockTask: Task = {
    id: '1',
    title: 'Test Task',
    description: 'Test Description',
    category: 'Work',
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TaskService]
    });

    service = TestBed.inject(TaskService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch tasks and update signal', (done) => {
    const mockTasks: Task[] = [mockTask];

    service.getTasks().subscribe(() => {
      expect(service.tasks()).toEqual(mockTasks);
      done();
    });

    const req = httpMock.expectOne('http://localhost:3000/api/tasks');
    expect(req.request.method).toBe('GET');
    req.flush(mockTasks);
  });

  it('should create a new task', (done) => {
    const newTask = {
      title: 'New Task',
      description: 'New Description',
      category: 'Personal'
    };

    service.createTask(newTask).subscribe(task => {
      expect(task).toEqual(mockTask);
      expect(service.tasks()).toContain(mockTask);
      done();
    });

    const req = httpMock.expectOne('http://localhost:3000/api/tasks');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(newTask);
    req.flush(mockTask);
  });

  it('should update an existing task', (done) => {
    service.tasks.set([mockTask]);
    const updatedTask = { ...mockTask, title: 'Updated Title' };

    service.updateTask('1', { title: 'Updated Title' }).subscribe(task => {
      expect(task.title).toBe('Updated Title');
      const tasks = service.tasks();
      expect(tasks.find(t => t.id === '1')?.title).toBe('Updated Title');
      done();
    });

    const req = httpMock.expectOne('http://localhost:3000/api/tasks/1');
    expect(req.request.method).toBe('PUT');
    req.flush(updatedTask);
  });

  it('should delete a task', (done) => {
    service.tasks.set([mockTask]);

    service.deleteTask('1').subscribe(() => {
      expect(service.tasks()).not.toContain(mockTask);
      expect(service.tasks().length).toBe(0);
      done();
    });

    const req = httpMock.expectOne('http://localhost:3000/api/tasks/1');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});

