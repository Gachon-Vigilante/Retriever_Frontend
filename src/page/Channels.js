import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import "../css/page/Channels.css";

const Channels = () => {
    const [channels, setChannels] = useState([]);

    // Simulated API call to fetch channel data (placeholder)
    useEffect(() => {
        // Placeholder data for now
        const fetchedChannels = [
            { id: 1, name: "Channel 1", detail: "3 new Chats" },
            { id: 2, name: "Channel 2", detail: "5 new Chats" },
            { id: 3, name: "Channel 3", detail: "1 new Chat" },
            { id: 4, name: "Channel 4", detail: "" },
            { id: 5, name: "Channel 5", detail: "" },
            { id: 6, name: "Channel 6", detail: "" },
        ];
        setChannels(fetchedChannels);
    }, []);

    return (
        <div className="channel-page">
            <Sidebar />
            <main className="channel-main">
                <header className="channel-header">
                    <h1>Telegram Channels</h1>
                </header>
                <section className="channel-list">
                    {channels.length === 0 ? (
                        <p className="no-channels">No channels available</p>
                    ) : (
                        <ul>
                            {channels.map((channel) => (
                                <li key={channel.id} className="channel-item">
                                    <div className="channel-info">
                                        <p className="channel-name">{channel.name}</p>
                                        <p className="channel-detail">{channel.detail}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            </main>
        </div>
    );
};

export default Channels;
