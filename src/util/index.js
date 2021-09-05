export const parse = (data) => JSON.parse(data);
export const stringify = (data) => JSON.stringify(data);

const Type = {
  1: 'LOGIN',
  2: 'LOGOUT',
  3: 'ADD_USER',
  4: 'USER_INFO',

  10: 'UPDATE_PEOPLE_NUM',
};

export class TypeMap extends Map {
  constructor () {
    super();
    this.map = this.deal();
  }

  deal() {
    const map = new Map();
    const BiMap = (key, value) => {
      map.set(key, value);
      map.set(value, key);
    }
    for (let key in Type) {
      BiMap(key, Type[key]);
    }
    return map;
  }
}
