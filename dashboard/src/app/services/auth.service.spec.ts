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

  it('should login successfully and store token', (done) => {
    const mockResponse = {
      accessToken: 'test-token',
      user: {
        id: '123',
        email: 'test@example.com',
        displayName: 'Test User',
        role: 'admin',
        organizationId: 'org-123'
      }
    };

    service.login('test@example.com', 'password123').subscribe(() => {
      expect(localStorage.getItem('task_mgmt_token')).toBe('test-token');
      expect(service.currentUser()?.email).toBe('test@example.com');
      expect(service.isLoggedIn()).toBe(true);
      expect(router.navigate).toHaveBeenCalledWith(['/tasks']);
      done();
    });

    const req = httpMock.expectOne('http://localhost:3000/api/auth/login');
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });

  it('should logout and clear token', () => {
    localStorage.setItem('task_mgmt_token', 'test-token');
    service.logout();
    
    expect(localStorage.getItem('task_mgmt_token')).toBeNull();
    expect(service.currentUser()).toBeNull();
    expect(service.isLoggedIn()).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should check if user is admin', () => {
    service.currentUser.set({
      id: '123',
      email: 'admin@test.com',
      role: 'admin',
      organizationId: 'org-123'
    });

    expect(service.isAdmin()).toBe(true);
  });

  it('should check if user is not admin', () => {
    service.currentUser.set({
      id: '123',
      email: 'viewer@test.com',
      role: 'viewer',
      organizationId: 'org-123'
    });

    expect(service.isAdmin()).toBe(false);
  });

  it('should return token from localStorage', () => {
    localStorage.setItem('task_mgmt_token', 'test-token');
    expect(service.getToken()).toBe('test-token');
  });

  it('should return null if no token exists', () => {
    localStorage.removeItem('task_mgmt_token');
    expect(service.getToken()).toBeNull();
  });
});

