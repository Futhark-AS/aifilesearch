import { Chat } from "@/components/Chat/Chat";
import { Form, InputField } from "@/components/Form";
import { useAppDispatch } from "@/redux/hooks";
import { TrashIcon } from "@heroicons/react/24/outline";
import { Loader } from "@mantine/core";
import { useLocalStorage } from "@mantine/hooks";
import React, { useRef, useState } from "react";
import { toggleSearchPane } from "../projectSlice";
import { PromptMatch, searchProjectWithPromptReq } from "../requests";
export type Message = {
  role: "user" | "assistant" | "system";
  content: string;
};

interface Props {
  projectName: string;
  getAiResponse: (Message: Message[]) => Promise<string>;
  setSearchResults: (results: PromptMatch[]) => void;
}

const DEFAULT_MESSAGES = [
  {
    role: "system",
    content: `You are a helpful assistant that accurately answers queries based on documents provided by the user. You will recieve a list of relevant documents to the users query. Your answer should be rooted in these documents. If the provided documents do not contain sufficient information to answer the query, you can answer to your best ability - but in this case you will inform the user that you did not find info in the project about the query.
    
    In your answer, you should cite what provided document you are basing your answer on. For each document, you will be given an ID. You can cite the document by writing:
    [document_id1] [document_id2] ...

    Example: 

    documents: [{
      id: 1,
      text: "Paris is the capital of France"
    }, {
      id: 2,
      text: "Norway is a country in Europe"
    }]
    query: What is the capital of France?


    Your answer:
    Paris is the capital of France [1]
    `,
  },
  {
    role: "assistant",
    content: "Hello, how can I help you?",
  },
] as Message[];

export function ProjectChat({
  getAiResponse,
  projectName,
  setSearchResults,
}: Props) {
  const chatBoxRef = useRef<HTMLDivElement>(null);
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);

  const [messages, setMessages] = useLocalStorage({
    key: "project-chat" + projectName || "project-chat",
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
          messages={messages.slice(1).map((msg, i) => ({
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
            setMessages([
              ...messages,
              {
                role: "user",
                content: values.value,
              },
            ]);

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

            setLoading(true);

            const newMessage = await getAiResponse(newMessages);

            // get citation matches
            const citationMatches = newMessage.match(/\[\d+\]/g);

            // extract number
            const citations = citationMatches?.map((match) =>
              parseInt(match.replace(/\D/g, ""))
            );

            // get matches used in citations
            const usedMatches = citations?.map((citation) => ({
              ...matches[citation],
              citation: "[" + citation.toString() + "]",
            }));

            // reomve matches with duplicate citation
            const usedMatchesSet = new Set();
            const usedMatchesNoDuplicates = usedMatches?.filter((match) => {
              if (usedMatchesSet.has(match.citation)) {
                return false;
              } else {
                usedMatchesSet.add(match.citation);
                return true;
              }
            });

            if (usedMatchesNoDuplicates) {
              dispatch(toggleSearchPane());
              setSearchResults(usedMatchesNoDuplicates);
            }

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
