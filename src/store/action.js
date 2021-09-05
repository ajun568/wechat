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
