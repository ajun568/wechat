import express from "express";
import WebSocket, { WebSocketServer } from "ws";
import { parse, stringify, TypeMap } from "./util.mjs";

const wss = new WebSocketServer({ port: 8080 });
const app = express();

let peopleNum = 0; // 在线人数
let userList = []; // 用户列表
let avatarList = [...Array(50).keys()].map(item => item + 1); // 可选头像列表
let messageList = []; // 消息列表 可查看历史50条消息

// send方法
const send = (ws, data) => {
  ws.send(stringify(data));
}

// 随机选取并删除数组元素
const rendomArr = (arr) => {
  return arr.splice(Math.floor(Math.random() * arr.length), 1);
}

// 广播
const broadcast = (data) => {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      send(client, data);
    }
  });
}

// 广播在线人数
const updatePeopleNum = () => {
  broadcast({
    type: 10,
    data: { peopleNum },
    code: 0,
  });
}

// 广播用户列表
const updateUserList = () => {
  broadcast({
    type: 11,
    data: userList,
    code: 0,
  });
}

// 广播消息列表
const updateMessageList = (ws) => {
  send(ws, {
    type: 12,
    data: messageList,
    code: 0,
  });
}

// 广播单条消息
const broadcastMessage = (data, type) => {
  broadcast({
    type: 14,
    data: {
      ...data,
      type,
      time: new Date().getTime(),
    },
    code: 0,
  });
}

// 发送用户信息
const sendUserInfo = (ws, userInfo) => {
  send(ws, {
    type: 4,
    data: userInfo,
    code: 0,
  });
}

const enterChat = (userInfo) => {
  const data = {
    ...userInfo,
    content: '进入群聊',
    messageType: 'content',
  }
  broadcastMessage(data, 'info');
}

// 用户登录
const login = (ws, data) => {
  const userInfo = { id: data.id, name: data.name };
  if (userList.find(item => item.name === data.name || item.id === data.id)) {
    sendUserInfo(ws, userInfo);
    updateUserList();
  } else {
    const findAvatarIndex = avatarList.findIndex(item => item === data.id);
    if (findAvatarIndex >= 0) {
      sendUserInfo(ws, userInfo);
      avatarList.splice(findAvatarIndex, 1);
      userList.push(userInfo);
      updateUserList();
      enterChat(userInfo);
    }
  }
  updateMessageList(ws);
}

// 用户登出
const logout = (ws, data) => {
  if (!data) return;
  avatarList.push(data.id);
  const findIndex = userList.findIndex(item => item.id === data.id);
  if (findIndex >= 0) {
    userList.splice(findIndex, 1);
    updateUserList();
  }
}

// 增加用户
const addUser = (ws, data) => {
  if (userList.find(item => item.name === data.name)) {
    send(ws, {
      type: 4,
      data: '当前用户名已被使用',
      code: -1,
    });
    return;
  }

  const userInfo = {
    id: rendomArr(avatarList)[0],
    name: data.name,
  };

  sendUserInfo(ws, userInfo);
  userList.push(userInfo);
  updateUserList();
  enterChat(userInfo);
  updateMessageList(ws);
}

// 广播消息
const sendMessage = (ws, data) => {
  messageList.push({
    type: 'msg',
    ...data,
    time: new Date().getTime(),
  });
  if (messageList.length > 50) {
    messageList.shift();
  }
  broadcastMessage(data, 'msg');
}

// 心跳检查
const heartbeat = (ws) => {
  send(ws, {
    type: 21,
    data: 'pong',
    code: 0,
  });
}

wss.on('open', () => {
  console.log('connected');
});

wss.on('close', () => {
  console.log('disconnected');
});

wss.on('connection', (ws) => { 
  ws.on('message', (message) => {
    const { type, data } = parse(message);

    switch (TypeMap[type]) {
      case 'LOGIN':
        login(ws, data);
        break;
      case 'LOGOUT':
        logout(ws, data);
        break;
      case 'ADD_USER':
        addUser(ws, data);
        break;
      case 'SEND_MESSAGE':
        sendMessage(ws, data);
        break;
      case 'PING':
        heartbeat(ws);
        break;
      default:
        break;
    }
  });
});

app.listen(3000, () => {
  console.log('Start Service On 3000');
});
