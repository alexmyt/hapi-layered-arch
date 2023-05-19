import { JwtPayload } from 'jsonwebtoken';
import { ValidationResult } from 'hapi-auth-jwt2';
import { Request, ResponseToolkit, Lifecycle } from '@hapi/hapi';

import IBaseService from '../common/base.service.interface';

declare module '@hapi/hapi' {
  interface UserCredentials {
    id: number | string;
    email: string;
  }
}

export type JwtPair = { accessToken: string; refreshToken: string };

export default interface IAuthService extends IBaseService {
  authenticate: (decoded: JwtPayload) => Promise<ValidationResult>;
  authorize: (req: Request, h: ResponseToolkit) => Promise<Lifecycle.ReturnValue>;
  newJwtPair: (payload: JwtPayload) => JwtPair;
  refreshTokens: (refreshToken: string) => Promise<JwtPair | Error>;
}
