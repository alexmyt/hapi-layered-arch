/* Prerequire: seed database from setup/setup.ts
 * Use this globally by adding "globalSetup: '<rootDir>/setup/setup.ts'" in jest.config
 */

import 'reflect-metadata';
import supertest, { SuperAgentTest } from 'supertest';

import TYPES from '../src/ioc/types';
import container from '../src/ioc/inversify.config';
import App from '../src/app';

const application = container.get<App>(TYPES.Application);

let superAgentTest: SuperAgentTest;

beforeAll(async () => {
  await application.start();
  superAgentTest = supertest.agent(application.app.listener);
});

afterAll(async () => application.stop());

describe('Register', () => {
  it('should create new user if not exists', async () => {
    const res = await superAgentTest
      .post('/users/register')
      .send({ email: 'a@a.ru', password: '1', name: 'name' });

    expect(res.statusCode).toBe(200);
  });

  it('should return error if user already exists', async () => {
    const res = await superAgentTest
      .post('/users/register')
      .send({ email: 'a@a.ru', password: '1', name: 'name' });

    expect(res.statusCode).toBe(422);
  });
});

describe('Login', () => {
  it('should return error if user not exists', async () => {
    const res = await superAgentTest.post('/users/login').send({ email: 'c@a.ru', password: '3' });

    expect(res.statusCode).toBe(401);
  });

  it('should return error if password is wrong', async () => {
    const res = await superAgentTest
      .post('/users/login')
      .send({ email: 'user1@dot.com', password: 'wrong' });

    expect(res.statusCode).toBe(401);
  });

  it('should return user Id and tokens when login is success', async () => {
    const email = 'user1@dot.com';
    const password = 'User1';

    const res = await superAgentTest.post('/users/login').send({ email, password });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty<number>('id');
    expect(res.body).toHaveProperty<string>('email', email);
    expect(res.body).toHaveProperty<string>('name');
    expect(res.body).toHaveProperty<string>('accessToken');
    expect(res.body).toHaveProperty<string>('refreshToken');
  });
});

describe('Authentication', () => {
  it('should not access to profile without authentication', async () => {
    const email = 'user1@dot.com';
    const password = 'User1';

    let res = await superAgentTest.post('/users/login').send({ email, password });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty<number>('id');

    const userId = res.body.id as number;

    res = await superAgentTest
      .get(`/users/${userId}`)
      .set('Authorization', 'Bearer some.bad.token');

    expect(res.statusCode).toBe(401);
  });

  it('should access to own profile with authentication tokens', async () => {
    const email = 'user1@dot.com';
    const password = 'User1';

    const login = await superAgentTest.post('/users/login').send({ email, password });

    expect(login.statusCode).toBe(200);
    expect(login.body).toHaveProperty<number>('id');
    expect(login.body).toHaveProperty<string>('accessToken');

    const userId = login.body.id as number;
    const accessToken = login.body.accessToken as string;

    const res = await superAgentTest
      .get(`/users/${userId}`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty<number>('id', userId);
    expect(res.body).toHaveProperty<string>('email', email);
  });

  it('should not access to other profile with authentication tokens', async () => {
    const user1Login = await superAgentTest
      .post('/users/login')
      .send({ email: 'user1@dot.com', password: 'User1' })
      .expect(200);

    const accessToken = user1Login.body.accessToken as string;

    const user2Login = await superAgentTest
      .post('/users/login')
      .send({ email: 'user2@dot.com', password: 'User2' })
      .expect(200);

    const res = await superAgentTest
      .get(`/users/${user2Login.body.id}`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.statusCode).toBe(403);
  });
});
