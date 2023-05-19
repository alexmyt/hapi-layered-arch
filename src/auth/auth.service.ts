import hapiAuthJwt2 from 'hapi-auth-jwt2';
import Jwt, { JwtPayload } from 'jsonwebtoken';
import { inject, injectable } from 'inversify';
import {
  Lifecycle,
  Request,
  ResponseToolkit,
  Server,
  ServerRegisterPluginObject,
} from '@hapi/hapi';

import BaseService from '../common/base.service';
import TYPES from '../ioc/types';
import IUsersRepository from '../users/users.repository.interface';
import IConfigService from '../config/config.service.interface';

import IAuthService, { JwtPair } from './auth.service.interface';

@injectable()
export default class AuthService extends BaseService implements IAuthService {
  plugins: ServerRegisterPluginObject<unknown>[];

  private JWT_SECRET: string;

  private ACCESS_TOKEN_EXPIRATION: string | number;

  private REFRESH_TOKEN_EXPIRATION: string | number;

  constructor(
    @inject(TYPES.UsersRepository) private userRepository: IUsersRepository,
    @inject(TYPES.Config) private configService: IConfigService,
  ) {
    super();

    this.JWT_SECRET = this.configService.getOrThrow('JWT_SECRET');
    this.ACCESS_TOKEN_EXPIRATION = this.configService.get('ACCESS_TOKEN_EXPIRATION', '15m');
    this.REFRESH_TOKEN_EXPIRATION = this.configService.get('REFRESH_TOKEN_EXPIRATION', '2d');
    this.plugins = [{ plugin: hapiAuthJwt2 }];
  }

  public onRegisterPlugins = (app: Server): void => {
    const jwtStrategyOptions: hapiAuthJwt2.Options = {
      key: this.JWT_SECRET,
      validate: this.authenticate.bind(this),
      verifyOptions: { algorithms: ['HS256'] },
    };
    app.auth.strategy('jwt', 'jwt', jwtStrategyOptions);

    app.ext({ type: 'onCredentials', method: this.authorize.bind(this) });
  };

  async authenticate(decoded: JwtPayload): Promise<hapiAuthJwt2.ValidationResult> {
    const existedUser = await this.userRepository.findById(Number(decoded.sub));
    if (!existedUser) {
      return { isValid: false };
    }

    return {
      isValid: true,
      credentials: { user: { id: existedUser.id, email: existedUser.email } },
    };
  }

  // eslint-disable-next-line class-methods-use-this
  async authorize(req: Request, h: ResponseToolkit): Promise<Lifecycle.ReturnValue> {
    if (req.auth.isAuthenticated && req.auth.credentials.user) {
      const { user } = req.auth.credentials;
      req.auth.credentials.scope = [`user:${user.id}`];
    }

    return h.continue;
  }

  newJwtPair(payload: JwtPayload): JwtPair {
    const accessToken = Jwt.sign(payload, this.JWT_SECRET, {
      expiresIn: this.ACCESS_TOKEN_EXPIRATION,
    });

    const refreshToken = Jwt.sign(payload, this.JWT_SECRET, {
      expiresIn: this.REFRESH_TOKEN_EXPIRATION,
    });

    return { accessToken, refreshToken };
  }

  async refreshTokens(refreshToken: string): Promise<JwtPair | Error> {
    try {
      const payload = Jwt.verify(refreshToken, this.JWT_SECRET);

      if (!payload || typeof payload === 'string') {
        throw new Jwt.JsonWebTokenError('Invalid refresh token');
      }

      delete payload.iat;
      delete payload.exp;
      delete payload.nbf;
      delete payload.jti;

      return this.newJwtPair(payload);
    } catch (e) {
      return e;
    }
  }
}
