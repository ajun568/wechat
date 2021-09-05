import React from 'react';

const Message = (props) => {
  const { type, message, show } = props;
  return (
    show && <section className={`${type}-message message`}>
      <span>{message}</span>
    </section>
  )
}

export default Message;
