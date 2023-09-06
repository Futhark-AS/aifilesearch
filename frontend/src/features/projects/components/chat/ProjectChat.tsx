import { Chat } from "@/components/Chat/Chat";
import { Form, InputField } from "@/components/Form";
import { showError } from "@/utils/showError";
import { TrashIcon } from "@heroicons/react/24/outline";
import { Loader } from "@mantine/core";
import { useLocalStorage } from "@mantine/hooks";
import React, { useEffect, useRef, useState } from "react";
import { PromptMatch, searchProjectWithPromptReq } from "../../requests";
import ChatMessage from "./ChatMessage";
import {
  DEFAULT_ASSISTANT_FIRST_PROMPT,
  SYSTEM_PROMPT,
  SYSTEM_PROMPT_REMINDER,
} from "./prompts";
import { TokenTextSplitter } from "langchain/text_splitter";

const splitter = new TokenTextSplitter({
  encodingName: "gpt2",
  chunkSize: 1,
  chunkOverlap: 0,
});

export type Message =
  | {
      role: "user" | "system";
      content: string | React.ReactElement;
    }
  | {
      role: "assistant";
      type: "simple";
      content: string | React.ReactElement;
    }
  | {
      role: "assistant";
      type: "citations";
      content: string;
      citationMapping: {
        [id: number]: PromptMatch;
      };
    };

async function countTokens(inputString: string) {
  const output = await splitter.createDocuments([inputString]);
  return output.length;
}

async function constructDocuments(
  matches: string[],
  maxTokens: number
): Promise<string> {
  const documents: string[] = [];

  // Create a base prompt with the previous question and answer
  const basePrompt = `documents: [`;
  let returnPrompt = basePrompt;

  // Iteratively add matches until the token limit is reached or exceeded
  for (let i = 0; i < matches.length; i++) {
    const matchStr = `{id: ${i}, text: "${matches[i]}"}`;
    const tempPrompt = `${basePrompt}${documents.join(",")},${matchStr}]`;

    const tokens = await countTokens(tempPrompt);
    // const tokens = 0;

    if (tokens <= maxTokens) {
      documents.push(matchStr);
      returnPrompt = tempPrompt;
    } else {
      break;
    }
  }

  return returnPrompt;
}

interface Props {
  projectName: string;
  getAiResponse: (Message: Message[]) => Promise<string>;
}

const getCitations = (text: string, matches: PromptMatch[]) => {
  // get citation matches
  const citationMatches = text.match(/\[\d+\]/g);

  // extract number
  const citations = citationMatches?.map((match) =>
    parseInt(match.replace(/\D/g, ""))
  );

  // get unique citations
  const uniqueCitations = Array.from(new Set(citations));

  const map: { [id: number]: PromptMatch } = {};
  for (const citation of uniqueCitations) {
    map[citation] = matches[citation];
  }

  return map;
};

const DEFAULT_MESSAGES = [
  {
    role: "system",
    content: SYSTEM_PROMPT,
  },
  {
    role: "assistant",
    type: "simple",
    content: DEFAULT_ASSISTANT_FIRST_PROMPT,
  },
] as Message[];

export function ProjectChat({ getAiResponse, projectName }: Props) {
  const chatBoxRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);

  const [messages, setMessages] = useLocalStorage({
    key: "project-chat" + projectName || "project-chat",
    defaultValue: DEFAULT_MESSAGES,
  });

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    // scroll box
    <div className="flex h-full flex-col">
      <div className="flex justify-between">
        <h2 className="text-left text-3xl font-extrabold leading-normal text-gray-700">
          Chat
        </h2>
        <div className="mt-4">
          <button
            className="inline-flex items-center rounded bg-gray-200 py-2 px-4 font-bold text-gray-800 hover:bg-gray-300"
            onClick={() => {
              setMessages(DEFAULT_MESSAGES);
            }}
          >
            <TrashIcon className="mr-2 h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="mt-4 flex-1 overflow-y-scroll" ref={chatBoxRef}>
        <Chat
          messages={messages.slice(1).map((msg, i) => ({
            type: "text",
            id: i,
            position: msg.role === "user" ? "right" : "left",
            text: (
              <ChatMessage message={msg} initialMessage={i == 0} />
            ) as unknown as string,
            title: msg.role === "user" ? "You" : "AI",
            focus: false,
            date: new Date(),
            titleColor: "red",
            forwarded: false,
            replyButton: false,
            removeButton: false,
            status: "waiting",
            notch: false,
            retracted: false,
          }))}
        />
        {loading && (
          <div className="flex justify-center">
            <Loader size="xl" />
          </div>
        )}
      </div>
      <div className="mt-4">
        <Form<{ value: string }>
          id="submit-chat"
          onSubmit={async (values) => {
            let oldMessages: Message[] = [];
            setMessages((prev) => {
              oldMessages = prev;
              return [
                ...prev,
                {
                  role: "user",
                  content: values.value,
                },
              ];
            });

            try {
              setLoading(true);
              const matches = await searchProjectWithPromptReq(
                values.value,
                projectName
              );

              // if messages is 2 or more, then we need to get the number of tokens in the previous messages
              // otherwise, we can just use 0

              const numTokensInPreviousMessages =
                (await countTokens(
                  messages
                    .slice(-2)
                    .map((msg) => msg.content)
                    .join("")
                )) + 8;

              const query_tokens = await countTokens(values.value);
              const tokensReminder = await countTokens(SYSTEM_PROMPT_REMINDER);
              const answerBuffer = 400;
              const systemChatTokens = tokensReminder;

              const documentsContextString = await constructDocuments(
                matches.map((match) => match.highlightedBox.content),
                4096 -
                  numTokensInPreviousMessages -
                  query_tokens -
                  tokensReminder -
                  systemChatTokens -
                  answerBuffer
              );

              const finalPrompt = `${documentsContextString}\n\n${SYSTEM_PROMPT_REMINDER}\n\nquery: "${values.value}"`;

              const msg = {
                role: "user",
                content: finalPrompt,
              } as const;

              // system prompt + last question and answer + new message
              const newMessages = [messages[0], ...messages.slice(-2), msg];

              const newMessage = await getAiResponse(newMessages);
              setLoading(false);

              const citationMapping = getCitations(newMessage, matches);
              setMessages((prev) => [
                ...prev,
                {
                  role: "assistant",
                  type: "citations",
                  content: newMessage,
                  citationMapping,
                },
              ]);
            } catch (error) {
              console.error(error);
              setLoading(false);
              showError("Could not get AI response");
              setMessages(oldMessages);
              return;
            }
          }}
          options={{
            defaultValues: {
              value: "",
            },
          }}
        >
          {({ register, formState }) => {
            return (
              <>
                <InputField
                  label="Message"
                  error={formState.errors["value"]}
                  registration={register("value")}
                />
              </>
            );
          }}
        </Form>
      </div>
    </div>
  );
}
