import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

const Main = () => {
  const peopleNum = useSelector(state => state.updateData.peopleNum);
  const [user, setUser] = useState({});
  const [userList, setUserList] = useState([
    {
      id: 3,
      userName: '黄刀小五'
    }
  ]);
  const [messageList, setMessageList] = useState([
    {
      type: 'info',
      id: 3,
      content: '黄刀小五 进入群聊',
      userName: '黄刀小五',
      time: '',
    },
    {
      type: 'info',
      id: 3,
      content: '二狗子 进入群聊',
      userName: '二狗子',
      time: '',
    },
    {
      type: 'myMsg',
      id: 3,
      content: '黄刀小五 进入群聊',
      userName: '黄刀小五',
      time: '13:38:59',
    },
    {
      type: 'myMsg',
      id: 3,
      content: '黄刀小五 进入群聊',
      userName: '黄刀小五',
      time: '13:38:59',
    },
    {
      type: 'otherMsg',
      id: 17,
      content: '二狗子 进入群聊',
      userName: '二狗子',
      time: '13:39:03',
    }
  ]);

  return (
    <section className="box">
      <div className="menu">
        <p className="menu-title">在线成员（{peopleNum}）</p>
        <ul>
          {
            userList.map(
              (item, index) => {
                const avatar = require(`./../assets/avatar/${item.id}.webp`).default;
                return <li key={index} className="user-item">
                  <img src={avatar} alt="" />
                  <span>{item.userName}</span>
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
        <ul className="msg">
          {
            messageList.map((item, index) => {
              const avatar = require(`./../assets/avatar/${item.id}.webp`).default;
              return <li key={index}>
                {
                  item.type === 'info' && <p className="info">{item.content}</p>
                }
                {
                  item.type === 'myMsg' && (
                    <div className="my-msg">
                      <ul>
                        <li className="time tr">{item.userName} （{item.time}）</li>
                        <li className="content my-content">
                          <p className="triangle my-triangle"></p>
                          <span>{item.content}</span>
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
                        <li className="time tl">{item.userName} （{item.time}）</li>
                        <li className="content">
                          <p className="triangle"></p>
                          <span>{item.content}</span>
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
            <i className="iconfont mr8">&#xe638;</i>
            <i className="iconfont mr8">&#xe600;</i>
            <i className="iconfont">&#xe605;</i>
          </div>
          <div className="msgbox">
            <textarea id="msgbox" placeholder="请输入聊天内容"></textarea>
          </div>
          <div className="action">
            <span className="action-desc">按 CTRL+ENTER 发送</span>
            <button className="send-btn">发送</button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Main;
