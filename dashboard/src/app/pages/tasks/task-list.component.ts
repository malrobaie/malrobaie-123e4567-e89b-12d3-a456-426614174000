import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaskService } from '../../services/task.service';
import { AuthService } from '../../services/auth.service';
import { TaskFormComponent } from '../../components/task-form/task-form.component';
import { Task, CreateTaskDto, UpdateTaskDto } from '../../models/task.model';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, FormsModule, TaskFormComponent],
  templateUrl: './task-list.component.html',
  styleUrl: './task-list.component.css'
})
export class TaskListComponent implements OnInit {
  selectedCategory = signal<string>('all');
  sortBy = signal<string>('date');
  showForm = signal(false);
  editingTask = signal<Task | null>(null);
  isLoading = signal(true);

  constructor(
    public taskService: TaskService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks(): void {
    this.isLoading.set(true);
    this.taskService.getTasks().subscribe({
      next: () => {
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading tasks:', error);
        this.isLoading.set(false);
      }
    });
  }

  filteredAndSortedTasks = computed(() => {
    let tasks = this.taskService.tasks();
    
    // Filter by category
    const category = this.selectedCategory();
    if (category !== 'all') {
      tasks = tasks.filter(t => t.category === category);
    }
    
    // Sort
    const sortBy = this.sortBy();
    return [...tasks].sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'category':
          return (a.category || '').localeCompare(b.category || '');
        case 'date':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });
  });

  categories = computed(() => {
    const tasks = this.taskService.tasks();
    const uniqueCategories = new Set(tasks.map(t => t.category).filter(c => c));
    return ['all', ...Array.from(uniqueCategories)];
  });

  openCreateForm(): void {
    this.editingTask.set(null);
    this.showForm.set(true);
  }

  openEditForm(task: Task): void {
    this.editingTask.set(task);
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
    this.editingTask.set(null);
  }

  onSaveTask(taskData: CreateTaskDto | UpdateTaskDto): void {
    const editingTask = this.editingTask();
    
    if (editingTask) {
      // Update existing task
      this.taskService.updateTask(editingTask.id, taskData as UpdateTaskDto).subscribe({
        next: () => {
          this.closeForm();
        },
        error: (error) => {
          console.error('Error updating task:', error);
          alert('Failed to update task');
        }
      });
    } else {
      // Create new task
      this.taskService.createTask(taskData as CreateTaskDto).subscribe({
        next: () => {
          this.closeForm();
        },
        error: (error) => {
          console.error('Error creating task:', error);
          alert('Failed to create task');
        }
      });
    }
  }

  deleteTask(task: Task): void {
    if (!confirm(`Delete "${task.title}"?`)) {
      return;
    }

    this.taskService.deleteTask(task.id).subscribe({
      error: (error) => {
        console.error('Error deleting task:', error);
        alert('Failed to delete task');
      }
    });
  }

  getStatusBadgeClass(status?: string | null): string {
    switch (status) {
      case 'completed': return 'badge-completed';
      case 'in-progress': return 'badge-progress';
      default: return 'badge-pending';
    }
  }

  logout(): void {
    this.authService.logout();
  }
}

