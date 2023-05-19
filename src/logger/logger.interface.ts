export default interface ILogger {
  logger: unknown;
  log: (...args) => void;
  info: (...args) => void;
  warn: (...args) => void;
  error: (...args) => void;
}
