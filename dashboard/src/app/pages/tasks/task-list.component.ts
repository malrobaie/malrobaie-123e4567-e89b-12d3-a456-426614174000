import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CdkDragDrop, moveItemInArray, DragDropModule } from '@angular/cdk/drag-drop';
import { TaskService } from '../../services/task.service';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';
import { TaskFormComponent } from '../../components/task-form/task-form.component';
import { Task, CreateTaskDto, UpdateTaskDto } from '../../models/task.model';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, FormsModule, TaskFormComponent, DragDropModule],
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
    public authService: AuthService,
    public themeService: ThemeService
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

  filteredTasks = computed(() => {
    let tasks = this.taskService.tasks();
    
    // Filter by category
    const category = this.selectedCategory();
    if (category !== 'all') {
      tasks = tasks.filter(t => t.category === category);
    }
    
    return tasks;
  });

  todoTasks = computed(() => {
    const tasks = this.filteredTasks();
    return tasks
      .filter(t => !t.status || t.status === 'todo' || t.status === 'pending')
      .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  });

  inProgressTasks = computed(() => {
    const tasks = this.filteredTasks();
    return tasks
      .filter(t => t.status === 'in-progress')
      .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  });

  doneTasks = computed(() => {
    const tasks = this.filteredTasks();
    return tasks
      .filter(t => t.status === 'done' || t.status === 'completed')
      .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
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
          this.loadTasks(); // Reload tasks to get updated data
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
          this.loadTasks(); // Reload tasks to show new task
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

  onDrop(event: CdkDragDrop<Task[]>, newStatus: string): void {
    const task = event.item.data as Task;
    
    if (event.previousContainer === event.container) {
      // Reorder within same column
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      
      // Update sortOrder for all tasks in this column
      event.container.data.forEach((t, index) => {
        this.taskService.updateTask(t.id, { sortOrder: index }).subscribe();
      });
    } else {
      // Move between columns (status change)
      // Update status and sortOrder on backend first
      this.taskService.updateTask(task.id, { 
        status: newStatus,
        sortOrder: event.currentIndex
      }).subscribe({
        next: () => {
          // Reload all tasks to reflect changes
          this.loadTasks();
        },
        error: (error) => {
          console.error('Error updating task:', error);
          alert('Failed to move task');
          // Reload to revert changes
          this.loadTasks();
        }
      });
    }
  }

  getCompletionPercentage(task: Task): number {
    if (!task.checklist || task.checklist.length === 0) {
      return 0;
    }
    const completed = task.checklist.filter(item => item.completed).length;
    return (completed / task.checklist.length) * 100;
  }

  getCompletedCount(task: Task): number {
    if (!task.checklist) {
      return 0;
    }
    return task.checklist.filter(item => item.completed).length;
  }

  toggleChecklistItem(task: Task, itemId: string): void {
    if (!task.checklist) {
      return;
    }

    const updatedChecklist = task.checklist.map(item =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );

    this.taskService.updateTask(task.id, { checklist: updatedChecklist }).subscribe({
      next: () => {
        // Update the local task to trigger UI update
        this.loadTasks();
      },
      error: (error) => {
        console.error('Error updating checklist:', error);
        alert('Failed to update checklist');
      }
    });
  }
}

