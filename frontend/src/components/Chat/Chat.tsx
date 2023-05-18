import React from "react";
import { MessageList, MessageType } from "react-chat-elements";

import "react-chat-elements/dist/main.css"

interface Props {
  messages:  MessageType[]
}

export const Chat = ({ messages }: Props) => {
  return (
    <MessageList
      referance={null}
      className="message-list"
      lockable={true}
      toBottomHeight={"100%"}
      dataSource={messages}
    />
  );
};
