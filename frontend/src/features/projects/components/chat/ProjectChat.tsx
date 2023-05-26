import { Chat } from "@/components/Chat/Chat";
import { Form, InputField } from "@/components/Form";
import { showError } from "@/utils/showError";
import { TrashIcon } from "@heroicons/react/24/outline";
import { Loader } from "@mantine/core";
import { useLocalStorage } from "@mantine/hooks";
import React, { useEffect, useRef, useState } from "react";
import { PromptMatch, searchProjectWithPromptReq } from "../../requests";
import ChatMessage from "./ChatMessage";
import { DEFAULT_ASSISTANT_FIRST_PROMPT, SYSTEM_PROMPT } from "./prompts";

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
  }
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
            text: (<ChatMessage message={msg} initialMessage={i == 0} />) as unknown as string,
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

              const userPrompt = `
            documents: [${matches.map(
              (match, i) =>
                `{id: ${i}, text: "${match.highlightedBox.content}"}`
            )}]
            query: ${values.value}
            `;

              const msg = {
                role: "user",
                content: userPrompt,
              } as const;

              const newMessages = [...messages, msg];

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
