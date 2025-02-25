import { useState } from "react";

export default function Chat() {
    const apiEndpoint = "http://127.0.0.1:5000/watson/c";
    const [messages, setMessages] = useState([]);
    const [userInput, setUserInput] = useState("");
    const [selectedChannel, setSelectedChannel] = useState(null);  // 선택한 채널 ID
    const [loading, setLoading] = useState(false);

    const addMessage = (sender, message) => {
        setMessages((prevMessages) => [...prevMessages, { sender, message }]);
    };

    // 메시지 전송 (action = "ask")
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
                    channel_ids: [String(selectedChannel)],  // String 변환 유지
                    scope: "global",  // 변경된 scope 반영
                    question: message,
                }),
            });

            const data = await response.json();
            const aiResponse = data.answer || "No response from Watson.";  // 변경된 부분
            addMessage("bot", aiResponse);
        } catch (error) {
            console.error("Error occurred:", error);
            addMessage("bot", "서버 오류가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    };

    // 대화 리셋 (action = "reset")
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
                        <p dangerouslySetInnerHTML={{ __html: msg.message.replace(/\n/g, "<br />") }} />
                    </div>
                ))}
            </div>

            {/* 채널 선택 버튼 추가 */}
            <div className="channel-selection">
                <button onClick={() => setSelectedChannel(1890652954)} className={selectedChannel === 1890652954 ? "active" : ""}>
                    채널 1890652954 선택
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
                <button onClick={handleSendMessage}>보내기</button>
                <button onClick={handleResetChat}>대화 리셋</button>
            </div>
        </div>
    );
}
