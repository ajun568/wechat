import express from "express";
import WebSocket, { WebSocketServer } from "ws";
import { parse, stringify, TypeMap } from './util.mjs';

const wss = new WebSocketServer({ port: 8080 });
const app = express();

let peopleNum = 0; // 在线人数
let userList = []; // 用户列表
let avatarList = [...Array(50).keys()].map(item => item + 1); // 可选头像列表

// send方法
const send = (ws, data) => {
  ws.send(stringify(data));
}

// 随机选取并删除数组元素
const rendomArr = (arr) => {
  return arr.splice(Math.floor(Math.random() * arr.length), 1);
}

// 广播在线人数
const updatePeopleNum = () => {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      send(client, {
        type: 10,
        data: { peopleNum },
        code: 0,
      });
    }
  });
}

// 用户登录
const login = () => {
  peopleNum += 1;
  updatePeopleNum();
}

// 用户登出
const logout = () => {
  peopleNum -= 1;
  updatePeopleNum();
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

  send(ws, {
    type: 4,
    data: userInfo,
    code: 0,
  });

  userList.push(userInfo);
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
        login();
        break;
      case 'LOGOUT':
        logout();
        break;
      case 'ADD_USER':
        addUser(ws, data);
        break;
    }
  });
});

app.get('/', (req, res) => {
  res.send('<h1>服务器地址</h1>');
});

app.listen(3000, () => {
  console.log('Start Service On 3000');
});
