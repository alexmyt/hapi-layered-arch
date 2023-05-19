import { Boom } from '@hapi/boom';

type APIErrorDescription = { statusCode: number; isPublic: boolean; message: string };
type APIErrors = Record<string, APIErrorDescription>;

const apiErrors = {
  USER_LOGIN_FAILED: { statusCode: 401, isPublic: true, message: 'User login failed' },
  USER_ALREADY_EXISTS: { statusCode: 422, isPublic: true, message: 'User already exists' },
  USER_NOT_FOUND: { statusCode: 404, isPublic: false, message: 'User not found' },
} satisfies APIErrors;

type APIErrorType = keyof typeof apiErrors;

export default class APIError extends Boom {
  public isPublic: boolean;

  constructor(message: APIErrorType, statusCode = 500, isPublic = true) {
    super(undefined, {
      statusCode: apiErrors[message].statusCode ?? statusCode,
      data: { errorCode: message },
    });

    this.isPublic = apiErrors[message].isPublic || isPublic;

    if (this.isPublic) {
      this.output.payload.errorCode = message;
      this.output.payload.message = apiErrors[message].message || message;
    }
  }
}
