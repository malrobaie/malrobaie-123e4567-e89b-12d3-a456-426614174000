import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Task, CreateTaskDto, UpdateTaskDto } from '../models/task.model';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private readonly API_URL = 'http://localhost:3000/api';
  
  tasks = signal<Task[]>([]);

  constructor(private http: HttpClient) {}

  getTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.API_URL}/tasks`)
      .pipe(
        tap(tasks => this.tasks.set(tasks))
      );
  }

  createTask(task: CreateTaskDto): Observable<Task> {
    return this.http.post<Task>(`${this.API_URL}/tasks`, task)
      .pipe(
        tap(newTask => {
          this.tasks.update(tasks => [...tasks, newTask]);
        })
      );
  }

  updateTask(id: string, task: UpdateTaskDto): Observable<Task> {
    return this.http.put<Task>(`${this.API_URL}/tasks/${id}`, task)
      .pipe(
        tap(updatedTask => {
          this.tasks.update(tasks => 
            tasks.map(t => t.id === id ? updatedTask : t)
          );
        })
      );
  }

  deleteTask(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/tasks/${id}`)
      .pipe(
        tap(() => {
          this.tasks.update(tasks => tasks.filter(t => t.id !== id));
        })
      );
  }
}

