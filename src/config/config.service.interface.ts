export type NoInferType<T> = [T][T extends unknown ? 0 : never];

export default interface IConfigService {
  get<T extends string | number>(path: string): T | undefined;
  get<T extends string | number>(path: string, defaultValue: NoInferType<T>): T;
  getOrThrow<T extends string | number>(path: string, defaultValue?: NoInferType<T>): T;
}
