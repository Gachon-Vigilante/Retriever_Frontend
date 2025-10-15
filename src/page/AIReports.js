import Sidebar from "../components/Sidebar";
import "../css/page/AiChat.css";
import useFetchChannels from "../hooks/useFetchChannels";
import React, {useEffect, useState} from "react";
import {useSearchParams} from "react-router-dom";
import ReactPaginate from "react-paginate";
import "../css/components/Pagination.css";
import axios from "axios";
import ToolTip from "../components/ToolTip";

axios.defaults.withCredentials = true;

const AIReports = () => {
    const [selectedChannelId, setSelectedChannelId] = useState(null);
    const {channels, loading, error} = useFetchChannels();
    const [reports, setReports] = useState([]);
    const [channelPage, setChannelPage] = useState(0);
    const [reportPage, setReportPage] = useState(0);
    const channelsPerPage = 10;
    const reportsPerPage = 7;

    const [searchParams] = useSearchParams();
    const selectedChannelIdFromQuery = searchParams.get("channelId");

    useEffect(() => {
        if (selectedChannelIdFromQuery) {
            setSelectedChannelId(Number(selectedChannelIdFromQuery));
        }
    }, [selectedChannelIdFromQuery]);

    useEffect(() => {
        setReportPage(0);
    }, [selectedChannelId]);

    useEffect(() => {
        const fetchReports = async () => {
            try {
                let response;
                if (selectedChannelId) {
                    response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/report/channelId`, {
                        params: {channelId: Number(selectedChannelId)},
                        withCredentials: true,
                    });
                } else {
                    response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/report/all`, {withCredentials: true});
                }
                const sortedReports = response.data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
                setReports(sortedReports);
            } catch (err) {
                console.error("Error fetching reports:", err);
                setReports([]);
            }
        };
        fetchReports();
    }, [selectedChannelId]);

    return (
        <div className="ai-chat-page">
            <Sidebar/>
            <main className="ai-chat-main with-sidebar">
                {/*<header className="ai-chat-header">*/}
                {/*    <h1>AI 리포트</h1>*/}
                {/*</header>*/}
                <ToolTip title="AI 리포트" tooltipText="모니터링 중인 텔레그램 채널에서 채팅이 발생하면 그 채팅을 AI가 분석하여 리포트 형태로 누적합니다.
                        기본적으로는 모든 채널에서 분석된 리포트가 최신순으로 보여지고 왼쪽에서 특정 채널을 클릭하면 해당 채널의 분석 리포트를 조회할 수 있습니다."/>
                <div className="ai-chat-content">
                    <div className="chatbot-list">
                        <h3 className="tooltip" data-tooltip="현재 active 상태인 텔레그램 채널을 표시합니다.">텔레그램 채널</h3>
                        {loading && <p>채널 목록 로딩 중...</p>}
                        {error && <p className="tooltip-error">채널을 불러오는 중 오류가 발생했습니다: {error}</p>}
                        <ul>
                            {channels
                                .filter((channel) => channel.status === "active")
                                .slice(channelPage * channelsPerPage, (channelPage + 1) * channelsPerPage)
                                .map((channel) => (
                                    <li
                                        key={channel.id}
                                        className={`channel-item ${selectedChannelId === channel.id ? "active" : ""}`}
                                        onClick={() => {
                                            if (selectedChannelId === channel.id) {
                                                setSelectedChannelId(null);
                                            } else {
                                                setSelectedChannelId(channel.id);
                                            }
                                        }}
                                    >
                                        <div className="channel-info">
                                            <p className="channel-name">{channel.name}</p>
                                            <p className="channel-chatSendTime">
                                                {channel.createdAt}
                                            </p>
                                        </div>
                                    </li>
                                ))}
                        </ul>
                        <ReactPaginate
                            previousLabel={"<"}
                            nextLabel={">"}
                            pageCount={Math.ceil(channels.length / channelsPerPage)}
                            onPageChange={({selected}) => setChannelPage(selected)}
                            containerClassName={"pagination"}
                            activeClassName={"active"}
                        />
                    </div>
                    <div className="chat-window">
                        <h3 className="tooltip" data-tooltip="선택한 채널에 대한 분석 리포트를 시간순으로 제공합니다.">AI 분석 보고서</h3>
                        <p className="selected-channel-name">
                            {selectedChannelId
                                ? channels.find((ch) => ch.id === selectedChannelId)?.name
                                : "전체 채널 분석 리포트"}
                        </p>
                        <div className="report-list">
                            {reports.length > 0 ? (
                                <ul>
                                    {reports
                                        .slice(reportPage * reportsPerPage, (reportPage + 1) * reportsPerPage)
                                        .map((report) => (
                                            <li key={report.id} className="report-item">
                                                <p><strong>Channel:</strong> {
                                                    channels.find((ch) => ch.id === report.channelId)?.name || `ID: ${report.channelId}`
                                                }</p>
                                                <p><strong>Type:</strong> {report.type}</p>
                                                <p><strong>Content:</strong> {report.content}</p>
                                                <p><strong>Description:</strong> {report.description}</p>
                                                <p>
                                                    <strong>Created:</strong> {new Date(report.timestamp).toLocaleString()}
                                                </p>
                                            </li>
                                        ))}
                                </ul>
                            ) : (
                                <p>해당 채널에 대한 분석 리포트가 없습니다.</p>
                            )}
                        </div>
                        <ReactPaginate
                            previousLabel={"<"}
                            nextLabel={">"}
                            pageCount={Math.ceil(reports.length / reportsPerPage)}
                            onPageChange={({selected}) => setReportPage(selected)}
                            containerClassName={"pagination"}
                            activeClassName={"active"}
                        />
                    </div>
                </div>
            </main>
        </div>
    );
};
export default AIReports;