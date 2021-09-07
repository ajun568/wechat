import React, { useState, useEffect, useContext, useRef } from 'react';
import moment from 'moment';
import 'emoji-mart/css/emoji-mart.css';
import { Picker } from 'emoji-mart';
import { useSelector } from 'react-redux';
import { WsContext } from './../App';
import { stringify, TypeMap } from './../util';
import useOnClickOutside from './../hook/useOnClickOutside';
const map = new TypeMap().map;

const Main = () => {
  const [message, setMessage] = useState('');
  const [showEmojiBox, setShowEmojiBox] = useState(false);
  const ws = useContext(WsContext);
  const messageEnd = useRef(null);
  const inputRef = useRef(null);
  const pickerRef = useRef(null);
  const state = useSelector(state => state.updateData);
  const peopleNum = state.peopleNum;
  const userList = state.userList;
  const messageList = state.messageList;
  const userInfo = state.userInfo;
  useOnClickOutside(pickerRef, () => {
    if (showEmojiBox) setShowEmojiBox(false)
  });

  // 发送消息
  const sendMessage = () => {
    ws.send(stringify({
      type: map.get('SEND_MESSAGE'),
      data: {
        id: userInfo.id,
        userName: userInfo.name,
        content: message,
      },
    }));
    setMessage('');
  }

  // 滚动到底部
  const scrollToBottom = () => {
    if (messageEnd?.current) messageEnd.current.scrollTop = messageEnd.current.scrollHeight;
  }

  useEffect(() => {
    scrollToBottom();
  }, [messageList])

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

  // 处理 Chrome 
  const dealEmoji = (val) => {
    if (!val) return '';
    return val.replace(/(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|[\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|[\ud83c[\ude32-\ude3a]|[\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/g, (emoji) => {
      return `<span class="emoji">${emoji}</span>`;
    })
  }

  return (
    <section className="box">
      <div className="menu">
        <p className="menu-title">在线成员（{peopleNum}）</p>
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
          <li className="header-title">群聊({peopleNum})</li>
          <li className="layout">登出</li>
        </ul>
        <ul className="msg" ref={messageEnd}>
          {
            messageList.map((item, index) => {
              const avatar = require(`./../assets/avatar/${item.id}.webp`).default;
              return <li key={index}>
                {
                  item.type === 'info' && <p className="info">{item.userName} {item.content}</p>
                }
                {
                  item.type === 'myMsg' && (
                    <div className="my-msg">
                      <ul>
                        <li className="time tr">{item.userName} （{moment(item.time).format('MM-DD HH:mm:ss')}）</li>
                        <li className="content my-content">
                          <p className="triangle my-triangle"></p>
                          <span dangerouslySetInnerHTML={{__html: dealEmoji(item.content)}}></span>
                        </li>
                      </ul>
                      <img className="avatar-circle" src={avatar} alt="" />
                    </div>
                  )
                }
                {
                  item.type === 'otherMsg' && (
                    <div className="other-msg">
                      <img className="avatar-circle" src={avatar} alt="" />
                      <ul>
                        <li className="time tl">{item.userName} （{moment(item.time).format('MM-DD HH:mm:ss')}）</li>
                        <li className="content">
                          <p className="triangle"></p>
                          <span dangerouslySetInnerHTML={{__html: dealEmoji(item.content)}}></span>
                        </li>
                      </ul>
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
            <i className="iconfont mr8">&#xe600;</i>
            <i className="iconfont">&#xe605;</i>
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
