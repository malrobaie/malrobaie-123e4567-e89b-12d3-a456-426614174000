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

  it('should have pre-filled admin credentials', () => {
    expect(component.loginForm.get('email')?.value).toBe('admin@techcorp.com');
    expect(component.loginForm.get('password')?.value).toBe('password123');
    expect(component.loginForm.valid).toBeTruthy();
  });

  it('should validate email field correctly', () => {
    const email = component.email;
    
    email?.setValue('');
    expect(email?.hasError('required')).toBeTruthy();

    email?.setValue('invalid-email');
    expect(email?.hasError('email')).toBeTruthy();

    email?.setValue('valid@example.com');
    expect(email?.valid).toBeTruthy();
  });

  it('should validate password field correctly', () => {
    const password = component.password;
    
    password?.setValue('');
    expect(password?.hasError('required')).toBeTruthy();

    password?.setValue('12345');
    expect(password?.hasError('minlength')).toBeTruthy();

    password?.setValue('password123');
    expect(password?.valid).toBeTruthy();
  });

  it('should call authService.login with form values', () => {
    authService.login.mockReturnValue(of(undefined));

    component.loginForm.setValue({
      email: 'test@example.com',
      password: 'testpass123'
    });

    component.onSubmit();

    expect(authService.login).toHaveBeenCalled();
    const callArg = authService.login.mock.calls[0][0];
    expect(callArg.email).toBe('test@example.com');
    expect(callArg.password).toBe('testpass123');
  });

  it('should not submit invalid form', () => {
    component.loginForm.setValue({
      email: 'invalid-email',
      password: '123'
    });

    component.onSubmit();

    expect(authService.login).not.toHaveBeenCalled();
  });

  it('should handle login errors', () => {
    authService.login.mockReturnValue(throwError(() => ({
      status: 401,
      error: { message: 'Invalid credentials' }
    })));

    component.onSubmit();

    expect(component.errorMessage()).toBeTruthy();
  });
});

