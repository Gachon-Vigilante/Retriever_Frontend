import React, { useRef, useEffect, useState } from "react";
import { Chart } from "chart.js/auto";
import Sidebar from "../components/Sidebar";
import "../css/page/Statistics.css";
import axios from "axios";
import useFetchNewPosts from "../hooks/useFetchNewPosts";
import useFetchChannelCount from "../hooks/useFetchChannelCount";
import useFetchNewTelegramChannels from "../hooks/useFetchNewTelegramChannels";
import useFetchNewSlangData from "../hooks/useFetchNewSlangData";

const ProgressBar = ({ label, percentage, value, color }) => (
    <div className="progress-bar-container">
        <div className="progress-bar-label">
            <span>{label}</span>
            <span>{value} ({percentage}%)</span>
        </div>
        <div className="progress-bar">
            <div
                className="progress-bar-fill"
                style={{
                    width: `${percentage}%`, // Proportional width
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
                </li>
            ))}
        </ul>
    </div>
);

const Statistics = () => {
    const chartRef = useRef(null);
    const chartInstance = useRef(null);

    const [slangData, setSlangData] = useState([]);
    const { slangData: newSlangData } = useFetchNewSlangData(5);
    const [drugData, setDrugData] = useState([]);
    const [drugTypeFilter, setDrugTypeFilter] = useState("All");
    const [drugTypes, setDrugTypes] = useState([]);

    const { channels: newTelegramChannels } = useFetchNewTelegramChannels(5);
    const { posts: newPosts } = useFetchNewPosts(4);
    const { channelCount } = useFetchChannelCount();

    const [weeklyChannelCount, setWeeklyChannelCount] = useState(0);
    const [weeklyPostCount, setWeeklyPostCount] = useState(0);

    const getWeeklyCount = (data) => {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7); // 7 days ago

        return data.filter((item) => new Date(item.createdAt) >= oneWeekAgo).length;
    };

    useEffect(() => {
        if (newTelegramChannels.length) {
            setWeeklyChannelCount(getWeeklyCount(newTelegramChannels));
        }
        if (newPosts.length) {
            setWeeklyPostCount(getWeeklyCount(newPosts));
        }
    }, [newTelegramChannels, newPosts]);

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

    useEffect(() => {
        const fetchSlangData = async () => {
            try {
                const response = await axios.get("http://localhost:8080/slangs/sorted");
                const formattedData = response.data.map((slang) => ({
                    label: slang.slang,
                    percentage: Math.min(slang.count, 100),
                    color: getColorByPercentage(Math.min(slang.count, 100)),
                }));
                setSlangData(formattedData);
            } catch (error) {
                console.error("Error fetching slang data:", error);
            }
        };

        const fetchDrugData = async () => {
            try {
                const url =
                    drugTypeFilter === "All"
                        ? "http://localhost:8080/drugs/sorted"
                        : `http://localhost:8080/drugs/sorted/type/${drugTypeFilter}`;
                const response = await axios.get(url);
                const total = response.data.reduce((sum, drug) => sum + drug.count, 0); // Calculate total count
                const formattedData = response.data.map((drug) => ({
                    label: drug.drugName,
                    value: drug.count,
                    percentage: ((drug.count / total) * 100).toFixed(2), // Calculate ratio
                    color: getColorByPercentage((drug.count / total) * 100),
                }));
                setDrugData(formattedData);
            } catch (error) {
                console.error("Error fetching drug data:", error);
            }
        };

        const fetchDrugTypes = async () => {
            try {
                const response = await axios.get("http://localhost:8080/drugs/all");
                const types = [...new Set(response.data.map((drug) => drug.drugType))];
                setDrugTypes(["All", ...types]);
            } catch (error) {
                console.error("Error fetching drug types:", error);
            }
        };

        fetchSlangData();
        // fetchNewSlangData();
        fetchDrugData();
        fetchDrugTypes();
    }, [drugTypeFilter]);

    const getColorByPercentage = (percentage) => {
        if (percentage <= 20) {
            return "#ff6384";
        } else if (percentage <= 40) {
            return "#36a2eb";
        } else if (percentage <= 60) {
            return "#4bc0c0";
        } else if (percentage <= 80) {
            return "#ff9f40";
        } else {
            return "#ffcd56";
        }
    };
    return (
        <div className="dashboard">
            <Sidebar />
            <main className="main">
                <header className="header">
                    <h1>통계</h1>
                    <div className="filters">
                        <select>
                            <option value="all">시간대: 전체</option>
                        </select>
                        <select>
                            <option value="all">종류</option>
                            <option value="all">채널</option>
                            <option value="all">포스트</option>
                        </select>
                        <select
                            onChange={(e) => setDrugTypeFilter(e.target.value)}
                            value={drugTypeFilter}
                        >
                            {drugTypes.map((type, index) => (
                                <option key={index} value={type}>
                                    마약 종류: {type}
                                </option>
                            ))}
                        </select>
                    </div>
                    <button className="download">Download</button>
                </header>

                <section className="statistics-chart">
                    <div className="statistics">
                        <div className="card">
                            <h3>주간 신규 탐지 채널</h3>
                            <p>{weeklyChannelCount}</p>
                        </div>
                        <div className="card">
                            <h3>주간 신규 탐지 포스트</h3>
                            <p>{weeklyPostCount}</p>
                        </div>
                        <div className="card">
                            <h3>총 탐지 채널</h3>
                            <p>{channelCount}</p>
                        </div>
                        <div className="card">
                            <h3>전월 대비 홍보글 증가율</h3>
                            <p>+64%</p>
                        </div>
                        <div className="card">
                            <h3>전월 대비 거래 채널 증가율</h3>
                            <p>86%</p>
                        </div>
                        <div className="card">
                            <h3>월간 최다 거래 지역</h3>
                            <p className="p">서울시 강남구</p>
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
                                value={item.value}
                                percentage={item.percentage}
                                color={item.color}
                            />
                        ))}
                    </div>
                </section>

                <section className="tables">
                    <RankList title="신규 탐지 채널" items={newTelegramChannels} />
                    <RankList title="신규 탐지 은어" items={newSlangData} />
                </section>
            </main>
        </div>
    );
};

export default Statistics;
