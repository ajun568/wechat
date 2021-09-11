import React, { useState, useEffect, useCallback, createContext } from "react";
import { Provider } from "react-redux";
import store from "./store/store";
import Ws from "./socket";
import Main from "./page/main";
import Login from "./page/login";

export const DEV = process.env.NODE_ENV !== 'production';
export const WsContext = createContext('');

const ws = new Ws(DEV ? 'ws://localhost:8080' : 'wss://api_chat.deeruby.com');
const App = () => {
  const [login, setLogin] = useState(false);

  useEffect(() => {
    ws.initWs();
  }, [])

  const handleBeforeunload = useCallback(() => ws.close(), []);
  useEffect(() => {
    window.addEventListener('beforeunload', handleBeforeunload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeunload);
    };
  }, [])

  const loginSuccess = useCallback(() => {
    setLogin(true);
  }, [])

  const logoutSuccess = useCallback(() => {
    setLogin(false);
  }, [])

  return (
    <Provider store={store}>
      <WsContext.Provider value={ws}>
        <main className="bg">
        {
          login
            ? <Main logoutSuccess={logoutSuccess} />
            : <Login loginSuccess={loginSuccess} />
        }
        </main>
      </WsContext.Provider>
    </Provider>
  )
}

export default App;
