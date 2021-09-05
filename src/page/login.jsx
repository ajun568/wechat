import React, { useState, useContext, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { WsContext } from './../App';
import Message from './../components/Message';
import { stringify, TypeMap } from './../util';
const map = new TypeMap().map;

const Login = (props) => {
  const { loginSuccess } = props;
  const [show, setShow] = useState(false);
  const [message, setMessage] = useState('');
  const [userName, setUserName] = useState('');
  const ws = useContext(WsContext);
  const userInfo = useSelector(state => state.updateData.userInfo);

  const showMessage = () => {
    setShow(true);
    let timer = null;
    timer ? clearTimeout(timer) : timer = setTimeout(() => setShow(false), 3000);
  }

  const toLogin = () => {
    if (userName.trim() === '') {
      showMessage();
      setMessage('请填写用户名');
      return;
    }

    ws.send(stringify({
      type: map.get('ADD_USER'),
      data: { name: userName },
    }));
  }

  useEffect(() => {
    if (userInfo?.id) loginSuccess();
    if (userInfo?.times) {
      showMessage();
      setMessage('该用户已存在');
    }
  }, [userInfo])

  return (
    <section className="login-box">
      <i className="iconfont">&#xe677;</i>
      <p className="login-title">欢迎加入群聊</p>
      <div className="login-wrap">
        <input
          placeholder="请输入用户名"
          className="username"
          value={userName}
          onChange={e => setUserName(e.target.value)}
        />
        <button className="login-btn" onClick={toLogin}>加入群聊</button>
      </div>

      <Message
        show={show}
        type="error"
        message={message}
      />
    </section>
  )
}

export default Login;
