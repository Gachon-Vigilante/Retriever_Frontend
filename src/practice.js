import React from "react";
import { Chart } from "chart.js/auto";
import { useEffect, useRef } from "react";
import "./Retriever.css";

const ProgressBar = ({ label, percentage, color }) => {
    return (
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
};

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
                    <span className={`rank-change ${item.change > 0 ? "up" : "down"}`}>
                        {item.change > 0 ? "▲" : "▼"} {Math.abs(item.change)}
                    </span>
                </li>
            ))}
        </ul>
    </div>
);

const Dashboard = () => {
    const chartRef = useRef(null);
    const chartInstance = useRef(null);

    const slangData = [
        { label: "Food Safety", percentage: 74, color: "rgba(255, 99, 132, 0.8)" },
        { label: "Compliance Basics Procedures", percentage: 52, color: "rgba(54, 162, 235, 0.8)" },
        { label: "Company Networking", percentage: 36, color: "rgba(75, 192, 192, 0.8)" },
    ];

    const drugData = [
        { label: "대마", percentage: 95, color: "rgba(153, 102, 255, 0.8)" },
        { label: "펜타닐", percentage: 92, color: "rgba(255, 159, 64, 0.8)" },
        { label: "프로포폴", percentage: 89, color: "rgba(255, 206, 86, 0.8)" },
    ];

    const latestChannels = [
        { name: "Houston Facility", detail: "52 Points / User - 97% Correct", change: 1 },
        { name: "Test Group", detail: "52 Points / User - 95% Correct", change: -2 },
        { name: "Sales Leadership", detail: "52 Points / User - 87% Correct", change: 3 },
        { name: "Northeast Region", detail: "52 Points / User - 85% Correct", change: 4 },
    ];

    const newSlang = [
        { name: "Slang A", detail: "80%", change: 2 },
        { name: "Slang B", detail: "78%", change: 1 },
        { name: "Slang C", detail: "75%", change: -1 },
        { name: "Slang D", detail: "72%", change: -2 },
    ];

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
                        label: "월별 거래 탐지 지수",
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

    return (
        <div className="dashboard">
            <aside className="sidebar">
                <img
                    src={`${process.env.PUBLIC_URL}/logo.png`}
                    alt="Retriever 로고"
                    className="logo-image"
                />
                <nav className="menu">
                    <ul>
                        <li className="active">실시간 마약 거래 현황</li>
                        <li>탐지 로그 확인</li>
                        <li>AI 관리</li>
                        <li>통계</li>
                    </ul>
                </nav>
                <div className="support">
                    <ul>
                        <li>가이드</li>
                        <li>설정</li>
                    </ul>
                </div>
                <div className="user-info">
                    <img
                        src="https://via.placeholder.com/50"
                        alt="프로필 이미지"
                        className="profile-image"
                    />
                    <div className="user-details">
                        <p className="user-name">관리자</p>
                        <p className="user-email">cho010105@gachon.ac.kr</p>
                    </div>
                </div>

            </aside>

            <main className="main">
                <header className="header">
                    <h1>Reports</h1>
                    <div className="filters">
                        <select>
                            <option value="all">시간대: 전체</option>
                            <option value="morning">오전</option>
                            <option value="afternoon">오후</option>
                        </select>
                        <select>
                            <option value="all">채널: All</option>
                            <option value="specific">Specific Channel</option>
                        </select>
                        <select>
                            <option value="all">마약 종류: All</option>
                            <option value="type1">마약</option>
                            <option value="type2">항정신성의약품</option>
                            <option value="type2">대마</option>
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
                            <h3>Starting Knowledge</h3>
                            <p>64%</p>
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
                    <RankList title="최신 탐지 채널" items={latestChannels}/>
                    <RankList title="신규 탐지 은어" items={newSlang}/>
                </section>
            </main>
        </div>
    );
};

export default Dashboard;
