import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let router: any;

  beforeEach(() => {
    const routerSpy = {
      navigate: jest.fn()
    };

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthService,
        { provide: Router, useValue: routerSpy }
      ]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router) as any;
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should store token and user on successful login', (done) => {
    const mockResponse = {
      accessToken: 'test-token-123',
      user: {
        id: 'user-1',
        email: 'test@example.com',
        displayName: 'Test User',
        role: 'admin',
        organizationId: 'org-1'
      }
    };

    service.login({ email: 'test@example.com', password: 'password123' }).subscribe(() => {
      expect(localStorage.getItem('task_mgmt_token')).toBe('test-token-123');
      expect(service.currentUser()?.email).toBe('test@example.com');
      expect(service.currentUser()?.role).toBe('admin');
      done();
    });

    const req = httpMock.expectOne('http://localhost:3000/api/auth/login');
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });

  it('should clear token and user on logout', () => {
    localStorage.setItem('task_mgmt_token', 'test-token');
    service.currentUser.set({
      id: '1',
      email: 'test@example.com',
      role: 'admin',
      organizationId: 'org-1'
    });

    service.logout();

    expect(localStorage.getItem('task_mgmt_token')).toBeNull();
    expect(service.currentUser()).toBeNull();
  });

  it('should return token from localStorage', () => {
    localStorage.setItem('task_mgmt_token', 'my-token');
    expect(service.getToken()).toBe('my-token');
  });

  it('should return null when no token exists', () => {
    localStorage.removeItem('task_mgmt_token');
    expect(service.getToken()).toBeNull();
  });

  it('should identify admin users correctly', () => {
    service.currentUser.set({
      id: '1',
      email: 'admin@example.com',
      role: 'admin',
      organizationId: 'org-1'
    });

    expect(service.isAdmin()).toBe(true);
  });

  it('should identify non-admin users correctly', () => {
    service.currentUser.set({
      id: '1',
      email: 'viewer@example.com',
      role: 'viewer',
      organizationId: 'org-1'
    });

    expect(service.isAdmin()).toBe(false);
  });
});

