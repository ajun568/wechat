import React, { useState, useEffect, useContext, useRef } from 'react';
import moment from 'moment';
import 'emoji-mart/css/emoji-mart.css';
import { Picker } from 'emoji-mart';
import { useSelector } from 'react-redux';
import { WsContext } from './../App';
import { stringify, TypeMap, RetinaRegex } from './../util';
import useOnClickOutside from './../hook/useOnClickOutside';
const map = new TypeMap().map;

const Main = () => {
  const [message, setMessage] = useState('');
  const [showEmojiBox, setShowEmojiBox] = useState(false);
  const [imageValue, setImageValue] = useState('');
  const ws = useContext(WsContext);
  const messageEnd = useRef(null);
  const inputRef = useRef(null);
  const pickerRef = useRef(null);
  const fileRef = useRef(null);
  const state = useSelector(state => state.updateData);
  const peopleNum = state.peopleNum;
  const userList = state.userList;
  const messageList = state.messageList;
  const userInfo = state.userInfo;

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
    setImageValue(''); // 清空图片, 使同名图片可继续上传
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
                        {
                          item.messageType === 'content'
                            ? (
                              <li className="content my-content">
                                <p className="triangle my-triangle"></p>
                                <span dangerouslySetInnerHTML={{__html: dealEmoji(item.content)}}></span>
                              </li>
                            )
                            : <img className="img-msg" src={item.content} />
                        }
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
                        {
                          item.messageType === 'content'
                            ? (
                              <li className="content">
                                <p className="triangle"></p>
                                <span dangerouslySetInnerHTML={{__html: dealEmoji(item.content)}}></span>
                              </li>
                            )
                            : <img className="img-msg" src={item.content} />
                        }
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
