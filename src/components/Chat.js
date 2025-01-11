import { useState } from "react";

export default function Chat() {
    const apiKey = process.env.REACT_APP_CHAT_API_KEY; // Replace with your API key
    const apiEndpoint = "https://api.openai.com/v1/chat/completions";
    const [messages, setMessages] = useState([]);
    const [userInput, setUserInput] = useState("");
    const [loading, setLoading] = useState(false);

    const addMessage = (sender, message) => {
        setMessages((prevMessages) => [...prevMessages, { sender, message }]);
    };

    const handleSendMessage = async () => {
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
                    Authorization: `Bearer ${apiKey}`,
                },
                body: JSON.stringify({
                    model: "gpt-4o-mini",
                    messages: [
                        {
                            role: "system",
                            content: "You are Watson, assisting Sherlock Holmes with great insight.",
                        },
                        ...messages.map((msg) => ({
                            role: msg.sender === "user" ? "user" : "assistant",
                            content: msg.message,
                        })),
                        { role: "user", content: message },
                    ],
                    max_tokens: 1024,
                    temperature: 0.7,
                }),
            });

            const data = await response.json();
            const aiResponse = data.choices?.[0]?.message?.content || "No response";
            addMessage("bot", aiResponse);
        } catch (error) {
            console.error("Error occurred:", error);
            addMessage("bot", "An error occurred while processing your request.");
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
                {loading && <div className="loading-indicator">Processing your request...</div>}
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        className={`chat-message ${
                            msg.sender === "user" ? "user-message" : "bot-message"
                        }`}
                    >
                        <p>{`${msg.sender === "user" ? "You" : "Watson"}: ${msg.message}`}</p>
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
            </div>
        </div>
    );
}
