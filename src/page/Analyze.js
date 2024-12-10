import React, { useRef, useEffect } from "react";
import { Chart } from "chart.js/auto";
import Sidebar from "../components/Sidebar";
import "../css/page/Analyze.css";

const ProgressBar = ({ label, percentage, color }) => (
    <div className="progress-bar-container">
        <div className="progress-bar-label">
            <span>{label}</span>
            <span>{percentage}%</span>
        </div>
        <div className="progress-bar">
            <div
                className="progress-bar-fill"
                style={{
                    width: `${percentage}%`,
                    backgroundColor: color,
                }}
            ></div>
        </div>
    </div>
);

const RankList = ({ title, items }) => (
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
                    <span
                        className={`rank-change ${item.change > 0 ? "up" : "down"}`}
                    >
            {item.change > 0 ? "▲" : "▼"} {Math.abs(item.change)}
          </span>
                </li>
            ))}
        </ul>
    </div>
);

const Analyze = () => {
    const chartRef = useRef(null);
    const chartInstance = useRef(null);

    useEffect(() => {
        if (chartInstance.current) {
            chartInstance.current.destroy();
        }

        chartInstance.current = new Chart(chartRef.current, {
            type: "bar",
            data: {
                labels: ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"],
                datasets: [
                    {
                        label: "월별 마약 거래 채널 탐지수",
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
                    y: {
                        beginAtZero: true,
                    },
                },
            },
        });

        return () => {
            if (chartInstance.current) {
                chartInstance.current.destroy();
            }
        };
    }, []);

    const slangData = [
        { label: "XOR", percentage: 74, color: "#ff6384" },
        { label: "Co9in", percentage: 52, color: "#36a2eb" },
        { label: "아이스", percentage: 36, color: "#4bc0c0" },
    ];

    const drugData = [
        { label: "대마", percentage: 95, color: "#ff9f40" },
        { label: "펜타닐", percentage: 92, color: "#ffcd56" },
        { label: "프로포폴", percentage: 89, color: "#c9cbcf" },
    ];

    const latestChannels = [
        { name: "Jesse Thomas", detail: "637 Points - 98% Correct", change: 1 },
        { name: "Thisal Mathiyazhagan", detail: "637 Points - 89% Correct", change: 2 },
        { name: "Helen Chuang", detail: "637 Points - 88% Correct", change: 3 },
        { name: "Lura Silverman", detail: "637 Points - 85% Correct", change: 4 },
    ];

    const newSlang = [
        { name: "Houston Facility", detail: "52 Points / User - 97% Correct", change: 1 },
        { name: "Test Group", detail: "52 Points / User - 95% Correct", change: -2 },
        { name: "Sales Leadership", detail: "52 Points / User - 87% Correct", change: 3 },
        { name: "Northeast Region", detail: "52 Points / User - 85% Correct", change: 4 },
    ];

    return (
        <div className="dashboard">
            <Sidebar />
            <main className="main">
                <header className="header">
                    <h1>Statistics</h1>
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

                <section className="additional-statistics">
                    <div className="card">
                        <h3>최다 사용 은어</h3>
                        {slangData.map((item, index) => (
                            <ProgressBar
                                key={index}
                                label={item.label}
                                percentage={item.percentage}
                                color={item.color}
                            />
                        ))}
                    </div>
                    <div className="card">
                        <h3>최다 탐지 마약류</h3>
                        {drugData.map((item, index) => (
                            <ProgressBar
                                key={index}
                                label={item.label}
                                percentage={item.percentage}
                                color={item.color}
                            />
                        ))}
                    </div>
                </section>

                <section className="tables">
                    <RankList title="신규 탐지 채널" items={latestChannels}/>
                    <RankList title="신규 탐지 은어" items={newSlang}/>
                </section>
            </main>
        </div>
    );
};

export default Analyze;
