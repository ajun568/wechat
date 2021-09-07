export const getUserInfo = userInfo => {
  return {
    type: 'USER_INFO',
    userInfo,
  }
}

export const updatePeopleNum = peopleNum => {
  return {
    type: 'UPDATE_PEOPLE_NUM',
    peopleNum,
  }
}

export const updateUserList = userList => {
  return {
    type: 'UPDATE_USER_LIST',
    userList,
  }
}

export const updateMessageList = messageList => {
  return {
    type: 'UPDATE_MESSAGE_LIST',
    messageList,
  }
}
