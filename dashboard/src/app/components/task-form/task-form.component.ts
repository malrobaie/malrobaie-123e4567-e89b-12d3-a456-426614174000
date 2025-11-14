import { Component, Input, Output, EventEmitter, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Task, CreateTaskDto, UpdateTaskDto, ChecklistItem } from '../../models/task.model';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './task-form.component.html',
  styleUrl: './task-form.component.css'
})
export class TaskFormComponent implements OnInit {
  @Input() task: Task | null = null;
  @Output() save = new EventEmitter<CreateTaskDto | UpdateTaskDto>();
  @Output() cancel = new EventEmitter<void>();

  taskForm: FormGroup;
  isSubmitting = signal(false);
  checklist: ChecklistItem[] = [];
  newChecklistItem = signal('');

  constructor(private fb: FormBuilder) {
    this.taskForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      category: ['Work'],
      status: ['todo']
    });
  }

  ngOnInit(): void {
    if (this.task) {
      this.taskForm.patchValue({
        title: this.task.title,
        description: this.task.description || '',
        category: this.task.category || 'Work',
        status: this.task.status || 'todo'
      });
      this.checklist = this.task.checklist ? [...this.task.checklist] : [];
    }
  }

  onSubmit(): void {
    if (this.taskForm.invalid) {
      return;
    }

    this.isSubmitting.set(true);
    const formValue = {
      ...this.taskForm.value,
      checklist: this.checklist.length > 0 ? this.checklist : undefined
    };
    
    this.save.emit(formValue);
  }

  onCancel(): void {
    this.cancel.emit();
  }

  addChecklistItem(): void {
    const text = this.newChecklistItem().trim();
    if (!text) {
      return;
    }

    const newItem: ChecklistItem = {
      id: crypto.randomUUID(),
      text: text,
      completed: false
    };

    this.checklist = [...this.checklist, newItem];
    this.newChecklistItem.set('');
  }

  removeChecklistItem(id: string): void {
    this.checklist = this.checklist.filter(item => item.id !== id);
  }

  get title() {
    return this.taskForm.get('title');
  }
}

