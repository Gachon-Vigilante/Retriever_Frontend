import React, { useEffect, useRef, useState } from "react";
import { Chart } from "chart.js/auto";
import Sidebar from "../components/Sidebar";
import "../css/page/MainDashboard.css";
import useFetchNewTelegramChannels from "../hooks/useFetchNewTelegramChannels";
import useFetchNewSlangData from "../hooks/useFetchNewSlangData";
import useFetchNewPosts from "../hooks/useFetchNewPosts";


const RankList = ({ title, items, link }) => {
    const isNew = (date) => {
        const today = new Date();
        const createdDate = new Date(date);
        const diffTime = Math.abs(today - createdDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // Difference in days
        return diffDays <= 3;
    };

    return (
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
                        {isNew(item.createdAt) && <span className="rank-new">NEW</span>}
                    </li>
                ))}
            </ul>
            <a href={link} className="view-link">
                View full leaderboard
            </a>
        </div>
    );
};

const MainDashboard = () => {
    const chartRef = useRef(null);
    const chartInstance = useRef(null);

    const { channels: newTelegramChannels } = useFetchNewTelegramChannels(4);
    const { slangData: newSlangData } = useFetchNewSlangData(4);
    const { posts: newPosts } = useFetchNewPosts(4);

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
                    <RankList title="신규 텔레그램 채널" items={newTelegramChannels} link="/channels" />
                    <RankList title="신규 탐지 게시글" items={newPosts} link="/posts" />
                    <RankList title="신규 탐지 은어" items={newSlangData} link="/statistics" />
                </section>
            </main>
        </div>
    );
};

export default MainDashboard;
