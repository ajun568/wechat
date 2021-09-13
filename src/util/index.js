export const parse = (data) => JSON.parse(data);
export const stringify = (data) => JSON.stringify(data);

const Type = {
  1: 'LOGIN',
  2: 'LOGOUT',
  3: 'ADD_USER',
  4: 'USER_INFO',

  10: 'UPDATE_PEOPLE_NUM',
  11: 'UPDATE_USER_LIST',
  12: 'UPDATE_MESSAGE_LIST',
  13: 'SEND_MESSAGE',
  14: 'BROADCAST_MESSAGE',

  20: 'PING',
  21: 'PONG',
  23: 'TASK',
  24: 'REPLY',
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

export const RetinaRegex = /(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|[\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|[\ud83c[\ude32-\ude3a]|[\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/g;
