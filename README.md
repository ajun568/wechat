# wechat

## 启动

前端：yarn start

服务端：node index.mjs (server目录下)

## 前言

本文新手向, 意在熟悉 **WebSocket** 及其应用；全篇由两部分构成：前半部分实现该简易聊天室并将其部署至服务器，后半部分则具体聊一聊 **WebSocket** 并顺带谈谈 **SSE**。

**项目演示地址** [https://chat.deeruby.com](https://chat.deeruby.com/)

**双手奉上代码链接** [传送门 - ajun568](https://github.com/ajun568/wechat)

**双脚奉上最终效果图**

![chat1.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/628231cd998d4052985292a118cd2d7d~tplv-k3u1fbpfcp-watermark.image)

![chat3.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/dbf24471d12245b7b0b69ad92bf4f076~tplv-k3u1fbpfcp-watermark.image)

![chat2.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/1958113b48c4447d9ebe8608bd0d142a~tplv-k3u1fbpfcp-watermark.image)

## 功能实现

👺 需求描述：可发送表情及图片的群聊功能

👺 项目采用：**React Hook + Redux + Nodejs + WebSocket** 实现，无数据库

👺 样式参考：[嗨信聊天](http://healen.herokuapp.com/)、[微信网页版](https://wx.qq.com/)

如若各位看官对 **Redux** 不够了解，可跳转至笔者的另一篇文章 [Redux在React Hook中的使用及其原理](https://juejin.cn/post/6921219584309592072#heading-0)，欢迎留言指教。

### 如何使用WebSocket

🦥 **客户端**

[WebSocket - 文档](https://developer.mozilla.org/zh-CN/docs/Web/API/WebSocket)

🦅 以下为本文所需知识点：

* 创建 WebSocket 连接 -> `new WebSocket(url)`

*  常量 `CONNECTING -> 0`、`OPEN -> 1`、`CLOSING -> 2`、`CLOSED -> 3`

*  `WebSocket.onopen` -> 连接成功，开始通讯

*  `WebSocket.onmessage` -> 客户端接收服务端发送的消息

*  `WebSocket.onclose` -> 连接关闭后的回调函数

*  `WebSocket.onerror` -> 连接失败后的回调函数

*  `WebSocket.readyState` -> 当前的连接状态

*  `WebSocket.close` -> 关闭当前连接

*  `WebSocket.send` -> 客户端向服务端发送消息

🦅 我们来创建一个 Ws 类，用于处理所有通讯事件

```js
class Ws {
  constructor (url) {
    this.ws = new WebSocket(url);
  }

  initWs() {
    this.ws.onopen = () => {}
    this.ws.onmessage = (event) => {}
    this.ws.onclose = (event) => {}
    this.ws.onerror = () => {}
  }

  close() {
    this.ws.close();
  }

  send(data) {
    if (this.ws.readyState === this.ws.OPEN) {
      this.ws.send(data);
    }
  }
}
```

🦥 **服务端**

这里使用ws与客户端通讯：[ws - 文档](https://www.npmjs.com/package/ws)

🦅 服务端代码如下

```js
import express from "express";
import WebSocket, { WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 8080 });
const app = express();

const send = (ws, data) => { // 向客户端发送消息
  ws.send(JSON.stringify(data));
}

const broadcast = (data) => { // 向所有客户端广播消息
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      send(client, data);
    }
  });
}

wss.on('open', () => { // 连接成功的回调函数
  console.log('connected');
});

wss.on('close', () => { // 连接关闭的回调函数
  console.log('disconnected');
});

wss.on('connection', (ws) => { 
  ws.on('message', (message) => {
    // 接收客户端发的消息
  });
});

app.listen(3000, () => {
  console.log('Start Service On 3000');
});
```

🦥 **调试**

❓ 如何在浏览器中看到 **WebSocket** 请求

🦅 我们打开控制台，选择 **Network** 下的 **WS**，即可看到通讯情况

![chat7.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/06f01179d3784117963e94caa6788942~tplv-k3u1fbpfcp-watermark.image)

### 登录

因未连接数据库，判断若输入的用户名不在成员列表中，则新建用户，否则报错。头像上随机了50张图片，未考虑人数超过50的情况。

![login1.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/1756424044904797aa69919549d7259e~tplv-k3u1fbpfcp-watermark.image?)

我们在 **localstorage** 中存入用户信息，若下次打开时该用户名未被占用，则直接登录。

登录后服务端回传用户信息及成员列表，回传后的数据用 **Redux** 存储。

![login2.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/fac99bf2ba6741db8d732e018642358c~tplv-k3u1fbpfcp-watermark.image?)


### 聊天

🦥 聊天即一个互相通讯的过程，各种情况前文均已涉及，不再赘述，这里说说我们具体要做些什么。

当有新用户进入时，推送xxx进入群聊。

聊天时，向服务端发送消息及用户信息，服务端将此消息广播；若接收到的消息与当前用户名一致，视为我方消息，以此规则显示消息列表。

服务端存储50条历史消息已备刷新页面展示。

每次接收新消息后，将显示区域滚动至底部。

![talk1.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/368bab0240a54697aa9399c4ff335106~tplv-k3u1fbpfcp-watermark.image?)

### 发送表情

emoji 表情选用了 [emoji-mart](https://github.com/missive/emoji-mart) 插件，基础结构如下所示：

![emoji1.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/746557c8d51047c58a304446243f3d26~tplv-k3u1fbpfcp-watermark.image?)

点击 icon 时显示 emoji 盒子，点击其余区域关闭 emoji 盒子，点击其余区域的 **自定义Hook** 如下：

![emoji2.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/f93af6c62ce34085ae388f34d928c4d5~tplv-k3u1fbpfcp-watermark.image?)

选择表情后，将其拼接至输入框中并聚焦。

![emoji3.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/05a3a0ec305d4d8497e45aaa04a33264~tplv-k3u1fbpfcp-watermark.image?)

Retina 屏幕下 Chrome 浏览器的 emoji 会与文字重叠，可拼接 span 标签做样式处理。

```js
// 匹配 emoji 的正则表达式
export const RetinaRegex = /(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|[\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|[\ud83c[\ude32-\ude3a]|[\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/g;
```

```css
/* 样式适配 */
@media
not screen and (-webkit-min-device-pixel-ratio: 2),
not screen and (min--moz-device-pixel-ratio: 2),
not screen and (-o-min-device-pixel-ratio: 2/1),
not screen and (min-device-pixel-ratio: 2),
not screen and (min-resolution: 192dpi),
not screen and (min-resolution: 2dppx) {
  .emoji {
    margin: 0 5px 0 0;
  }
}
```

![emoji4.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/b1c24c907cc5442fa3229de4362cec94~tplv-k3u1fbpfcp-watermark.image?)

### 发送图片

我们使用 [`<input type="file">`](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/Input/file) 进行文件上传，仅接受图片格式，基础结构如下所示：

![file1.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/7b7320d7493a4a2eaf0513f557541c48~tplv-k3u1fbpfcp-watermark.image?)

点击 icon 时打开上传框；然后我们简单处理，使用 [FileReader](https://developer.mozilla.org/zh-CN/docs/Web/API/FileReader) 读取计算机中的文件，将选择的文件转换成 base64 格式进行上传；记得清空 input，否则同名图片不可上传。

![file2.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e39ac0d2ec984ab9904007d80f9b4b62~tplv-k3u1fbpfcp-watermark.image?)

因图片加载有延迟，接收消息滚动至底部时，会出现只显示一部分图片的情况，我们在图片加载完后，在进行一次滚动至底部的操作。

![file3.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/274542d2a0bc4ce3bd5b8655611ee759~tplv-k3u1fbpfcp-watermark.image?)

### 断线重连与心跳检测

当刷新浏览器或关闭浏览器时，应断开与服务端的连接。

![heart1.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/7b10109b7ea946bcbfb9afd7ef44cfe0~tplv-k3u1fbpfcp-watermark.image?)

**断线重连**

若浏览器与服务器断开连接，则进行重连，我们每 5s 重连一次，重连一定次数依旧不能成功，则断开连接。连接成功后将 limit 限制重置。

![heart2.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/dcecbbafa5fd40cfb5cf3bb2f7012f65~tplv-k3u1fbpfcp-watermark.image?)

**心跳检测**

心跳检测是客户端与服务端约定一个规则进行通讯，如若在一定时间内收不到对方的消息，则连接断开，需进行重连。由于各浏览器机制不同，触发 onclose 时机也不同，故我们需要心跳检测来补充断线重连的逻辑。

![heart3.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/851ae452ffca4131b5e48df568fd2e2b~tplv-k3u1fbpfcp-watermark.image?)

因断线后需更新在线人员列表，删除不在线的成员，笔者在服务端加了个定时任务去与客户端通讯，客户端若回复则该成员在线，否则离线。该处理方式比较生硬，大家可自行优化。

## 浅谈 WebSocket

### 什么是 WebSocket ?

是一种协议，用于客户端与服务端相互通讯。协议的标识符为 **ws**，加密则为 **wss**。

```http
wss://api.chat.deeruby.com
```

### 为什么使用 WebSocket ?

在传统的 HTTP 协议中，通讯只能由客户端发起，服务端无法主动向客户端推送消息，需通过轮询方式让客户端自行获取，效率极低。

### WebSocket 连接是如何创建的?

🦅 WebSocket 并不是全新协议，而是利用 HTTP 协议来建立连接，故此连接需从浏览器发起，格式如下：

```http
GET wss://api.chat.deeruby.com/ HTTP/1.1
Host: api.chat.deeruby.com
Connection: Upgrade
Upgrade: websocket
Origin: https://chat.deeruby.com
Sec-WebSocket-Version: 13
Sec-WebSocket-Key: dsRxU8oSxU2Jru9hOgf4dg==
```

* 请求头`Upgrade: websocket`和`Connection: Upgrade`表示这个连接将要被转换为 **WebSocket** 连接。

* `Sec-WebSocket-Version`指定了 **WebSocket** 的协议版本，如果服务端不支持该版本，需要返回一个`Sec-WebSocket-Version`header，里面包含服务端支持的版本号。

* `Sec-WebSocket-Key`与服务端`Sec-WebSocket-Accept`配套，用于标识连接。

🦅 随后，服务器若接受该请求，则做如下反应：

```http
HTTP/1.1 101 Switching Protocols 
Connection: upgrade 
Upgrade: websocket 
Sec-WebSocket-Accept: aAO8QyaRJEYUX2yG+pTEwRQK04w=
```

* 响应码 **101** 表示本次连接的 **HTTP** 协议将被更改，更改为 `Upgrade: websocket` 指定的 **WebSocket** 协议。

* `Sec-WebSocket-Accep` 是将 `Sec-WebSocket-Key` 跟 `258EAFA5-E914-47DA-95CA-C5AB0DC85B11` 拼接，通过 **SHA1** 计算并转换为 **base64** 字符串。

## 浅谈SSE

### 什么是SSE ?

**SSE 全称：Server-Sent Events**

**SSE** 使用 **HTTP**协议，而 **HTTP** 协议无法由服务器主动推送消息，但有一种变通方式，即服务端向客户端声明，接下来发送的为流信息。其为一个连续发送的数据流，而不是一个一次性的数据包，故客户端不会关闭连接，而是一直等服务器发送新的数据流。**SSE** 就是通过这种机制，使用流信息向浏览器推送消息。

### 什么场景选用SSE ?

只需要服务器给客户端发送消息的场景时，SSE可胜任。

### Demo

详细用法还请诸位看官自行查看文档，这里只写一个将服务端与客户端连接起来的小🌰Demo，客户端使用 **EventSource** 接收, 文档如下：[EventSource](https://developer.mozilla.org/en-US/docs/Web/API/EventSource)

![sse2.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/28e95db6a479412ca5b4e091b206ef5b~tplv-k3u1fbpfcp-watermark.image?)

**如何调试 ?**

打开控制台，**Network** 下的 **XHR**，**EventStream** 部分看数据

![sse1.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/cda87667382e4608bac280dacf4545d5~tplv-k3u1fbpfcp-watermark.image?)


## 参考🔗链接

[[程序猿小卡] WebSocket：5分钟从入门到精通](https://github.com/SheetJS/sheetjs#writing-options)

[[廖雪峰] WebSocket](https://www.liaoxuefeng.com/wiki/1022910821149312/1103303693824096)

[[阮一峰] Server-Sent Events 教程](http://www.ruanyifeng.com/blog/2017/05/server-sent_events.html)

