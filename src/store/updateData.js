const initState = {
  peopleNum: 0,
  userInfo: undefined,
  userList: [],
  messageList: [],
  liveMessage: undefined,
};

const updateData = (state = initState, action) => {
  switch (action.type) {
    case 'USER_INFO':
      return {
        ...state,
        userInfo: action.userInfo,
      }
    case 'UPDATE_PEOPLE_NUM':
      return {
        ...state,
        peopleNum: action.peopleNum,
      }
    case 'UPDATE_USER_LIST':
      return {
        ...state,
        userList: action.userList,
      }
    case 'UPDATE_MESSAGE_LIST':
      return {
        ...state,
        messageList: action.messageList,
      }
    case 'UPDATE_MESSAGE':
      return {
        ...state,
        liveMessage: action.liveMessage,
      }
    default:
      return state;
  }
}

export default updateData;
