import { inject, injectable } from 'inversify';
import {
  ServerRoute,
  ServerRegisterPluginObject,
  Request,
  ResponseToolkit,
  ResponseObject,
} from '@hapi/hapi';

import TYPES from '../ioc/types';
import { ILogger } from '../logger';
import BaseController from '../common/base.controller';
import APIError from '../errors/api-error';
import IAuthService from '../auth/auth.service.interface';

import IUsersController from './users.controller.interface';
import UserRegisterDTO from './dto/user.register.dto';
import UserLoginDTO from './dto/user.login.dto';
import userSchema from './users.schema';
import IUsersService from './users.service.interface';

@injectable()
export default class UsersController extends BaseController implements IUsersController {
  routes: ServerRoute[];

  plugins: ServerRegisterPluginObject<unknown>[];

  constructor(
    @inject(TYPES.Logger) logger: ILogger,
    @inject(TYPES.UsersService) private usersService: IUsersService,
    @inject(TYPES.AuthService) private authService: IAuthService,
  ) {
    super(logger);

    this.routes = [
      {
        path: '/users/register',
        method: 'POST',
        handler: this.register,
        options: {
          validate: { payload: userSchema.register },
          auth: false,
        },
      },
      {
        path: '/users/login',
        method: 'POST',
        handler: this.login,
        options: {
          validate: { payload: userSchema.login },
          auth: false,
        },
      },
      {
        path: '/users/{id}',
        method: 'GET',
        handler: this.info,
        options: {
          validate: { params: userSchema.info },
          auth: { strategy: 'jwt', scope: ['user:{params.id}'] },
        },
      },
    ];
  }

  public async register(
    { payload }: Request<{ Payload: UserRegisterDTO }>,
    res: ResponseToolkit,
  ): Promise<ResponseObject> {
    const result = await this.usersService.createUser(payload);
    if (!result) {
      throw new APIError('USER_ALREADY_EXISTS');
    }

    return res.response({ id: result.id, email: result.email, name: result.name });
  }

  public async login(
    { payload }: Request<{ Payload: UserLoginDTO }>,
    res: ResponseToolkit,
  ): Promise<ResponseObject> {
    const existedUser = await this.usersService.login(payload);
    if (!existedUser) {
      throw new APIError('USER_LOGIN_FAILED');
    }

    const tokens = this.authService.newJwtPair({ sub: existedUser.id?.toString() });

    return res.response({
      id: existedUser.id,
      email: existedUser.email,
      name: existedUser.name,
      ...tokens,
    });
  }

  public async info(
    { params }: Request<{ Params: { id: number } }>,
    res: ResponseToolkit,
  ): Promise<ResponseObject> {
    const result = await this.usersService.info(params.id);
    if (!result) {
      throw new APIError('USER_NOT_FOUND');
    }

    return res.response({
      id: result.id,
      email: result.email,
      name: result.name,
    });
  }
}
