import 'reflect-metadata';
import { Container } from 'inversify';

import TYPES from '../ioc/types';

import IUsersRepository from './users.repository.interface';
import IUsersService from './users.service.interface';
import UsersService from './users.service';
import User from './user.entity';
import UserRegisterDTO from './dto/user.register.dto';
import UserLoginDTO from './dto/user.login.dto';

const userRepositoryMock: IUsersRepository = {
  create: jest.fn(),
  findById: jest.fn(),
  findByEmail: jest.fn(),
  deleteById: jest.fn(),
  deleteByEmail: jest.fn(),
};

const container = new Container();
let userService: IUsersService;

beforeAll(() => {
  container.bind<IUsersService>(TYPES.UsersService).to(UsersService);
  container.bind<IUsersRepository>(TYPES.UsersRepository).toConstantValue(userRepositoryMock);

  userService = container.get(TYPES.UsersService);
});

describe('createUser function', () => {
  let userRepository: IUsersRepository;
  const userRegisterDTO: UserRegisterDTO = {
    email: 'test@test.com',
    name: 'John Doe',
    password: 'password123',
  };

  beforeEach(() => {
    userRepository = container.get(TYPES.UsersRepository);
  });

  it('should return null if user already exists', async () => {
    userRepository.findByEmail = jest.fn().mockResolvedValue({});

    const user = await userService.createUser(userRegisterDTO);

    expect(user).toBeNull();
    expect(userRepository.findByEmail).toHaveBeenCalledWith(userRegisterDTO.email);
    expect(userRepository.create).not.toHaveBeenCalled();
  });

  it('should create a new user if user does not exist', async () => {
    userRepository.findByEmail = jest.fn().mockResolvedValue(null);
    userRepository.create = jest.fn().mockImplementation((createdUser) => createdUser);
    const mockedSetPassword = jest.spyOn(User.prototype, 'setPassword');

    const user = await userService.createUser(userRegisterDTO);

    expect(user).not.toBeNull();
    expect(user?.email).toEqual(userRegisterDTO.email);
    expect(user?.name).toEqual(userRegisterDTO.name);
    expect(user?.password).not.toEqual(userRegisterDTO.password);
    expect(userRepository.findByEmail).toHaveBeenCalledWith(userRegisterDTO.email);
    expect(mockedSetPassword).toHaveBeenCalledWith(userRegisterDTO.password);

    mockedSetPassword.mockRestore();
  });
});

describe('login function', () => {
  let userRepository: IUsersRepository;

  const userLoginDTO: UserLoginDTO = {
    email: 'test@test.com',
    password: 'password123',
  };

  beforeEach(() => {
    userRepository = container.get(TYPES.UsersRepository);
  });

  it('should return null if user does not exists', async () => {
    userRepository.findByEmail = jest.fn().mockResolvedValue(null);

    const user = await userService.login(userLoginDTO);

    expect(user).toBeNull();
    expect(userRepository.findByEmail).toHaveBeenCalledWith(userLoginDTO.email);
  });

  it('should return null if comparePassword fails', async () => {
    userRepository.findByEmail = jest
      .fn()
      .mockResolvedValue({ comparePassword: jest.fn().mockResolvedValue(false) });

    const user = await userService.login(userLoginDTO);

    expect(user).toBeNull();
    expect(userRepository.findByEmail).toHaveBeenCalledWith(userLoginDTO.email);
  });

  it('should return user if comparePassword succeeds', async () => {
    userRepository.findByEmail = jest
      .fn()
      .mockResolvedValue({ comparePassword: jest.fn().mockResolvedValue(true) });

    const user = await userService.login(userLoginDTO);

    expect(user).not.toBeNull();
    expect(userRepository.findByEmail).toHaveBeenCalledWith(userLoginDTO.email);
  });
});
