import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";

const Chat = ({ channelId }) => {
    const apiEndpoint = "http://localhost:5050/watson/c"; // 일단은 로컬
    const [messages, setMessages] = useState([]);
    const [userInput, setUserInput] = useState("");
    const [loading, setLoading] = useState(false);

    const addMessage = (sender, message) => {
        setMessages((prev) => [...prev, { sender, message }]);
    };

    const handleSendMessage = async () => {
        if (!channelId) {
            addMessage("bot", "채널을 먼저 선택해주세요.");
            return;
        }

        const message = userInput.trim();
        if (!message) return;

        addMessage("user", message);
        setUserInput("");
        setLoading(true);

        try {
            const res = await fetch(apiEndpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "ask",
                    channel_ids: [Number(channelId)],  // ✅ 여기 수정
                    scope: "local",
                    question: message,
                }),
            });

            const data = await res.json();
            addMessage("bot", data.answer || "응답이 없습니다.");
        } catch (err) {
            console.error(err);
            addMessage("bot", "서버 오류가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    };

    const handleResetChat = async () => {
        if (!channelId) {
            addMessage("bot", "채널을 먼저 선택해주세요.");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(apiEndpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "reset",
                    channel_ids: [Number(channelId)],  // ✅ 여기도 수정
                    scope: "local",
                }),
            });

            const data = await res.json();
            addMessage("bot", data.response || "대화가 초기화되었습니다.");
        } catch (err) {
            console.error(err);
            addMessage("bot", "서버 오류가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") handleSendMessage();
    };

    return (
        <div className="chat-wrapper">
            <div className="chat-messages">
                {messages.map((msg, i) => (
                    <div key={i} className={`chat-message ${msg.sender === "user" ? "user-message" : "bot-message"}`}>
                        {msg.sender === "bot" ? (
                            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
                                {msg.message}
                            </ReactMarkdown>
                        ) : (
                            <p>{msg.message}</p>
                        )}
                    </div>
                ))}
            </div>

            <div className="chat-input">
                <input
                    type="text"
                    placeholder="메세지를 입력해 주세요."
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                />
                <button onClick={handleSendMessage}>보내기</button>
                <button onClick={handleResetChat}>대화 리셋</button>
            </div>
        </div>
    );
};

export default Chat;