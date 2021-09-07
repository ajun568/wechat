import { parse, stringify } from './../util';
import store from './../store/store';
import { TypeMap } from './../util';

const map = new TypeMap().map;

class Ws {
  constructor (url) {
    this.ws = new WebSocket(url);
  }

  initWs() {
    // 连接成功, 开始通讯
    this.ws.onopen = () => {
      this.send(stringify({ type: map.get('LOGIN') }));
    }

    // 客户端接收服务端发送的消息
    this.ws.onmessage = (event) => {
      const data = parse(event.data);
      switch (map.get(data.type.toString())) {
        case 'USER_INFO':
          getUserInfo(data);
          break;
        case 'UPDATE_PEOPLE_NUM':
          updatePeopleNum(data);
          break;
        case 'UPDATE_USER_LIST':
          updateUserList(data);
          break;
        case 'UPDATE_MESSAGE_LIST':
          updateMEssageList(data);
          break;
      }
    }

    // 连接关闭后的回调函数
    this.ws.onclose = (event) => {
      console.log('已断开连接', event)
    }

    // 捕获错误
    this.ws.onerror = () => {
      console.log('出错了');
    }
  }

  close() {
    this.send(stringify({ type: map.get('LOGOUT') }));
    this.ws.close();
  }

  send(data) {
    this.ws.send(data);
  }
}

// 获取当前用户信息
const getUserInfo = (data) => {
  if (data.code !== 0) {
    const times = store.getState().userInfo?.times;
    store.dispatch({
      type: 'USER_INFO',
      userInfo: { times: times ? times + 1 : 1 },
    });
  } else {
    store.dispatch({
      type: 'USER_INFO',
      userInfo: data.data,
    });
  }
}

// 更新在线人数
const updatePeopleNum = (data) => {
  store.dispatch({
    type: 'UPDATE_PEOPLE_NUM',
    peopleNum: data.data.peopleNum,
  });
}

// 更新成员列表
const updateUserList = (data) => {
  store.dispatch({
    type: 'UPDATE_USER_LIST',
    userList: data.data,
  });
}

// 更新消息列表
const updateMEssageList = (data) => {
  store.dispatch({
    type: 'UPDATE_MESSAGE_LIST',
    messageList: data.data,
  });
}

export default Ws;
