import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import axios from "axios";
import "../css/page/Channels.css";

const Channel = () => {
    const [channels, setChannels] = useState([]); // Stores list of channels (ChInfo)
    const [selectedChannel, setSelectedChannel] = useState(null); // Tracks the selected channel
    const [channelDetails, setChannelDetails] = useState(null); // Stores detailed data for selected channel

    // Fetch all channels (ChInfo) when the component mounts
    useEffect(() => {
        const fetchChannels = async () => {
            try {
                const response = await axios.get("/channels/all"); // Fetch channel list
                setChannels(response.data);
            } catch (error) {
                console.error("Error fetching channels:", error);
            }
        };

        fetchChannels();
    }, []);

    // Fetch details of the selected channel (ChData) by channelID
    const fetchChannelDetails = async (channelID) => {
        try {
            const response = await axios.get(`/chat/channel/${channelID}`); // Fetch by channelID
            setChannelDetails(response.data); // Set channel details in state
        } catch (error) {
            console.error("Error fetching channel details:", error);
        }
    };

    const handleChannelClick = (channel) => {
        setSelectedChannel(channel.channelId); // Set the selected channelID
        fetchChannelDetails(channel.channelId); // Fetch details for the selected channel
    };

    return (
        <div className="channel-page">
            <Sidebar />
            <main className="channel-main">
                <header className="channel-header">
                    <h1>Telegram Channels</h1>
                    <button className="download-button">Download Channel Data</button>
                </header>

                <section className="channel-list">
                    <h3>Channel List</h3>
                    {channels.length === 0 ? (
                        <p>No channels available</p>
                    ) : (
                        <ul>
                            {channels.map((channel) => (
                                <li
                                    key={channel.channelId} // Changed key to use channelId
                                    className={`channel-item ${
                                        selectedChannel === channel.channelId ? "active" : ""
                                    }`}
                                    onClick={() => handleChannelClick(channel)}
                                >
                                    <div className="channel-info">
                                        <p className="channel-name">{channel.name}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>

                <section className="channel-details">
                    <h3>Selected Channel Details</h3>
                    {channelDetails ? (
                        <div>
                            <p>
                                <strong>Description:</strong> {channelDetails.description}
                            </p>
                            <p>
                                <strong>Messages:</strong>{" "}
                                {channelDetails.map((data) => (
                                    <span key={data.id}>{data.text}</span>
                                ))}
                            </p>
                        </div>
                    ) : (
                        <p>Select a channel to view its details</p>
                    )}
                </section>
            </main>
        </div>
    );
};

export default Channel;
