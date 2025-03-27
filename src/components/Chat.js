import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";

export default function Chat() {
    const apiEndpoint = "http://34.64.201.10:5000/watson/c";
    const [messages, setMessages] = useState([]);
    const [userInput, setUserInput] = useState("");
    const [selectedChannel, setSelectedChannel] = useState(null);
    const [loading, setLoading] = useState(false);

    const addMessage = (sender, message) => {
        setMessages((prevMessages) => [...prevMessages, { sender, message }]);
    };

    const handleSendMessage = async () => {
        if (!selectedChannel) {
            addMessage("bot", "채널을 먼저 선택해주세요.");
            return;
        }

        const message = userInput.trim();
        if (message.length === 0) return;

        addMessage("user", message);
        setUserInput("");
        setLoading(true);

        try {
            const response = await fetch(apiEndpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    action: "ask",
                    channel_ids: [selectedChannel],
                    scope: "local",
                    question: message,
                }),
            });

            const data = await response.json();
            const aiResponse = data.answer || "No response from Watson.";
            addMessage("bot", aiResponse);
        } catch (error) {
            console.error("Error occurred:", error);
            addMessage("bot", "서버 오류가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    };

    const handleResetChat = async () => {
        if (!selectedChannel) {
            addMessage("bot", "채널을 먼저 선택해주세요.");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(apiEndpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    action: "reset",
                    channel_ids: [selectedChannel],
                    scope: "local",
                }),
            });

            const data = await response.json();
            addMessage("bot", data.response || "대화가 리셋되었습니다.");
        } catch (error) {
            console.error("Error occurred:", error);
            addMessage("bot", "서버 오류가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (event) => {
        if (event.key === "Enter") {
            handleSendMessage();
        }
    };

    return (
        <div className="chat-wrapper">
            <div className="chat-messages">
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        className={`chat-message ${
                            msg.sender === "user" ? "user-message" : "bot-message"
                        }`}
                    >
                        {msg.sender === "bot" ? (
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                rehypePlugins={[rehypeHighlight]}
                            >
                                {msg.message}
                            </ReactMarkdown>
                        ) : (
                            <p>{msg.message}</p>
                        )}
                    </div>
                ))}
            </div>

            <div className="channel-selection">
                <button
                    onClick={() => setSelectedChannel(1334212632)}
                    className={selectedChannel === 1334212632 ? "active" : ""}
                >
                    채널 '겨울왕국 후기' 선택
                </button>
            </div>

            <div className="chat-input">
                <input
                    type="text"
                    placeholder="메세지를 입력해 주세요."
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                />
                <button className="button-send" onClick={handleSendMessage}>
                    보내기
                </button>
                <button className="button-reset" onClick={handleResetChat}>
                    대화 리셋
                </button>
            </div>
        </div>
    );
}
