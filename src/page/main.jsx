import React, { useState, useEffect, useContext, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import moment from "moment";
import "emoji-mart/css/emoji-mart.css";
import { Picker } from "emoji-mart";
import useOnClickOutside from "./../hook/useOnClickOutside";
import { WsContext } from "./../App";
import { stringify, TypeMap, RetinaRegex } from "./../util";
const map = new TypeMap().map;

const Main = (props) => {
  const { logoutSuccess } = props;
  const [message, setMessage] = useState('');
  const [showEmojiBox, setShowEmojiBox] = useState(false);
  const [imageValue, setImageValue] = useState('');
  const [messageQueue, setMessageQueue] = useState([]);
  const ws = useContext(WsContext);
  const messageEnd = useRef(null);
  const inputRef = useRef(null);
  const pickerRef = useRef(null);
  const fileRef = useRef(null);
  const dispatch = useDispatch();
  const state = useSelector(state => state.updateData);
  const userList = state.userList;
  const messageList = state.messageList;
  const userInfo = state.userInfo;
  const liveMessage = state.liveMessage;

  // 发送消息
  const sendMessage = () => {
    ws.send(stringify({
      type: map.get('SEND_MESSAGE'),
      data: {
        id: userInfo.id,
        userName: userInfo.name,
        content: message,
        messageType: 'content',
      },
    }));
    setMessage('');
  }

  // 接收实时消息
  useEffect(() => {
    if (!liveMessage) return;
    const type = liveMessage.type === 'msg'
      ? (userInfo.name === liveMessage.userName ? 'myMsg' : 'otherMsg')
      : liveMessage.type;
    setMessageQueue(list => [
      ...list,
      { ...liveMessage, type },
    ]);
    if (liveMessage.messageType === 'image') {
      const image = new Image();
      image.src = liveMessage.content;
      image.onload = () => scrollToBottom();
    }
  }, [liveMessage, userInfo])

  // 获取历史数据
  useEffect(() => {
    if (messageList?.length) {
      setMessageQueue(
        [
          ...messageList.map(item => {
            const type = item.type === 'msg'
              ? (userInfo.name === item.userName ? 'myMsg' : 'otherMsg')
              : item.type;
            return {  ...item, type };
          }),
          {
            ...userInfo,
            content: '仅可查看50条历史消息',
            type: 'info',
          }
        ]
      );
    }
  }, [messageList, userInfo])

  // 滚动到底部
  const scrollToBottom = () => {
    if (messageEnd?.current) messageEnd.current.scrollTop = messageEnd.current.scrollHeight;
  }

  useEffect(() => {
    scrollToBottom();
  }, [messageQueue])

  // 聚焦input
  const focus = () => {
    inputRef.current && inputRef.current.focus();
  }

  // 选择表情包
  const choiceEmoji = (emoji, event) => {
    event.stopPropagation();
    setMessage(msg => `${msg}${emoji.native}`);
    setShowEmojiBox(false);
    focus();
  }

  // 点击其他区域关闭表情包盒子
  useOnClickOutside(pickerRef, () => {
    if (showEmojiBox) setShowEmojiBox(false);
  });

  // 处理Retina屏幕下Chrome浏览器emoji重叠问题
  const dealEmoji = (val) => {
    if (!val) return '';
    return val.replace(RetinaRegex, (emoji) => {
      return `<span class="emoji">${emoji}</span>`;
    });
  }

  // 上传图片
  const openFile = () => {
    if (fileRef?.current) fileRef.current.click();
  }
  const choiceImage = (e) => {
    const files = e.target.files;
    if (!files.length) return;
    if (files[0].type.indexOf('image/') === -1) return;

    const fileReader = new FileReader();
    fileReader.readAsDataURL(files[0]);
    setImageValue('');
    fileReader.onload = () => {
      ws.send(stringify({
        type: map.get('SEND_MESSAGE'),
        data: {
          id: userInfo.id,
          userName: userInfo.name,
          content: fileReader.result,
          messageType: 'image',
        },
      }));
    }
  }

  // 退出登录
  const layout = () => {
    ws.send(stringify({
      type: map.get('LOGOUT'),
      data: userInfo,
    }));
    logoutSuccess();
    dispatch({ type: 'USER_INFO', userInfo: undefined });
    localStorage.setItem('userInfo', '');
  }

  return (
    <section className="box">
      <div className="menu">
        <p className="menu-title">在线成员（{userList.length}）</p>
        <ul className="user-list">
          {
            userList.map(
              (item, index) => {
                const avatar = require(`./../assets/avatar/${item.id}.webp`).default;
                return <li key={index} className="user-item">
                  <img src={avatar} alt="" />
                  <span>{item.name}</span>
                </li>
              }
            )
          }
        </ul>
      </div>
      <div className="conetnt">
        <ul className="header">
          <li className="header-title">群聊({userList.length})</li>
          <li className="layout" onClick={layout}>登出</li>
        </ul>
        <ul className="msg" ref={messageEnd}>
          {
            messageQueue.map((item, index) => {
              const avatar = require(`./../assets/avatar/${item.id}.webp`).default;
              const isMyMsg = item.type === 'myMsg';
              const isOtherMsg = item.type === 'otherMsg';
              return <li key={index}>
                {
                  item.type === 'info' && <p className="info">{item.userName} {item.content}</p>
                }
                {
                  ['myMsg', 'otherMsg'].includes(item.type) && (
                    <div className={isMyMsg ? 'my-msg' : 'other-msg'}>
                      { isOtherMsg && <img className="avatar-circle" src={avatar} alt="" /> }
                      <ul>
                        <li className={isMyMsg ? 'time tr' : 'time tl'}>
                          {item.userName} （{moment(item.time).format('MM-DD HH:mm:ss')}）
                        </li>
                        {
                          item.messageType === 'content'
                            ? (
                              <li className={isMyMsg ? 'content my-content' : 'content'}>
                                <p className={isMyMsg ? 'triangle my-triangle' : 'triangle'}></p>
                                <span dangerouslySetInnerHTML={{__html: dealEmoji(item.content)}}></span>
                              </li>
                            )
                            : <img className="img-msg" src={item.content} alt="" />
                        }
                      </ul>
                      { isMyMsg && <img className="avatar-circle" src={avatar} alt="" /> }
                    </div>
                  )
                }
              </li>
            })
          }
        </ul>
        <div className="send">
          <div className="toolbar">
            <i className="iconfont mr8" onClick={() => setShowEmojiBox(true)}>&#xe638;</i>
            <i className="iconfont" onClick={openFile}>&#xec7f;</i>
            <input
              ref={fileRef}
              type="file"
              name="file"
              value={imageValue}
              accept=".jpg,.jpeg,.gif,.png,.svg,.webp"
              style={{display: "none"}}
              onChange={choiceImage}
            />
            {
              showEmojiBox && (
                <Picker
                  innerRef={pickerRef}
                  set="apple"
                  color="#0757a6"
                  useButton={false}
                  showPreview={false}
                  showSkinTones={false}
                  include={['people']}
                  style={{ position: 'absolute', bottom: '45px', left: '-50px' }}
                  onClick={choiceEmoji}
                />
              )
            }
          </div>
          <div className="msgbox">
            <textarea
              id="msgbox"
              ref={inputRef}
              placeholder="请输入聊天内容"
              value={message}
              onChange={e => setMessage(e.target.value)}
              onKeyDown={e => {
                const ctrlKey = e.ctrlKey || e.metaKey;
                if (ctrlKey && e.key === 'Enter') sendMessage();
              }}
            />
          </div>
          <div className="action">
            <span className="action-desc">按 CTRL+ENTER 发送</span>
            <button className="send-btn" onClick={sendMessage}>发送</button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Main;
