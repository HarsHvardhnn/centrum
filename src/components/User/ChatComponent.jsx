import { useState } from "react";
import { LuCircleHelp } from "react-icons/lu";
import { BiPhone } from "react-icons/bi";
import { LuVideo } from "react-icons/lu";
import { HiDotsVertical } from "react-icons/hi";
import { CiImageOn } from "react-icons/ci";
import { FiLink } from "react-icons/fi";
import { VscSend } from "react-icons/vsc";

const chatData = {
  online: true,
  messages: [
    {
      id: 1,
      text: "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout.",
      time: "6.30 pm",
      fromUser: false,
    },
    {
      id: 2,
      text: "There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour,",
      time: "6.34 pm",
      fromUser: true,
    },
    {
      id: 3,
      text: "The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters...",
      time: "6.38 pm",
      fromUser: false,
    },
  ],
};

export default function ChatComponent() {
  const [messages, setMessages] = useState(chatData.messages);

  return (
    <div className="w-full mx-auto border rounded-xl mt-8 shadow-md flex flex-col h-[85vh]">
      <div className="flex items-center justify-between rounded-xl px-4 py-2 border-b border-gray-300 bg-white">
        <div className="flex items-center gap-2">
          <LuCircleHelp className="text-gray-700 text-3xl" />
          <div>
            <div className="text-sm font-medium">Help Center</div>
            <div className={`text-xs text-gray-600`}>
              {chatData.online ? "Active now" : "Offline"}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-5">
          <BiPhone className="text-gray-700 text-xl cursor-pointer" />
          <LuVideo className="text-gray-700 text-xl cursor-pointer" />
          <HiDotsVertical className="text-gray-700 cursor-pointer" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 bg-white">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-10">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((msg) => (
            <div className="flex items-end mb-4 gap-2" key={msg.id}>
              {!msg.fromUser && (
                <LuCircleHelp className="text-2xl text-gray-500" />
              )}

              <div
                className={`max-w-[75%] p-3 text-sm relative ${
                  msg.fromUser
                    ? "bg-[#008c8c] text-white self-end ml-auto rounded-t-xl rounded-bl-xl"
                    : "bg-[#f5f6fa] self-start mr-auto rounded-t-xl rounded-br-xl"
                }`}
              >
                <div>{msg.text}</div>
                <div
                  className={`text-[10px]  mt-2 ${
                    msg.fromUser
                      ? "text-left text-gray-100"
                      : "text-right text-gray-700"
                  } `}
                >
                  {msg.time}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="flex items-center gap-6 p-3 border-t border-gray-300 rounded-xl bg-white">
        <input
          placeholder="Write message"
          className="flex-1 placeholder:text-gray-500 outline-none"
        />
        <button>
          <FiLink className=" text-gray-700" />
        </button>
        <button>
          <CiImageOn className="text-lg text-gray-800" />
        </button>
        <button className="flex gap-3 justify-center items-center rounded-md text-sm bg-[#008c8c] px-4 py-2 text-white">
          Send
          <VscSend className="-rotate-45 text-base" />
        </button>
      </div>
    </div>
  );
}
