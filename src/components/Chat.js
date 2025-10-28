import {useState, useRef, useEffect} from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "../css/page/AiChat.css";

const PendingMessage = ({baseText = "답변을 기다리는 중입니다..."}) => {
    const [len, setLen] = useState(1);

    useEffect(() => {
        const interval = setInterval(() => {
            setLen((prev) => (prev >= baseText.length ? 1 : prev + 1));
        }, 300);
        return () => clearInterval(interval);
    }, [baseText.length]);

    return (
        <p className="bot-pending">
            <span className="pending-spinner" aria-hidden="true"/>
            <span className="pending-text">{baseText.slice(0, len)}</span>
        </p>
    );
};

const Chat = ({selectedChannel}) => {
    const baseApi = `${process.env.REACT_APP_AI_BASE_URL}/api/v1/watson/c`;

    const [messagesByChannel, setMessagesByChannel] = useState({});
    const [userInput, setUserInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [showTooltip, setShowTooltip] = useState(false);
    const inputRef = useRef(null);
    const headerRef = useRef(null);

    const channelKey = selectedChannel ? (selectedChannel.channelId ?? selectedChannel.id) : null;
    const currentMessages = channelKey ? (messagesByChannel[channelKey] || []) : [];

    const addMessage = (sender, message, opts = {}) => {
        if (!channelKey) return;
        const {pending = false, messageId = null} = opts;
        setMessagesByChannel((prev) => {
            const prevArr = prev[channelKey] ? [...prev[channelKey]] : [];
            const msgObj = {sender, message, pending, messageId};
            return {...prev, [channelKey]: [...prevArr, msgObj]};
        });
    };

    const replaceMessage = (messageId, newFields) => {
        if (!channelKey) return;
        setMessagesByChannel((prev) => {
            const prevArr = prev[channelKey] ? [...prev[channelKey]] : [];
            const newArr = prevArr.map((m) => {
                if (m.messageId && messageId && String(m.messageId) === String(messageId)) {
                    return {...m, ...newFields};
                }
                return m;
            });
            return {...prev, [channelKey]: newArr};
        });
    };

    const handleSendMessage = async () => {
        if (!selectedChannel || !(selectedChannel.channelId ?? selectedChannel.id)) {
            addMessage("bot", "채널을 먼저 선택해주세요.");
            return;
        }

        const message = userInput.trim();
        if (!message) return;

        addMessage("user", message);
        setUserInput("");
        setLoading(true);

        const channelKeyLocal = selectedChannel.channelId ?? selectedChannel.id;
        const pendingId = `pending-${Date.now()}`;
        addMessage("bot", "답변을 기다리는 중입니다.", {pending: true, messageId: pendingId});

        try {
            const askUrl = `${baseApi}/${encodeURIComponent(channelKeyLocal)}?q=${encodeURIComponent(message)}`;
            const res = await fetch(askUrl, {
                method: "GET",
                credentials: "include",
                headers: {"Accept": "application/json"},
            });
            const data = await res.json();

            replaceMessage(pendingId, {sender: "bot", message: data.answer || "응답이 없습니다.", pending: false});
        } catch (err) {
            console.error(err);
            replaceMessage(pendingId, {sender: "bot", message: "서버 오류가 발생했습니다.", pending: false});
        } finally {
            setLoading(false);
        }
    };

    const handleResetChat = async () => {
        if (!selectedChannel || !(selectedChannel.channelId ?? selectedChannel.id)) {
            addMessage("bot", "채널을 먼저 선택해주세요.");
            return;
        }

        setLoading(true);
        try {
            const channelKey = selectedChannel.channelId ?? selectedChannel.id;
            const resetUrl = `${baseApi}/${encodeURIComponent(channelKey)}`;
            const res = await fetch(resetUrl, {
                method: "POST",
                credentials: "include",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    action: "reset",
                    channel_ids: selectedChannel.id ? [Number(selectedChannel.id)] : [],
                    origin_channel_ids: selectedChannel.channelId ? [String(selectedChannel.channelId)] : [],
                    scope: "local",
                }),
            });
            const data = await res.json();

            setMessagesByChannel((prev) => ({...prev, [channelKey]: []}));
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

    useEffect(() => {
        if (!selectedChannel) {
            setUserInput("");
        }
        setShowTooltip(false);
    }, [selectedChannel]);

    return (
        <div className="chat-wrapper">
            <header className="chat-header" ref={headerRef} style={{position: "absolute", top: "50px", right: "80px"}}>
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
                        <div className="tooltip-arrow"/>
                    </div>
                )}
            </header>
            <div className="chat-messages">
                {currentMessages.map((msg, i) => (
                    <div key={msg.messageId || i}
                         className={`chat-message ${msg.sender === "user" ? "user-message" : "bot-message"}`}>
                        {msg.sender === "bot" ? (
                            msg.pending ? (
                                <PendingMessage baseText="답변을 기다리는 중입니다."/>
                            ) : (
                                <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
                                    {msg.message}
                                </ReactMarkdown>
                            )
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
