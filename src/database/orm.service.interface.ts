export default interface IORMService {
  initialize: () => Promise<void>;
  disconnect: () => Promise<void>;
}
