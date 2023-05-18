import { Chat } from "@/components/Chat/Chat";
import { Form, InputField } from "@/components/Form";
import React, { useRef, useState } from "react";
import { TrashIcon } from "@heroicons/react/24/outline";
import { useLocalStorage } from "@mantine/hooks";
import { set } from "zod";
import { Loader } from "@mantine/core";
export type Message = {
  role: "user" | "assistant" | "system";
  content: string;
};

interface Props {
  uniqueKey?: string;
  getAiResponse: (Message: Message[]) => Promise<string>;
}

const DEFAULT_MESSAGES = [
  {
    role: "assistant",
    content: "Hello, how can I help you?",
  },
] as Message[];

export function ProjectChat({ getAiResponse, uniqueKey }: Props) {
  const chatBoxRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);

  const [messages, setMessages] = useLocalStorage({
    key: "project-chat" + uniqueKey || "project-chat",
    defaultValue: DEFAULT_MESSAGES,
  });

  React.useEffect(() => {
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
          messages={messages.map((msg, i) => ({
            type: "text",
            id: i,
            position: msg.role === "user" ? "right" : "left",
            text: msg.content,
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
            const msg = {
              role: "user",
              content: values.value,
            } as const;

            const newMessages = [...messages, msg];

            setMessages(newMessages);

            setLoading(true);

            const newMessage = await getAiResponse(newMessages);

            setLoading(false);

            setMessages((prev) => [
              ...prev,
              { role: "assistant", content: newMessage },
            ]);
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
