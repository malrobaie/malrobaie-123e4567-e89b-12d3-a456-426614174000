import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { LoginComponent } from './login.component';
import { AuthService } from '../../services/auth.service';
import { of, throwError } from 'rxjs';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: any;

  beforeEach(async () => {
    const authServiceSpy = {
      login: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, LoginComponent],
      providers: [
        { provide: AuthService, useValue: authServiceSpy }
      ]
    }).compileComponents();

    authService = TestBed.inject(AuthService) as any;
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with invalid form', () => {
    expect(component.loginForm.valid).toBeFalsy();
  });

  it('should validate email field', () => {
    const email = component.email;
    expect(email?.valid).toBeFalsy();

    email?.setValue('invalid');
    expect(email?.hasError('email')).toBeTruthy();

    email?.setValue('test@example.com');
    expect(email?.valid).toBeTruthy();
  });

  it('should validate password field', () => {
    const password = component.password;
    expect(password?.valid).toBeFalsy();

    password?.setValue('123');
    expect(password?.hasError('minlength')).toBeTruthy();

    password?.setValue('password123');
    expect(password?.valid).toBeTruthy();
  });

  it('should call authService.login on valid form submission', () => {
    authService.login.mockReturnValue(of(undefined));

    component.loginForm.setValue({
      email: 'test@example.com',
      password: 'password123'
    });

    component.onSubmit();

    expect(authService.login).toHaveBeenCalledWith('test@example.com', 'password123');
    expect(component.isLoading()).toBe(false);
  });

  it('should not submit if form is invalid', () => {
    component.loginForm.setValue({
      email: 'invalid',
      password: '123'
    });

    component.onSubmit();

    expect(authService.login).not.toHaveBeenCalled();
  });

  it('should handle login error', () => {
    authService.login.mockReturnValue(throwError(() => ({
      error: { message: 'Invalid credentials' }
    })));

    component.loginForm.setValue({
      email: 'test@example.com',
      password: 'wrongpassword'
    });

    component.onSubmit();

    expect(component.isLoading()).toBe(false);
    expect(component.errorMessage()).toBe('Invalid credentials');
  });

  it('should pre-fill form with admin credentials', () => {
    expect(component.loginForm.get('email')?.value).toBe('admin@techcorp.com');
    expect(component.loginForm.get('password')?.value).toBe('password123');
  });
});

