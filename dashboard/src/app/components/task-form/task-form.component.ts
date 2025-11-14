import { Component, Input, Output, EventEmitter, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Task, CreateTaskDto, UpdateTaskDto } from '../../models/task.model';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './task-form.component.html',
  styleUrl: './task-form.component.css'
})
export class TaskFormComponent implements OnInit {
  @Input() task: Task | null = null;
  @Output() save = new EventEmitter<CreateTaskDto | UpdateTaskDto>();
  @Output() cancel = new EventEmitter<void>();

  taskForm: FormGroup;
  isSubmitting = signal(false);

  constructor(private fb: FormBuilder) {
    this.taskForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      category: ['Work'],
      status: ['pending']
    });
  }

  ngOnInit(): void {
    if (this.task) {
      this.taskForm.patchValue({
        title: this.task.title,
        description: this.task.description || '',
        category: this.task.category || 'Work',
        status: this.task.status || 'pending'
      });
    }
  }

  onSubmit(): void {
    if (this.taskForm.invalid) {
      return;
    }

    this.isSubmitting.set(true);
    const formValue = this.taskForm.value;
    
    this.save.emit(formValue);
  }

  onCancel(): void {
    this.cancel.emit();
  }

  get title() {
    return this.taskForm.get('title');
  }
}

