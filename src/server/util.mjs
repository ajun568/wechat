export const parse = (data) => JSON.parse(data);
export const stringify = (data) => JSON.stringify(data);

export const TypeMap = {
  1: 'LOGIN', // 用户登录
  2: 'LOGOUT', // 用户登出
  3: 'ADD_USER', // 增加用户
  4: 'USER_INFO', // 用户信息

  10: 'UPDATE_PEOPLE_NUM', // 更新在线人数
  11: 'UPDATE_USER_LIST', // 更新用户列表
  12: 'UPDATE_MESSAGE_LIST', // 更新消息列表
  13: 'SEND_MESSAGE', // 客户端向服务端发送消息
  14: 'BROADCAST_MESSAGE', // 服务端向客户端发送单条消息

  20: 'PING', // 心跳 client -> server
  21: 'PONG', // 心跳 server -> client
  23: 'TASK', // 定时任务, 刷新用户列表
  24: 'REPLY', // 客户端回复定时任务
}
