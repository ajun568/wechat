export const parse = (data) => JSON.parse(data);
export const stringify = (data) => JSON.stringify(data);

export const TypeMap = {
  1: 'LOGIN', // 用户登录
  2: 'LOGOUT', // 用户登出
  3: 'ADD_USER', // 增加用户
  4: 'USER_INFO', // 用户信息

  10: 'UPDATE_PEOPLE_NUM', // 更新在线人数
}
