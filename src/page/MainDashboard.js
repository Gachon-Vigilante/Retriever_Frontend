import React, { useEffect, useRef, useState } from "react";
import { Chart } from "chart.js/auto";
import Sidebar from "../components/Sidebar";
import "../css/page/MainDashboard.css";
import axios from "axios";

const RankList = ({ title, items, link }) => (
    <div className="rank-card">
        <h3>{title}</h3>
        <ul>
            {items.map((item, index) => (
                <li key={index} className="rank-item">
                    <span className="rank-number">{index + 1}</span>
                    <div className="rank-content">
                        <p className="rank-title">{item.name}</p>
                        <p className="rank-detail">{item.detail}</p>
                    </div>
                    <span className={`rank-change ${item.change > 0 ? "up" : "down"}`}>
                        {item.change > 0 ? "▲" : "▼"} {Math.abs(item.change)}
                    </span>
                </li>
            ))}
        </ul>
        <a href={link} className="view-link">
            View full leaderboard
        </a>
    </div>
);

const MainDashboard = () => {
    const chartRef = useRef(null);
    const chartInstance = useRef(null);

    const [newSlangData, setNewSlangData] = useState([]);

    useEffect(() => {
        if (chartInstance.current) {
            chartInstance.current.destroy();
        }
        chartInstance.current = new Chart(chartRef.current, {
            type: "bar",
            data: {
                labels: [
                    "JAN",
                    "FEB",
                    "MAR",
                    "APR",
                    "MAY",
                    "JUN",
                    "JUL",
                    "AUG",
                    "SEP",
                    "OCT",
                    "NOV",
                    "DEC",
                ],
                datasets: [
                    {
                        label: "월별 채팅 사용자 로그 수",
                        data: [300, 400, 450, 500, 520, 480, 490, 600, 620, 650, 700, 750],
                        backgroundColor: "rgba(75, 192, 192, 0.6)",
                        borderColor: "rgba(75, 192, 192, 1)",
                        borderWidth: 1,
                    },
                ],
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: true,
                        position: "top",
                    },
                },
                scales: {
                    y: { beginAtZero: true },
                },
            },
        });

        return () => {
            if (chartInstance.current) {
                chartInstance.current.destroy();
            }
        };
    }, []);

    useEffect(() => {
        // Fetch "신규 탐지 은어" data, sorted by `createdAt`, and limit to the top 3
        const fetchNewSlangData = async () => {
            try {
                const response = await axios.get("http://localhost:8080/slangs/all");
                const sortedData = response.data
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                    .slice(0, 4); // Take the top 3
                const formattedData = sortedData.map((slang) => ({
                    name: slang.slang,
                    detail: `${new Date(slang.createdAt).toLocaleDateString()}`,
                    change: Math.random() > 0.5 ? 1 : -1,
                }));
                setNewSlangData(formattedData);
            } catch (error) {
                console.error("Error fetching new slang data:", error);
            }
        };

        fetchNewSlangData();
    }, []);

    const topChannels = [
        { name: "Channel Name", detail: "3 new Chats", change: 1 },
        { name: "Channel Name", detail: "3 new Chats", change: 2 },
        { name: "Channel Name", detail: "1 new Chats", change: 3 },
        { name: "Channel Name", detail: "", change: 0 },
    ];

    return (
        <div className="dashboard">
            <Sidebar />
            <main className="main">
                <header className="header">
                    <h1>Live Analytics</h1>
                    <div className="filters">
                        <select>
                            <option value="all">시간대: 전체</option>
                        </select>
                        <select>
                            <option value="all">채널: All</option>
                        </select>
                        <select>
                            <option value="all">마약 종류: All</option>
                        </select>
                    </div>
                    <button className="download">Download</button>
                </header>

                <section className="statistics-chart">
                    <div className="statistics">
                        <div className="card">
                            <h3>현재 생성된 봇</h3>
                            <p>27/80</p>
                        </div>
                        <div className="card">
                            <h3>총 탐지 채널</h3>
                            <p>3,298</p>
                        </div>
                        <div className="card">
                            <h3>평균 채널</h3>
                            <p>2m 34s</p>
                        </div>
                        <div className="card">
                            <h3>전월 대비 거래 증가율</h3>
                            <p>+64%</p>
                        </div>
                        <div className="card">
                            <h3>탐지 채널 검거 연계율</h3>
                            <p>86%</p>
                        </div>
                        <div className="card">
                            <h3>월별 거래 채널 증가율</h3>
                            <p>+34%</p>
                        </div>
                    </div>
                    <div className="chart">
                        <canvas ref={chartRef}></canvas>
                    </div>
                </section>

                <section className="tables">
                    <RankList title="실시간 텔레그램 채널" items={topChannels} link="/channels" />
                    <RankList title="신규 탐지 채널" items={topChannels} link="/leaderboard" />
                    <RankList title="신규 탐지 은어" items={newSlangData} link="/statistics" />
                </section>
            </main>
        </div>
    );
};

export default MainDashboard;
