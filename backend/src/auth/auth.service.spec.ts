import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AuthService } from './services/auth.service';
import { AuthSigningService } from './services/auth-signing.service';
import { AuthValidateService } from './services/auth-validate.service';
import { AuthRefreshService } from './services/auth-refresh.service';
import { User } from 'src/user/entities/user.entity';

describe('AuthService', () => {
  let service: AuthService;

  const mockSigning = {
    signTokens: jest.fn(),
    verifyAccess: jest.fn(),
    verifyRefresh: jest.fn(),
    bumpRefreshTokenVersion: jest.fn(),
  };
  const mockValidator = {
    validateUser: jest.fn(),
  };
  const mockRefresher = {
    refresh: jest.fn(),
  };
  const mockUserRepo = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: AuthSigningService, useValue: mockSigning },
        { provide: AuthValidateService, useValue: mockValidator },
        { provide: AuthRefreshService, useValue: mockRefresher },
        { provide: getRepositoryToken(User), useValue: mockUserRepo },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
