const initState = {
  peopleNum: 0,
  userInfo: undefined,
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
    default:
      return state;
  }
}

export default updateData;
