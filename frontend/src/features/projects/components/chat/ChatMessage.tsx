import { Button } from "@/components/Button";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useOpenBuyCredits } from "@/features/misc/useOpenBuyCredits";
import { getChatPrice } from "@/features/payment/utils";
import { useAppDispatch } from "@/redux/hooks";
import React from "react";
import { useNavigate } from "react-router-dom";
import { setHighlightedResult } from "../../projectSlice";
import { encodePdfName } from "../../utils";
import { Message } from "./ProjectChat";

const ChatMessage = ({
  message,
  initialMessage = false,
}: {
  message: Message;
  initialMessage?: boolean;
}) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { open: openBuyCreditsModal } = useOpenBuyCredits();
  const elements: React.ReactElement[] = [];

  if (initialMessage && message.role === "assistant") {
    if (user.credits < getChatPrice()) {
      elements.push(
        <div className="mt-2 px-2" key={0}>
          <span>
            Hey! You dont have enough credits to chat right now. Do you want to
            buy more?
          </span>
          <Button
            className="mt-2 block"
            size="sm"
            variant="inverse"
            onClick={openBuyCreditsModal}
          >
            Buy Credits
          </Button>
        </div>
      );
    } else {
      elements.push(<span key={0}>{message.content}</span>);
    }
  } else if (message.role === "assistant" && message.type == "citations") {
    let currentText = "";
    let i = 0;
    const text = message.content;
    while (i < text.length) {
      const char = text[i];
      if (char === "[") {
        let citation = 0;
        // if in one or two places after there is a closing, then it is a citation of respective 1 or 2 digits
        const nextChar = text[i + 1];
        const nextNextChar = text[i + 2];
        const nextNextNextChar = text[i + 3];

        if (nextNextChar == "]") {
          citation = parseInt(nextChar);
          i += 3;
        } else if (nextNextNextChar == "]") {
          citation = parseInt(nextChar + nextNextChar);
          i += 4;
        } else {
          currentText += char;
          i++;
          continue;
        }
        elements.push(<span key={i}>{currentText}</span>);
        currentText = "";

        const blobName = message.citationMapping[citation].blobName;

        elements.push(
          <span
            className="cursor-pointer text-gray-500"
            key={"link" + i}
            onClick={() => {
              navigate(`pdf/${encodePdfName(blobName)}?highlightedBox=${JSON.stringify(message.citationMapping[citation].highlightedBox)}`);
              // Old approach
              // dispatch(
              //   setHighlightedResult(
              //     message.citationMapping[citation].highlightedBox
              //   )
              // );
            }}
          >
            {`[`}
            {citation}
            {`]`}
          </span>
        );
        continue;
      } else {
        currentText += char;
        i++;
      }
    }
    elements.push(<span key={i}>{currentText}</span>);
  } else {
    elements.push(<span key={"key"}>{message.content}</span>);
  }

  return <div>{elements}</div>;
};

export default ChatMessage;
