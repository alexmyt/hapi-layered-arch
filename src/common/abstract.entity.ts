/* eslint-disable no-underscore-dangle */

type EntityId = number;

export default abstract class AbstractEntity<T extends object> {
  protected readonly _id: EntityId;

  public readonly props: T;

  get id(): EntityId {
    return this._id;
  }

  constructor(props: T, id?: EntityId) {
    this.props = {} as T;

    // exclude 'id' from this.props
    Object.keys(props).forEach((property) => {
      if (property !== 'id') {
        this.props[property] = props[property];
      }
    });

    // eslint-disable-next-line @typescript-eslint/dot-notation
    this._id = id || props['id'];
  }
}
