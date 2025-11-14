import { Route } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { TaskListComponent } from './pages/tasks/task-list.component';
import { authGuard } from './guards/auth.guard';

export const appRoutes: Route[] = [
  { path: 'login', component: LoginComponent },
  { 
    path: 'tasks', 
    component: TaskListComponent,
    canActivate: [authGuard]
  },
  { path: '', redirectTo: '/tasks', pathMatch: 'full' },
  { path: '**', redirectTo: '/tasks' }
];
