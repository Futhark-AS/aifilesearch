import { Chat } from "@/components/Chat/Chat";
import { Form, InputField } from "@/components/Form";
import { Link } from "@/components/Link";
import { showError } from "@/utils/showError";
import { TrashIcon } from "@heroicons/react/24/outline";
import { Loader } from "@mantine/core";
import { useLocalStorage } from "@mantine/hooks";
import React, { useRef, useState } from "react";
import { PromptMatch, searchProjectWithPromptReq } from "../requests";
export type Message = {
  role: "user" | "assistant" | "system";
  content: string;
  citationMapping?: {
    [id: number]: string;
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

  const citationMapping = uniqueCitations?.map((citation) => ({
    id: citation,
    // only get last part after / of blob name
    name: matches[citation].blobName.split("/").pop() || "",
  }));

  const map: { [id: number]: string } = {};
  for (const citation of citationMapping) {
    map[citation.id] = citation.name;
  }

  return map;
};

const ChatMessage = ({
  message,
  project,
}: {
  message: Message;
  project: string;
}) => {
  // [1] => <Link to="/projects/1">1</Link>
  // [3] [1] => <Link to="/projects/3">3</Link> <Link to="/projects/1">1</Link>

  // only support citations of two digits max

  // normal text is mapped to span elements
  // citations are added to a Link elements
  // consequtive citations are seperated by a span element with a space

  const elements = [];
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
        continue;
      }
      elements.push(<span>{currentText}</span>);
      elements.push(
        <Link to={`/projects/${project}/pdf/${citation}`}>
          {`[`}
          {message.citationMapping && message.citationMapping[citation]}
          {`]`}
        </Link>
      );
    } else {
      currentText += char;
      i++;
    }
  }
  elements.push(<span>{currentText}</span>);

  return <div>{elements}</div>;
};

export default ChatMessage;

const DEFAULT_MESSAGES = [
  {
    role: "system",
    content: `You are a helpful assistant that accurately answers queries based on documents provided by the user. You will recieve a list of relevant documents to the users query. Your answer should be rooted in these documents. If the provided documents do not contain sufficient information to answer the query, you can answer to your best ability - but in this case you will inform the user that you did not find info in the project about the query.
    
    In your answer, you should cite what provided document you are basing your answer on. For each document, you will be given an ID. You can cite the document by writing:
    [document_id] [another_document_id] ...

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
}: Props) {
  const chatBoxRef = useRef<HTMLDivElement>(null);
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
            // text: msg.content,
            text: (
              <ChatMessage message={msg} project={projectName} />
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
                { role: "assistant", content: newMessage, citationMapping },
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
