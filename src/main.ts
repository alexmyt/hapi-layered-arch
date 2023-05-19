import 'reflect-metadata';

import TYPES from './ioc/types';
import container from './ioc/inversify.config';
import App from './app';

interface IBootstrapReturnType {
  app: App;
}

function bootstrap(): IBootstrapReturnType {
  const app = container.get<App>(TYPES.Application);
  app.start();

  return { app };
}

process.on('unhandledRejection', (err) => {
  // eslint-disable-next-line no-console
  console.log(err);
});

bootstrap();
