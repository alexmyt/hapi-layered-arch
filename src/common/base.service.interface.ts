import { Server, ServerRegisterPluginObject } from '@hapi/hapi';

export default interface IBaseService {
  plugins?: ServerRegisterPluginObject<unknown>[];
  onRegisterPlugins?: (app: Server) => void;
}
