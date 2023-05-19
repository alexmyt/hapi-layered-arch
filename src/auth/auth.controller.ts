import { inject, injectable } from 'inversify';
import { ServerRoute, Request, ResponseToolkit, ResponseObject } from '@hapi/hapi';
import Joi from 'joi';

import TYPES from '../ioc/types';
import APIError from '../errors/api-error';
import BaseController from '../common/base.controller';
import { ILogger } from '../logger';

import IAUthController from './auth.controller.interface';
import AuthService from './auth.service';

@injectable()
export default class AuthController extends BaseController implements IAUthController {
  routes: ServerRoute[];

  constructor(
    @inject(TYPES.Logger) logger: ILogger,
    @inject(TYPES.AuthService) private authService: AuthService,
  ) {
    super(logger);

    this.routes = [
      {
        method: 'POST',
        path: '/auth/token',
        handler: this.token,
        options: {
          validate: {
            payload: Joi.object({ refreshToken: Joi.string() }),
          },
          auth: false,
        },
      },
    ];
  }

  private async token(
    { payload }: Request<{ Payload: { refreshToken: string } }>,
    h: ResponseToolkit,
  ): Promise<ResponseObject> {
    const result = await this.authService.refreshTokens(payload.refreshToken);

    if (result instanceof Error) {
      throw new APIError('USER_LOGIN_FAILED');
    }

    return h.response(result);
  }
}
