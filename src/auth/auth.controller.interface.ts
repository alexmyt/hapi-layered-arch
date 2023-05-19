import { ServerRoute } from '@hapi/hapi';

import IBaseController from '../common/base.controller.interface';

export default interface IAUthController extends IBaseController {
  routes: ServerRoute[];
}
