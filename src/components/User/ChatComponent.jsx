import { useState, useEffect, useRef } from "react";
import { LuCircleHelp } from "react-icons/lu";
import { BiPhone } from "react-icons/bi";
import { LuVideo } from "react-icons/lu";
import { HiDotsVertical } from "react-icons/hi";
import { CiImageOn } from "react-icons/ci";
import { FiLink, FiFile, FiDownload } from "react-icons/fi";
import { VscSend } from "react-icons/vsc";
import { BsPersonCircle, BsChevronLeft, BsChevronRight } from "react-icons/bs";
import { MdOutlineSearch, MdAdminPanelSettings } from "react-icons/md";
import io from "socket.io-client";
import { useUser } from "../../context/userContext";
import { apiCaller } from "../../utils/axiosInstance";

export default function ChatComponent() {
  const { user } = useUser();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [socket, setSocket] = useState(null);
  const [currentChat, setCurrentChat] = useState(null);
  const [allChats, setAllChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chatPartner, setChatPartner] = useState({
    name: "Help Center",
    online: true,
  });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Connect to socket on component mount
  useEffect(() => {
    if (!user) return;

    // Make sure the user ID is properly accessed
    const userId = user.id || user._id;

    if (!userId) {
      console.error("No user ID found", user);
      return;
    }

    const socketInstance = io(
      import.meta.env.VITE_REACT_APP_API_BASE_URL || "http://localhost:5000"
    );
    setSocket(socketInstance);

    // Join the socket with current user's ID
    socketInstance.emit("join", userId);

    // Debug socket connection
    socketInstance.on("connect", () => {
      //("Socket connected:", socketInstance.id);
    });

    socketInstance.on("connect_error", (err) => {
      console.error("Socket connection error:", err);
    });

    // Cleanup on unmount
    return () => {
      socketInstance.disconnect();
    };
  }, [user]);

  // Load chat history
  useEffect(() => {
    if (!user) return;

    const fetchChatHistory = async () => {
      try {
        setLoading(true);
        const endpoint =
          user.role === "admin"
            ? "/api/chat/admin-chats"
            : "/api/chat/user-chat";

        const response = await apiCaller("GET", endpoint);
        const data = response.data;

        //("data", data);

        // Get current user's ID for comparing with sender
        const currentUserId = user.id || user._id;

        if (user.role === "admin") {
          // Store all chats for the admin sidebar
          if (data.chats && data.chats.length > 0) {
            setAllChats(data.chats);
            setCurrentChat(data.chats[0]);

            // Format messages for display
            const formattedMessages = data.chats[0].messages.map(
              (msg, index) => ({
                id: index,
                text: msg.message,
                time: new Date(msg.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
                // Message is FROM current user if the sender matches the current user's ID
                fromCurrentUser: msg.sender === currentUserId,
                sender: msg.sender,
                fileUrl: msg.fileUrl || null,
                fileType: msg.fileType || null,
                fileName: msg.fileName || null,
              })
            );

            setMessages(formattedMessages);

            // Get the chat partner's info
            if (data.chats[0].user) {
              const userName =
                typeof data.chats[0].user === "object"
                  ? data.chats[0].user.name?.first || "User"
                  : "User";

              setChatPartner({
                name: userName,
                online: true,
                id:
                  typeof data.chats[0].user === "object"
                    ? data.chats[0].user._id || data.chats[0].user.id
                    : data.chats[0].user,
                profilePicture:
                  typeof data.chats[0].user === "object"
                    ? data.chats[0].user.profilePicture
                    : null,
              });
            }
          }
        } else {
          // Regular user view
          if (data.chat) {
            setCurrentChat(data.chat);

            // Format messages for display
            const formattedMessages = data.chat.messages.map((msg, index) => ({
              id: index,
              text: msg.message,
              time: new Date(msg.timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
              // Message is FROM current user if the sender matches the current user's ID
              fromCurrentUser: msg.sender === currentUserId,
              sender: msg.sender,
              fileUrl: msg.fileUrl || null,
              fileType: msg.fileType || null,
              fileName: msg.fileName || null,
            }));

            setMessages(formattedMessages);

            // Get admin info
            setChatPartner({
              name: "Help Center",
              online: true,
            });
          }
        }
      } catch (error) {
        console.error("Error fetching chat:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchChatHistory();
  }, [user]);

  // Set up socket event listeners
  useEffect(() => {
    if (!socket || !user) return;

    // Get current user's ID
    const currentUserId = user.id || user._id;

    // User receives message from admin
    const handleReceiveAdminReply = (data) => {
      const newMsg = {
        id: Date.now(),
        text: data.message,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        fromCurrentUser: false, // Admin's message, not from current user
        fileUrl: data.fileUrl || null,
        fileType: data.fileType || null,
        fileName: data.fileName || null,
      };
      setMessages((prev) => [...prev, newMsg]);
    };

    // Admin receives message from user
    const handleReceiveMessage = (data) => {
      const newMsg = {
        id: Date.now(),
        text: data.message,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        fromCurrentUser: false, // User's message, not from admin
        sender: data.senderId,
        fileUrl: data.fileUrl || null,
        fileType: data.fileType || null,
        fileName: data.fileName || null,
      };

      // Only add the message if it's from the currently selected chat
      if (
        currentChat &&
        ((typeof currentChat.user === "object" &&
          (currentChat.user._id === data.senderId ||
            currentChat.user.id === data.senderId)) ||
          currentChat.user === data.senderId)
      ) {
        setMessages((prev) => [...prev, newMsg]);
      } else {
        // Update the chat in allChats to show notification
        setAllChats((prev) =>
          prev.map((chat) => {
            if (
              (typeof chat.user === "object" &&
                (chat.user._id === data.senderId ||
                  chat.user.id === data.senderId)) ||
              chat.user === data.senderId
            ) {
              return { ...chat, hasNewMessage: true };
            }
            return chat;
          })
        );
      }
    };

    if (user.role === "admin") {
      socket.on("receive-message", handleReceiveMessage);
    } else {
      socket.on("receive-admin-reply", handleReceiveAdminReply);
    }

    return () => {
      if (user.role === "admin") {
        socket.off("receive-message", handleReceiveMessage);
      } else {
        socket.off("receive-admin-reply", handleReceiveAdminReply);
      }
    };
  }, [socket, user, currentChat]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Resize chat container when sidebar collapses
  useEffect(() => {
    if (chatContainerRef.current) {
      const timeout = setTimeout(() => {
        window.dispatchEvent(new Event("resize"));
      }, 300);
      return () => clearTimeout(timeout);
    }
  }, [sidebarCollapsed]);

  const handleSendMessage = () => {
    if (
      (!newMessage.trim() && !fileInputRef.current?.files?.length) ||
      !socket ||
      !user ||
      !currentChat
    )
      return;

    // Get consistent user ID
    const userId = user.id || user._id;

    // Format the message for display
    const messageObj = {
      id: Date.now(),
      text: newMessage,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      fromCurrentUser: true, // Message is from current user
      fileUrl: null,
      fileType: null,
      fileName: null,
    };

    // Add to local state
    setMessages((prev) => [...prev, messageObj]);

    // Send via socket based on role
    if (user.role === "admin" && currentChat.user) {
      const receiverId =
        typeof currentChat.user === "object"
          ? currentChat.user._id || currentChat.user.id
          : currentChat.user;

      socket.emit("send-admin-reply", {
        receiverId,
        message: newMessage,
      });
    } else {
      socket.emit("send-message", {
        senderId: userId,
        message: newMessage,
      });
    }

    setNewMessage("");
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !socket || !user || !currentChat) return;

    try {
      setIsUploading(true);

      // Create FormData to send file
      const formData = new FormData();
      formData.append("file", file);

      // Upload to server
      const response = await apiCaller("POST", "/api/chat/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const fileUrl = response.data.fileUrl;
      const fileType = file.type;
      const fileName = file.name;

      // Get consistent user ID
      const userId = user.id || user._id;

      // Format the message for display
      const messageObj = {
        id: Date.now(),
        text: "",
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        fromCurrentUser: true, // Message is from current user
        fileUrl,
        fileType,
        fileName,
      };

      // Add to local state
      setMessages((prev) => [...prev, messageObj]);

      // Send via socket based on role
      if (user.role === "admin" && currentChat.user) {
        const receiverId =
          typeof currentChat.user === "object"
            ? currentChat.user._id || currentChat.user.id
            : currentChat.user;

        socket.emit("send-admin-reply", {
          receiverId,
          message: "",
          fileUrl,
          fileType,
          fileName,
        });
      } else {
        socket.emit("send-message", {
          senderId: userId,
          message: "",
          fileUrl,
          fileType,
          fileName,
        });
      }

      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("błąd serwera.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  const switchChat = async (chat) => {
    setLoading(true);
    setCurrentChat(chat);

    try {
      // Format messages for this chat
      const currentUserId = user.id || user._id;

      const formattedMessages = chat.messages.map((msg, index) => ({
        id: index,
        text: msg.message,
        time: new Date(msg.timestamp).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        fromCurrentUser: msg.sender === currentUserId,
        sender: msg.sender,
        fileUrl: msg.fileUrl || null,
        fileType: msg.fileType || null,
        fileName: msg.fileName || null,
      }));

      setMessages(formattedMessages);

      // Get the chat partner's info
      if (chat.user) {
        const userName =
          typeof chat.user === "object"
            ? chat.user.name?.first || "User"
            : "User";

        setChatPartner({
          name: userName,
          online: true,
          id:
            typeof chat.user === "object"
              ? chat.user._id || chat.user.id
              : chat.user,
          profilePicture:
            typeof chat.user === "object" ? chat.user.profilePicture : null,
        });
      }

      // Clear notification for this chat
      setAllChats((prev) =>
        prev.map((c) => {
          if (c._id === chat._id) {
            return { ...c, hasNewMessage: false };
          }
          return c;
        })
      );
    } catch (error) {
      console.error("Error switching chat:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter chats based on search term
  const filteredChats = allChats.filter((chat) => {
    const userName =
      typeof chat.user === "object"
        ? (chat.user.name?.first || "") + " " + (chat.user.name?.last || "")
        : "User";
    return userName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Function to handle sidebar toggle
  const toggleSidebar = () => {
    setSidebarCollapsed((prev) => !prev);
  };

  // Function to render file message
  const renderFileMessage = (msg) => {
    const isImage = msg.fileType?.startsWith("image/");

    return (
      <div className="file-container mb-2">
        {isImage ? (
          <div className="relative">
            <img
              src={msg.fileUrl}
              alt="Shared image"
              className="rounded-lg max-w-full max-h-48 object-contain"
              onClick={() => window.open(msg.fileUrl, "_blank")}
            />
            <div className="mt-1 text-xs">{msg.fileName}</div>
          </div>
        ) : (
          <div className="flex items-center bg-gray-100 p-2 rounded-lg">
            <FiFile className="text-gray-500 mr-2" />
            <div className="flex-1 overflow-hidden">
              <div className="truncate">{msg.fileName}</div>
            </div>
            <a
              href={msg.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 ml-2"
              download={msg.fileName}
            >
              <FiDownload />
            </a>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[85vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#008c8c]"></div>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto mt-8 flex h-[85vh]">
      {/* Admin sidebar for multiple chats */}
      {user?.role === "admin" && (
        <div
          className={`border-r border-gray-300 overflow-hidden transition-all duration-300 ease-in-out flex flex-col shadow-md ${
            sidebarCollapsed ? "w-16" : "w-1/4"
          }`}
        >
          <div className="p-4 border-b border-gray-300 bg-gray-50 flex justify-between items-center">
            {!sidebarCollapsed && (
              <div className="flex items-center">
                <MdAdminPanelSettings className="text-[#008c8c] text-xl mr-2" />
                <h2 className="font-semibold text-lg">Czaty wsparcia</h2>
              </div>
            )}
            <button
              onClick={toggleSidebar}
              className="hover:bg-gray-200 p-2 rounded-full transition-colors"
            >
              {sidebarCollapsed ? (
                <BsChevronRight className="text-gray-600" />
              ) : (
                <BsChevronLeft className="text-gray-600" />
              )}
            </button>
          </div>

          {!sidebarCollapsed && (
            <div className="p-3 border-b border-gray-200">
              <div className="flex items-center bg-gray-100 rounded-lg px-3 py-2">
                <MdOutlineSearch className="text-gray-500 mr-2" />
                <input
                  type="text"
                  placeholder="Szukaj czatów"
                  className="bg-transparent w-full outline-none text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          )}

          <div
            className={`flex-1 overflow-y-auto ${
              sidebarCollapsed ? "scrollbar-none" : ""
            }`}
          >
            {filteredChats.length === 0 ? (
              <div
                className={`text-center text-gray-500 p-4 ${
                  sidebarCollapsed ? "hidden" : ""
                }`}
              >
                Nie znaleziono czatów
              </div>
            ) : (
              filteredChats.map((chat) => {
                const userName =
                  typeof chat.user === "object"
                    ? chat.user.name?.first || "Użytkownik"
                    : "Użytkownik";

                const profilePicture =
                  typeof chat.user === "object"
                    ? chat.user.profilePicture
                    : null;

                const isActive = currentChat && currentChat._id === chat._id;
                const lastMessage =
                  chat.messages.length > 0
                    ? chat.messages[chat.messages.length - 1].message ||
                      (chat.messages[chat.messages.length - 1].fileUrl
                        ? "Udostępniono plik"
                        : "Brak wiadomości")
                    : "Brak wiadomości";

                // Get timestamp of last message
                const lastMessageTime =
                  chat.messages.length > 0
                    ? new Date(
                        chat.messages[chat.messages.length - 1].timestamp
                      ).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "";

                return (
                  <div
                    key={chat._id}
                    onClick={() => switchChat(chat)}
                    className={`border-b border-gray-200 cursor-pointer flex items-center transition-all hover:bg-gray-50 ${
                      isActive ? "bg-blue-50" : ""
                    } ${chat.hasNewMessage ? "bg-green-50" : ""} ${
                      sidebarCollapsed ? "justify-center py-4" : "p-3"
                    }`}
                  >
                    <div className="relative">
                      {profilePicture ? (
                        <img
                          src={profilePicture}
                          alt={userName}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <BsPersonCircle className="text-2xl text-gray-600" />
                      )}
                      {chat.hasNewMessage && (
                        <div className="absolute -top-1 -right-1">
                          <div className="bg-green-500 rounded-full w-3 h-3 border border-white"></div>
                        </div>
                      )}
                    </div>

                    {!sidebarCollapsed && (
                      <div className="ml-3 flex-1 overflow-hidden">
                        <div className="flex justify-between">
                          <span className="font-medium text-sm">
                            {userName}
                          </span>
                          <span className="text-xs text-gray-500">
                            {lastMessageTime}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 truncate mt-1">
                          {lastMessage}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {!sidebarCollapsed && (
            <div className="p-3 border-t border-gray-200 bg-gray-50">
              <div className="text-xs text-gray-500 text-center">
                {filteredChats.length} aktywnych rozmów
              </div>
            </div>
          )}
        </div>
      )}

      {/* Chat interface */}
      <div
        ref={chatContainerRef}
        className={`border rounded-xl shadow-md flex flex-col transition-all duration-300 ease-in-out ${
          user?.role === "admin"
            ? sidebarCollapsed
              ? "w-[calc(100%-4rem)]"
              : "w-3/4"
            : "w-full"
        }`}
      >
        <div className="flex items-center justify-between rounded-t-xl px-4 py-3 border-b border-gray-300 bg-white">
          <div className="flex items-center gap-2">
            {user?.role === "admin" ? (
              chatPartner.profilePicture ? (
                <img
                  src={chatPartner.profilePicture}
                  alt={chatPartner.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <BsPersonCircle className="text-gray-700 text-3xl" />
              )
            ) : (
              <MdAdminPanelSettings className="text-[#008c8c] text-3xl" />
            )}
            <div>
              <div className="text-sm font-medium">{chatPartner.name}</div>
              <div className="text-xs flex items-center">
                <div
                  className={`w-2 h-2 rounded-full mr-1 ${
                    chatPartner.online ? "bg-green-500" : "bg-gray-400"
                  }`}
                ></div>
                <span className="text-gray-600">
                  {chatPartner.online ? "Aktywny/a" : "Offline"}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-5">
            <HiDotsVertical className="text-gray-700 cursor-pointer hover:text-[#008c8c] transition-colors" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 mt-10 p-8 bg-white rounded-lg shadow-sm">
              <div className="flex justify-center mb-4">
                {user?.role === "admin" ? (
                  chatPartner.profilePicture ? (
                    <img
                      src={chatPartner.profilePicture}
                      alt={chatPartner.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <BsPersonCircle className="text-5xl text-gray-400" />
                  )
                ) : (
                  <MdAdminPanelSettings className="text-5xl text-gray-400" />
                )}
              </div>
              <h3 className="font-medium mb-2">Brak wiadomości</h3>
              <p className="text-sm">
                Rozpocznij rozmowę z {chatPartner.name}!
              </p>
            </div>
          ) : (
            messages.map((msg, index) => {
              // Determine if this is the first message in a group
              const isFirstInGroup =
                index === 0 ||
                messages[index - 1].fromCurrentUser !== msg.fromCurrentUser;

              // Determine if this is the last message in a group
              const isLastInGroup =
                index === messages.length - 1 ||
                messages[index + 1].fromCurrentUser !== msg.fromCurrentUser;

              return (
                <div
                  className={`flex items-end gap-2 ${
                    msg.fromCurrentUser ? "justify-end" : "justify-start"
                  } ${isLastInGroup ? "mb-4" : "mb-1"}`}
                  key={msg.id}
                >
                  {!msg.fromCurrentUser &&
                    isLastInGroup &&
                    (user?.role === "admin" ? (
                      chatPartner.profilePicture ? (
                        <img
                          src={chatPartner.profilePicture}
                          alt={chatPartner.name}
                          className="w-8 h-8 rounded-full object-cover mb-1"
                        />
                      ) : (
                        <BsPersonCircle className="text-2xl text-gray-500 mb-1" />
                      )
                    ) : (
                      <MdAdminPanelSettings className="text-2xl text-[#008c8c] mb-1" />
                    ))}

                  {!msg.fromCurrentUser && !isLastInGroup && (
                    <div className="w-8"></div>
                  )}

                  <div
                    className={`max-w-[75%] p-3 text-sm relative ${
                      msg.fromCurrentUser
                        ? "bg-[#008c8c] text-white rounded-t-xl rounded-bl-xl"
                        : "bg-white border border-gray-200 rounded-t-xl rounded-br-xl shadow-sm"
                    }`}
                  >
                    {msg.fileUrl && renderFileMessage(msg)}
                    {msg.text && <div>{msg.text}</div>}
                    <div
                      className={`text-[10px] mt-1 ${
                        msg.fromCurrentUser
                          ? "text-right text-gray-100"
                          : "text-right text-gray-400"
                      } `}
                    >
                      {msg.time}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="flex items-center gap-4 p-4 border-t border-gray-300 rounded-b-xl bg-white">
          <div className="flex-1 border border-gray-300 rounded-full flex items-center px-4 py-2 hover:border-[#008c8c] focus-within:border-[#008c8c] transition-colors">
            <input
              placeholder="Napisz wiadomość..."
              className="flex-1 placeholder:text-gray-500 outline-none text-sm"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <div className="flex items-center gap-3">
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileUpload}
                accept="image/*,.pdf,.doc,.docx,.txt"
              />
              <button
                className="text-gray-500 hover:text-[#008c8c] transition-colors"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                <FiLink />
              </button>
              <button
                className="text-gray-500 hover:text-[#008c8c] transition-colors"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                <CiImageOn className="text-lg" />
              </button>
            </div>
          </div>
          <button
            className={`flex justify-center items-center rounded-full w-10 h-10 ${
              isUploading ? "bg-gray-300" : "bg-[#008c8c] hover:bg-[#006e6e]"
            } text-white transition-colors`}
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || isUploading}
          >
            {isUploading ? (
              <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent"></div>
            ) : (
              <VscSend className="-rotate-45" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
