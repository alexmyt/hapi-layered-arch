import { Server, ServerRegisterPluginObject, ServerRoute } from '@hapi/hapi';

export default interface IBaseController {
  routes: ServerRoute[];
  plugins?: ServerRegisterPluginObject<unknown>[];
  onRegisterPlugins?: (app: Server) => void;
}
