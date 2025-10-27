import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "../css/page/AiChat.css";

const Chat = ({ channelId }) => {
    const apiEndpoint = `${process.env.REACT_APP_AI_BASE_URL}/api/v1/watson/c`;
    const [messages, setMessages] = useState([]);
    const [userInput, setUserInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [showTooltip, setShowTooltip] = useState(false);
    const inputRef = useRef(null);
    const headerRef = useRef(null);

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

    // Hide tooltip on click outside or blur
    useEffect(() => {
        if (!showTooltip) return;
        function handleClickOutside(event) {
            if (
                headerRef.current &&
                !headerRef.current.contains(event.target) &&
                inputRef.current &&
                event.target !== inputRef.current
            ) {
                setShowTooltip(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showTooltip]);

    return (
        <div className="chat-wrapper">
            <header className="chat-header" ref={headerRef} style={{ position: "absolute", top: "50px", right: "80px" }}>
                {showTooltip && (
                    <div className="tooltip-box top" style={{width: "340px"}}>
                        <div className="tooltip-content">
                            <h2>선택한 채널에 대해 질문할 수 있습니다.</h2>
                            <p>"이 채널에서 거래되는 마약의 가격은?"</p>
                            <p>"이 채널에서 마약을 구매하려면 어디로 연락하지?"</p>
                            <p>"거래 지역에 대한 단서도 있나?"</p>
                            <p>"거래되는 마약의 종류는?"</p>
                            <p>"이 채널에서 할인이나 이벤트도 있었어?"</p>
                            <p>"거래 방식이 어떻게 돼?"</p>
                        </div>
                        <div className="tooltip-arrow" />
                    </div>
                )}
            </header>
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
                    ref={inputRef}
                    onFocus={() => setShowTooltip(true)}
                    onBlur={() => setTimeout(() => setShowTooltip(false), 100)}
                />
                <button className="chat-button" onClick={handleSendMessage}>질문하기</button>
                <button className="chat-button-reset" onClick={handleResetChat}>대화 리셋</button>
            </div>
        </div>
    );
};

export default Chat;