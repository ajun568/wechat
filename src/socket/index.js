import { parse, stringify } from "./../util";
import store from "./../store/store";
import { TypeMap } from "./../util";
import moment from "moment";

const map = new TypeMap().map;

class Ws {
  constructor (url) {
    this.ws = new WebSocket(url);

    // 断线重连
    this.url = url;
    this.lockReconnect = false;
    this.timer = null;
    this.limit = 0;

    // 心跳检测
    this.heartbeatTimer = null;
    this.receiveTimer = null;
  }

  initWs() {
    // 连接成功, 开始通讯
    this.ws.onopen = () => {
      this.checkHeartbeat();
      
      this.limit = 0;
      if (!localStorage.getItem('userInfo')) return;

      const userInfo = parse(localStorage.getItem('userInfo'));
      const diffTime = moment().diff(moment(userInfo.time), 'hours');
      const data = diffTime <= 24 ? userInfo : {};
      this.send(stringify({ type: map.get('LOGIN'), data }));
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
        case 'BROADCAST_MESSAGE':
          receiveMessage(data);
          break;
        case 'PONG':
          this.resetHeartbeat();
          break;
        case 'TASK':
          this.timedTask();
          break;
        default:
          break;
      }
    }

    // 连接关闭后的回调函数
    this.ws.onclose = (event) => {
      console.log('已断开连接', event);
      this.reconnect();
    }

    // 捕获错误
    this.ws.onerror = () => {
      console.log('出错了');
      this.reconnect();
    }
  }

  close() {
    this.send(stringify({ type: map.get('LOGOUT'), data: this.getUserInfo() }));
    this.ws.close();
  }

  send(data) {
    if (this.ws.readyState === this.ws.OPEN) {
      this.ws.send(data);
    }
  }

  reconnect() {
    if (this.lockReconnect) return;
    this.lockReconnect = true;
    
    clearTimeout(this.timer);
    if (this.limit < 12) {
      this.timer = setTimeout(() => {
        this.ws = new WebSocket(this.url);
        this.initWs();
        this.lockReconnect = false;
        this.limit += 1;
      }, 5000)
    }
  }

  checkHeartbeat() {
    this.ws.heartbeatTimer = setTimeout(() => {
      this.send(stringify({ type: map.get('PING'), data: 'ping' }));
      this.ws.receiveTimer = setTimeout(() => {
        this.ws.close();
      }, 20000);
    }, 20000);
  }

  resetHeartbeat() {
    this.ws.heartbeatTimer && clearTimeout(this.ws.heartbeatTimer);
    this.ws.receiveTimer && clearTimeout(this.ws.receiveTimer);
    this.checkHeartbeat();
  }

  timedTask() {
    this.send(stringify({ type: map.get('REPLY'), data: this.getUserInfo() }));
  }

  getUserInfo() {
    const userInfo = store.getState().updateData.userInfo;
    return userInfo?.id ? userInfo : undefined;
  }
}

// 获取当前用户信息
const getUserInfo = (data) => {
  if (data.code !== 0) {
    const userInfo = store.getState().updateData.userInfo;
    const times = userInfo?.times;
    store.dispatch({
      type: 'USER_INFO',
      userInfo: { times: times ? times + 1 : 1 },
    });
  } else {
    store.dispatch({
      type: 'USER_INFO',
      userInfo: data.data,
    });

    localStorage.setItem('userInfo', stringify({
      ...data.data,
      time: new Date(),
    }));
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

// 接收消息
const receiveMessage = (data) => {
  store.dispatch({
    type: 'UPDATE_MESSAGE',
    liveMessage: data.data,
  });
}

export default Ws;
