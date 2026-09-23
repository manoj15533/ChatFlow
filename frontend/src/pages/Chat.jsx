import { useEffect, useRef, useState } from "react";
import EmojiPicker from "emoji-picker-react";
import { FiImage, FiSmile, FiMic, FiSquare, FiTrash2 } from "react-icons/fi";
import { io } from "socket.io-client";
import "./Chat.css";

function Chat({ onLogout }) {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const touchStartX = useRef(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  // Emoji picker references
const emojiPickerRef = useRef(null);
const emojiButtonRef = useRef(null);

// Close emoji picker when clicking outside or pressing Escape
useEffect(() => {
    if (!showEmojiPicker) return;

    const handleOutsideClick = (event) => {
        const clickedInsidePicker =
            emojiPickerRef.current?.contains(event.target);

        const clickedEmojiButton =
            emojiButtonRef.current?.contains(event.target);

        if (!clickedInsidePicker && !clickedEmojiButton) {
            setShowEmojiPicker(false);
        }
    };

    const handleEscape = (event) => {
        if (event.key === "Escape") {
            setShowEmojiPicker(false);
        }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
        document.removeEventListener("mousedown", handleOutsideClick);
        document.removeEventListener("keydown", handleEscape);
    };
}, [showEmojiPicker]);
  const [selectedImage, setSelectedImage] = useState(null);
const [imagePreview, setImagePreview] = useState("");
const [isUploadingImage, setIsUploadingImage] = useState(false);
const [isRecording, setIsRecording] = useState(false);
const [audioBlob, setAudioBlob] = useState(null);
const [audioPreview, setAudioPreview] = useState("");
const [isUploadingAudio, setIsUploadingAudio] = useState(false);

const mediaRecorderRef = useRef(null);
const audioChunksRef = useRef([]);
  const [socket, setSocket] = useState(null);
  const [user, setUser] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [typingUser, setTypingUser] = useState("");
  const [showCreateRoom, setShowCreateRoom] = useState(false);
const [newRoomName, setNewRoomName] = useState("");
const [newRoomDescription, setNewRoomDescription] = useState("");
const [showAdminOnly, setShowAdminOnly] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [rooms, setRooms] = useState([]);
const [activeRoom, setActiveRoom] = useState(null);
const [allUsers, setAllUsers] = useState([]);
const [showUserManagement, setShowUserManagement] = useState(false);
const [selectedUser, setSelectedUser] = useState(null);
const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
const [roomToDelete, setRoomToDelete] = useState(null);
const [showRoleConfirm, setShowRoleConfirm] = useState(false);
const [roleChangeUser, setRoleChangeUser] = useState(null);
const [roleChangeTo, setRoleChangeTo] = useState("");

  const messagesEndRef = useRef(null);

  const roomId = activeRoom?._id;

  // Get current user
  useEffect(() => {
    const fetchCurrentUser = async () => {
        try {
            const token = localStorage.getItem("token");

            if (!token) {
                return;
            }

            const response = await fetch(
                "http://localhost:4000/api/auth/me",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                console.error(
                    "Failed to fetch current user:",
                    data
                );
                return;
            }

            // Update React state with latest user information
            setUser(data.user);

            // Update localStorage with latest role and user data
            localStorage.setItem(
                "user",
                JSON.stringify(data.user)
            );

        } catch (error) {
            console.error(
                "Fetch current user error:",
                error
            );
        }
    };

    fetchCurrentUser();
}, []);

  useEffect(() => {
    const fetchRooms = async () => {
        try {
            const token = localStorage.getItem("token");

            const response = await fetch(
                "http://localhost:4000/api/rooms",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (response.ok) {
    setRooms(data.rooms);

    if (data.rooms.length > 0) {
        setActiveRoom(data.rooms[0]);
    }

    console.log("Rooms received:", data.rooms);
}else {
                console.error("Failed to fetch rooms:", data);
            }
        } catch (error) {
            console.error("Fetch rooms error:", error);
        }
    };

    fetchRooms();
}, []);

  // Delete a room
const handleDeleteRoom = (roomId) => {
    const room = rooms.find(
        (room) => room._id === roomId
    );

    if (!room) {
        return;
    }

    setRoomToDelete(room);
    setShowDeleteConfirm(true);
};

// Confirm room deletion
const confirmDeleteRoom = async () => {
    if (!roomToDelete) {
        return;
    }

    try {
        const token = localStorage.getItem("token");

        const response = await fetch(
            `http://localhost:4000/api/rooms/${roomToDelete._id}`,
            {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        const data = await response.json();

        if (!response.ok) {
            console.error("Failed to delete room:", data);
            return;
        }

        // Remove the deleted room from the list
        const updatedRooms = rooms.filter(
            (room) => room._id !== roomToDelete._id
        );

        setRooms(updatedRooms);

        // If the deleted room was active,
        // switch to another available room
        if (activeRoom?._id === roomToDelete._id) {
            setActiveRoom(
                updatedRooms.length > 0
                    ? updatedRooms[0]
                    : null
            );
        }

        console.log(
            "Room deleted:",
            roomToDelete.name
        );

        // Close the confirmation popup
        setShowDeleteConfirm(false);
        setRoomToDelete(null);

    } catch (error) {
        console.error("Delete room error:", error);
    }
};

  // Scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  // Socket + messages
    // Socket + messages
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token || !roomId) {
      return;
    }

    // Connect Socket.IO
    const newSocket = io("http://localhost:4000", {
      auth: {
        token,
      },
    });

    setSocket(newSocket);
    // Listen for real-time role changes
newSocket.on("roleUpdated", ({ role }) => {
    console.log("Role updated in real-time:", role);

    setUser((previousUser) => {
        if (!previousUser) {
            return previousUser;
        }

        const updatedUser = {
            ...previousUser,
            role,
        };

        localStorage.setItem(
            "user",
            JSON.stringify(updatedUser)
        );

        return updatedUser;
    });
});

    newSocket.on("connect", async () => {
      console.log("Connected to Socket.IO");
      console.log("Socket ID:", newSocket.id);

      setIsConnected(true);

      // Join the room first
      newSocket.emit("joinRoom", roomId);

      // Wait for the server to create/check
      // the user's room membership
      setTimeout(async () => {
        try {
          const response = await fetch(
            `http://localhost:4000/api/messages/${roomId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          const data = await response.json();

          console.log("Messages API response:", data);

          if (response.ok && Array.isArray(data.messages)) {
            setMessages(data.messages);
          } else {
            console.error(
              "Failed to load messages:",
              data
            );

            setMessages([]);
          }
        } catch (error) {
          console.error(
            "Error loading messages:",
            error
          );

          setMessages([]);
        }
      }, 300);
    });

    // Receive new messages
    newSocket.on("receiveMessage", (newMessage) => {
      console.log(
        "New message received:",
        newMessage
      );

      setMessages((previousMessages) => [
        ...previousMessages,
        newMessage,
      ]);
    });

    // Someone is typing
newSocket.on("userTyping", (data) => {
    setTypingUser(data.name);
});

newSocket.on("userStoppedTyping", () => {
    setTypingUser("");
});

    newSocket.on("onlineUsers", (users) => {
    console.log("Online users received:", users);

    setOnlineUsers(users);
});


    newSocket.on("connect_error", (error) => {
      console.error(
        "Socket connection error:",
        error.message
      );

      setIsConnected(false);
    });

    newSocket.on("disconnect", () => {
      console.log(
        "Disconnected from Socket.IO"
      );

      setIsConnected(false);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [roomId]);

  const fetchAllUsers = async () => {
    try {
        const token = localStorage.getItem("token");

        const response = await fetch(
            "http://localhost:4000/api/users",
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        const data = await response.json();

        if (!response.ok) {
            console.error("Failed to fetch users:", data);
            return;
        }

        setAllUsers(data.users);
        setShowUserManagement(true);
    } catch (error) {
        console.error("Fetch users error:", error);
    }
};

const handleRoleChange = async (userId, newRole) => {
    try {
        const token = localStorage.getItem("token");

        const response = await fetch(
            `http://localhost:4000/api/users/${userId}/role`,
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    role: newRole,
                }),
            }
        );

        const data = await response.json();

        if (!response.ok) {
            console.error("Failed to update role:", data);
            return;
        }

        setAllUsers((previousUsers) =>
            previousUsers.map((member) =>
                member._id === userId
                    ? { ...member, role: newRole }
                    : member
            )
        );

        console.log("Role updated:", data);
    } catch (error) {
        console.error("Role change error:", error);
    }
};

// Confirm role change
const confirmRoleChange = async () => {
    if (!roleChangeUser || !roleChangeTo) {
        return;
    }

    await handleRoleChange(
        roleChangeUser._id,
        roleChangeTo
    );

    setShowRoleConfirm(false);
    setRoleChangeUser(null);
    setRoleChangeTo("");
};

  const handleCreateRoom = async () => {
    if (!newRoomName.trim()) {
        return;
    }

    try {
        const token = localStorage.getItem("token");

        const response = await fetch(
            "http://localhost:4000/api/rooms",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    name: newRoomName.trim(),
                    description: newRoomDescription.trim(),
                }),
            }
        );

        const data = await response.json();

        if (!response.ok) {
    console.error("Create room failed:", data);

    alert(
        data.message || "Only administrators can create rooms."
    );

    return;
}

        // Add the newly created room to the room list
        setRooms((previousRooms) => [
            data.room,
            ...previousRooms,
        ]);

        // Automatically select the new room
        setActiveRoom(data.room);

        // Clear the form
        setNewRoomName("");
        setNewRoomDescription("");

        // Close the popup
        setShowCreateRoom(false);
    } catch (error) {
        console.error("Create room error:", error);
    }
};

// Handle image selection
const handleImageSelect = (e) => {
    const file = e.target.files[0];

    if (!file) {
        return;
    }

    // Allow only images
    if (!file.type.startsWith("image/")) {
        alert("Please select an image file.");
        return;
    }

    // Maximum image size: 5 MB
    if (file.size > 5 * 1024 * 1024) {
        alert("Image size must be less than 5 MB.");
        return;
    }

    setSelectedImage(file);

    // Create preview
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
};

const startRecording = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });

    audioChunksRef.current = [];

    const mediaRecorder = new MediaRecorder(stream);

    mediaRecorderRef.current = mediaRecorder;

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunksRef.current.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(audioChunksRef.current, {
        type: mediaRecorder.mimeType || "audio/webm",
      });

      setAudioBlob(blob);
      setAudioPreview(URL.createObjectURL(blob));

      stream.getTracks().forEach((track) => track.stop());
    };

    mediaRecorder.start();
    setIsRecording(true);
  } catch (error) {
    console.error("Microphone access error:", error);
    alert("Please allow microphone access to record voice messages.");
  }
};

const stopRecording = () => {
  if (mediaRecorderRef.current && isRecording) {
    mediaRecorderRef.current.stop();
    setIsRecording(false);
  }
};

  // Handle sending text and image messages
const handleSendMessage = async (e) => {
    e.preventDefault();

    // Allow text, image, or audio messages
    if (!message.trim() && !selectedImage && !audioBlob) {
        return;
    }

    if (!socket || !socket.connected) {
        console.error("Socket is not connected");
        return;
    }

    try {
        let imageUrl = "";
        let audioUrl = "";

        const token = localStorage.getItem("token");

        // Upload image if selected
        if (selectedImage) {
            setIsUploadingImage(true);

            const formData = new FormData();
            formData.append("image", selectedImage);

            const response = await fetch(
                "http://localhost:4000/api/images/upload",
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    body: formData,
                }
            );

            const data = await response.json();

            if (!response.ok) {
                console.error("Image upload failed:", data);
                return;
            }

            imageUrl = data.imageUrl;
        }

        // Upload voice note if recorded
        if (audioBlob) {
            setIsUploadingAudio(true);

            const formData = new FormData();

            const audioFile = new File(
                [audioBlob],
                "voice-message.webm",
                {
                    type: audioBlob.type || "audio/webm",
                }
            );

            formData.append("audio", audioFile);

            const response = await fetch(
                "http://localhost:4000/api/audio/upload",
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    body: formData,
                }
            );

            const data = await response.json();

            if (!response.ok) {
                console.error("Audio upload failed:", data);
                return;
            }

            audioUrl = data.audioUrl;
        }

        // Send text, image, and/or audio through Socket.IO
        // Send text, image, audio, and reply through Socket.IO
socket.emit("sendMessage", {
    roomId,
    message: message.trim(),
    imageUrl,
    audioUrl,

    // Reply to selected message
    replyTo: replyingTo?._id || null,
});
setReplyingTo(null);

        // Clear message and image preview
        setMessage("");
        setSelectedImage(null);
        setImagePreview("");

        // Clear audio preview
        if (audioPreview) {
            URL.revokeObjectURL(audioPreview);
        }

        setAudioBlob(null);
        setAudioPreview("");

    } catch (error) {
        console.error("Send message error:", error);
    } finally {
        setIsUploadingImage(false);
        setIsUploadingAudio(false);
    }
};

  const typingTimeoutRef = useRef(null);

const handleKeyDown = (e) => {
    if (!socket || !socket.connected) {
        return;
    }

    // Enter = send message
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();

        socket.emit("stopTyping", roomId);

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        handleSendMessage(e);

        return;
    }

    // User is typing
    socket.emit("typing", roomId);

    // Reset the timer every time the user presses a key
    if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
        socket.emit("stopTyping", roomId);
        setTypingUser(null);
    }, 1000);
};

  const getInitials = () => {
    if (!user?.name) {
      return "U";
    }

    return user.name
      .split(" ")
      .map((name) => name[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  const formatTime = (date) => {
    if (!date) {
      return "";
    }

    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="chat-app">

      {/* ================= SIDEBAR ================= */}

      <aside className="chat-sidebar">

        <div className="sidebar-header">
          <div className="brand-icon">
            💬
          </div>

          <div>
            <h2>ChatFlow</h2>
            <span>Collaboration</span>
          </div>
        </div>

        <div className="sidebar-section">
    <div className="section-title rooms-title">
    <span>ROOMS</span>

    <button
    className="add-room-button"
    onClick={() => {
        if (
            user?.role !== "owner" &&
            user?.role !== "admin"
        ) {
            setShowAdminOnly(true);
            return;
        }

        setShowCreateRoom(true);
    }}
>
    +
</button>
</div>

  {rooms.map((room) => (
    <div
        className={`room-item ${
            activeRoom?._id === room._id ? "active" : ""
        }`}
        key={room._id}
        onClick={() => setActiveRoom(room)}
    >
        <span className="room-icon">#</span>

        <span className="room-name">
            {room.name}
        </span>

        {room.createdBy?._id === user?._id && (
    <button
        className="delete-room-button"
        onClick={(e) => {
            e.stopPropagation();
            handleDeleteRoom(room._id);
        }}
        title="Delete room"
    >
        ×
    </button>
)}
    </div>
))}
</div>

<div className="sidebar-section online-users-section">
  <div className="section-title">
    ONLINE USERS
    <span className="online-count">
      {onlineUsers.length}
    </span>
  </div>

  <div className="online-users-list">
    {onlineUsers.map((onlineUser) => (
      <div
        className="online-user"
        key={onlineUser._id}
      >
        <div className="online-user-avatar">
          {onlineUser.name
            ? onlineUser.name.charAt(0).toUpperCase()
            : "U"}
        </div>

        <div className="online-user-info">
          <span className="online-user-name">
            {onlineUser.name}
          </span>

          <span className="online-user-status">
            <i className="online-dot"></i>
            Online
          </span>
        </div>
      </div>
    ))}
  </div>
</div>

        <div className="sidebar-bottom">

          <div className="profile-card">

            <div className="avatar">
              {getInitials()}
            </div>

            <div className="profile-info">
              <strong>
                {user?.name || "User"}
              </strong>

              <span>
                <i className={isConnected ? "online-dot" : "offline-dot"}></i>
                {isConnected ? "Online" : "Offline"}
              </span>
            </div>

          </div>

          {user?.role === "owner" && (
    <button
        className="manage-users-button"
        onClick={fetchAllUsers}
    >
        👥 Manage Users
    </button>
)}

          <button
            className="logout-button"
            onClick={onLogout}
          >
            <span>↪</span>
            Logout
          </button>

        </div>

      </aside>


      {/* ================= MAIN CHAT ================= */}

      <main className="chat-main">

        {/* Header */}

        <header className="chat-header">

          <div className="chat-header-left">

            <div className="header-room-icon">
              #
            </div>

            <div>
              <h1>{activeRoom?.name || "General"}</h1>

              <p>
                {activeRoom?.description || "Team collaboration room"}
              </p>
            </div>

          </div>

          <div className="connection-status">

            <span
              className={
                isConnected
                  ? "status-dot connected"
                  : "status-dot disconnected"
              }
            ></span>

            {isConnected
              ? "Connected"
              : "Connecting..."
            }

          </div>

        </header>


        {/* Messages */}

        <section className="messages-container">

          {messages.length === 0 ? (

            <div className="empty-chat">

              <div className="empty-icon">
                💬
              </div>

              <h2>
                No messages yet
              </h2>

              <p>
                Start the conversation with your team.
              </p>

            </div>

          ) : (

            <div className="messages-list">

              {messages.map((msg, index) => {

                const isOwnMessage =
                  msg.sender === user?.id ||
                  msg.sender?._id === user?.id;

                return (
                  <div
                    className={`message-row ${
                      isOwnMessage ? "own" : ""
                    }`}
                    key={
                      msg._id ||
                      `${msg.createdAt}-${index}`
                    }
                  >

                    {!isOwnMessage && (
                      <div className="message-avatar">
                        {msg.sender?.name
                          ? msg.sender.name
                              .charAt(0)
                              .toUpperCase()
                          : "U"}
                      </div>
                    )}

                    <div className="message-content">

                      {!isOwnMessage && (
                        <div className="sender-name">
  {msg.sender?.name || "User"}
</div>
                      )}

                      <div
    className="message-bubble"

    onTouchStart={(e) => {
        touchStartX.current = e.touches[0].clientX;
    }}

    onTouchEnd={(e) => {
        if (touchStartX.current === null) return;

        const touchEndX = e.changedTouches[0].clientX;
        const swipeDistance = touchEndX - touchStartX.current;

        // Swipe left to reply
        if (swipeDistance < -60) {
            setReplyingTo({
                _id: msg._id,
                sender: isOwnMessage
                    ? "You"
                    : msg.sender?.name || "User",
                message: msg.message || "",
                imageUrl: msg.imageUrl || "",
                audioUrl: msg.audioUrl || "",
            });
        }

        touchStartX.current = null;
    }}

    onMouseDown={(e) => {
    touchStartX.current = e.clientX;
}}

onMouseUp={(e) => {
    if (touchStartX.current === null) return;

    const mouseEndX = e.clientX;
    const dragDistance = mouseEndX - touchStartX.current;

    if (dragDistance < -60) {
        setReplyingTo({
            _id: msg._id,
            sender: isOwnMessage
                ? "You"
                : msg.sender?.name || "User",
            message: msg.message || "",
            imageUrl: msg.imageUrl || "",
            audioUrl: msg.audioUrl || "",
        });
    }

    touchStartX.current = null;
}}
>
                        {/* Display the message being replied to */}
{msg.replyTo && (
    <div className="quoted-reply">
        <strong>↩ Replied message</strong>

        <p>
            {msg.replyToMessage ||
                (msg.replyToImage
                    ? "📷 Photo"
                    : msg.replyToAudio
                    ? "🎤 Voice message"
                    : "Message")}
        </p>
    </div>
)}

    {/* Display image if the message contains one */}
    {msg.imageUrl && (
        <img
            src={msg.imageUrl}
            alt="Shared"
            className="chat-message-image"
            onClick={() => window.open(msg.imageUrl, "_blank")}
        />
    )}

    {/* Display audio if the message contains a voice note */}
{msg.audioUrl && (
    <div className="chat-audio-message">
        <audio controls preload="metadata">
            <source src={msg.audioUrl} type="audio/webm" />
            Your browser does not support audio playback.
        </audio>
    </div>
)}

    {/* Display text if the message contains one */}
    {msg.message && (
        <div className="message-text">
            {msg.message}
        </div>
    )}

</div>

                      <div className="message-time">
    {formatTime(msg.createdAt)}
</div>

{/* Reply icon */}
<button
    type="button"
    className="reply-message-button"
    title="Reply"
    onClick={() => {
        setReplyingTo({
            _id: msg._id,
            sender: isOwnMessage
                ? "You"
                : msg.sender?.name || "User",
            message: msg.message || "",
            imageUrl: msg.imageUrl || "",
            audioUrl: msg.audioUrl || "",
        });
    }}
>
    ↩
</button>



                    </div>

                  </div>
                );
              })}

              <div ref={messagesEndRef}></div>

            </div>

          )}

        </section>


        {typingUser && (
    <div className="typing-indicator">
        {typingUser} is typing
        <span>•••</span>
    </div>
)}

        <div className="message-input-area">
             {/* Emoji Picker */}
{showEmojiPicker && (
    <div
        className="emoji-picker-container"
        ref={emojiPickerRef}
    >
        <EmojiPicker
    skinTonesDisabled={true}
    onEmojiClick={(emojiData) => {
        setMessage((previousMessage) =>
            previousMessage + emojiData.emoji
        );
    }}
/>
    </div>
)}

          <form
    className="message-form"
    onSubmit={handleSendMessage}
>

    {/* Reply preview */}
{replyingTo && (
    <div className="reply-preview">
        <div className="reply-preview-content">
            <strong>
                Replying to {replyingTo.sender}
            </strong>

            <p>
                {replyingTo.message ||
                    (replyingTo.imageUrl
                        ? "📷 Photo"
                        : replyingTo.audioUrl
                        ? "🎤 Voice message"
                        : "Message")}
            </p>
        </div>

        <button
            type="button"
            className="cancel-reply-button"
            title="Cancel reply"
            onClick={() => setReplyingTo(null)}
        >
            ×
        </button>
    </div>
)}

    {!audioPreview && (
    <div className="message-input-wrapper">

       

        {/* Selected image preview */}
        {imagePreview && (
            <div className="selected-image-preview">
                <img
                    src={imagePreview}
                    alt="Selected"
                    className="selected-image-thumbnail"
                />

                <span className="selected-image-name">
                    {selectedImage?.name}
                </span>

                <button
                    type="button"
                    className="remove-selected-image"
                    title="Remove image"
                    onClick={() => {
                        URL.revokeObjectURL(imagePreview);
                        setImagePreview("");
                        setSelectedImage(null);
                    }}
                >
                    ×
                </button>
            </div>
        )}

        

        {/* Emoji button */}
{!audioPreview && (
<button
    ref={emojiButtonRef}
    type="button"
    className="emoji-button"
    title="Emoji"
    onClick={() =>
        setShowEmojiPicker((previous) => !previous)
    }
>
    <FiSmile />
</button>
)}

        {/* Message input */}
        <input
            type="text"
            value={message}
            onChange={(e) => {
                setMessage(e.target.value);

                if (socket && socket.connected) {
                    if (e.target.value.trim()) {
                        socket.emit("typing", { roomId });
                    } else {
                        socket.emit("stopTyping", { roomId });
                    }
                }
            }}
            onKeyDown={handleKeyDown}
            placeholder="Write a message..."
        />

        {/* Image and microphone buttons — hide when audio preview is active */}
{!audioPreview && (
    <>
        {/* Image upload button */}
        <label
            htmlFor="image-upload"
            className="image-upload-button"
            title="Send image"
        >
            <FiImage />
        </label>

        {/* Voice recording button */}
        <button
            type="button"
            onClick={isRecording ? stopRecording : startRecording}
            title={isRecording ? "Stop recording" : "Record voice message"}
            className={isRecording ? "recording-button" : "mic-button"}
        >
            {isRecording ? <FiSquare /> : <FiMic />}
        </button>
    </>
)}

        <input
            id="image-upload"
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            style={{ display: "none" }}
        />

    </div>
)}

    {/* Voice note preview */}
{audioPreview && (
    <div className="audio-preview">

        {/* Audio player */}
        <audio controls src={audioPreview} />

        {/* Delete voice preview */}
        <button
            type="button"
            className="remove-audio-preview"
            title="Remove voice message"
            onClick={() => {
                URL.revokeObjectURL(audioPreview);
                setAudioPreview("");
                setAudioBlob(null);
            }}
        >
            <FiTrash2 />
        </button>

        {/* Microphone icon */}
        <button
            type="button"
            onClick={isRecording ? stopRecording : startRecording}
            title={isRecording ? "Stop recording" : "Record voice message"}
            className={isRecording ? "recording-button" : "mic-button"}
        >
            {isRecording ? <FiSquare /> : <FiMic />}
        </button>

        {/* Image upload icon */}
        <label
            htmlFor="image-upload"
            className="image-upload-button"
            title="Send image"
        >
            <FiImage />
        </label>

    </div>
)}


    {/* Send button */}
    <button
        type="submit"
        disabled={
    (!message.trim() && !selectedImage && !audioBlob) ||
    !isConnected ||
    isUploadingImage ||
    isUploadingAudio
}
        title={
    isUploadingImage
        ? "Uploading image..."
        : isUploadingAudio
        ? "Uploading voice message..."
        : "Send message"
}
    >
        <span>
            {isUploadingImage ? "..." : "➤"}
        </span>
    </button>

</form>
          <p className="input-hint">
            Press Enter to send
          </p>

        </div>

      </main>

      {showAdminOnly && (
    <div className="admin-only-overlay">
        <div className="admin-only-modal">
            <button
                className="admin-only-close"
                onClick={() => setShowAdminOnly(false)}
            >
                ×
            </button>

            <div className="admin-only-icon">
                🔒
            </div>

            <h2>Admin Only</h2>

            <p>
                Only administrators can create new rooms.
            </p>

            <button
                className="admin-only-button"
                onClick={() => setShowAdminOnly(false)}
            >
                Got it
            </button>
        </div>
    </div>
)}

{showDeleteConfirm && (
    <div className="delete-confirm-overlay">
        <div className="delete-confirm-modal">

            <button
                className="delete-confirm-close"
                onClick={() => {
                    setShowDeleteConfirm(false);
                    setRoomToDelete(null);
                }}
            >
                ×
            </button>

            <div className="delete-confirm-icon">
                🗑️
            </div>

            <h2>Delete Room?</h2>

            <p>
                Are you sure you want to delete{" "}
                <strong>
                    "{roomToDelete?.name}"
                </strong>
                ?
                <br />
                This action cannot be undone.
            </p>

            <div className="delete-confirm-actions">

                <button
                    className="delete-cancel-button"
                    onClick={() => {
                        setShowDeleteConfirm(false);
                        setRoomToDelete(null);
                    }}
                >
                    Cancel
                </button>

                <button
                    className="delete-confirm-button"
                    onClick={confirmDeleteRoom}
                >
                    Delete Room
                </button>

            </div>

        </div>
    </div>
)}

{showRoleConfirm && (
    <div className="role-confirm-overlay">
        <div className="role-confirm-modal">

            <button
                className="role-confirm-close"
                onClick={() => {
                    setShowRoleConfirm(false);
                    setRoleChangeUser(null);
                    setRoleChangeTo("");
                }}
            >
                ×
            </button>

            <div className="role-confirm-icon">
                👤
            </div>

            <h2>Change User Role?</h2>

            <p>
                Are you sure you want to change{" "}
                <strong>
                    {roleChangeUser?.name}
                </strong>
                's role to{" "}
                <strong>
                    {roleChangeTo === "admin"
                        ? "Admin"
                        : "Member"}
                </strong>
                ?
            </p>

            <div className="role-confirm-actions">

                <button
                    className="role-cancel-button"
                    onClick={() => {
                        setShowRoleConfirm(false);
                        setRoleChangeUser(null);
                        setRoleChangeTo("");
                    }}
                >
                    Cancel
                </button>

                <button
                    className="role-confirm-button"
                    onClick={confirmRoleChange}
                >
                    Confirm Change
                </button>

            </div>

        </div>
    </div>
)}

      {showCreateRoom && (
    <div className="create-room-overlay">
        <div className="create-room-modal">
            <h2>Create a new room</h2>

            <input
                type="text"
                placeholder="Room name"
                value={newRoomName}
                onChange={(e) =>
                    setNewRoomName(e.target.value)
                }
            />

            <textarea
                placeholder="Room description"
                value={newRoomDescription}
                onChange={(e) =>
                    setNewRoomDescription(e.target.value)
                }
            />

            <div className="create-room-actions">
                <button
                    type="button"
                    onClick={() => {
                        setShowCreateRoom(false);
                        setNewRoomName("");
                        setNewRoomDescription("");
                    }}
                >
                    Cancel
                </button>

                <button
                    type="button"
                    onClick={handleCreateRoom}
                >
                    Create Room
                </button>
            </div>
        </div>
    </div>
)}

{showUserManagement && (
    <div className="user-management-overlay">
        <div className="user-management-modal">

            <button
                className="user-management-close"
                onClick={() => setShowUserManagement(false)}
            >
                ×
            </button>

            <h2>User Management</h2>

            <p className="user-management-subtitle">
                Manage roles and permissions
            </p>

            <div className="user-management-list">
                {allUsers.map((member) => (
                    <div
                        className="user-management-item"
                        key={member._id}
                    >
                        <div className="user-management-avatar">
                            {member.name
                                ?.charAt(0)
                                .toUpperCase()}
                        </div>

                        <div className="user-management-info">
                            <div className="user-management-name">
                                {member.name}
                            </div>

                            <div className="user-management-email">
                                {member.email}
                            </div>
                        </div>

                        {member.role === "owner" ? (
    <div className="user-management-role">
        Owner
    </div>
) : (
    <select
        className="user-management-role-select"
        value={member.role}
        onChange={(e) => {
    setRoleChangeUser(member);
    setRoleChangeTo(e.target.value);
    setShowRoleConfirm(true);
}}
    >
        <option value="member">Member</option>
        <option value="admin">Admin</option>
    </select>
)}
                    </div>
                ))}
            </div>

        </div>
    </div>
)}

    </div>
  );
}

export default Chat;