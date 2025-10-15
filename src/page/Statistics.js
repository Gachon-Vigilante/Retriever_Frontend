import React, {useEffect, useRef, useState} from "react";
import {Chart} from "chart.js/auto";
import Sidebar from "../components/Sidebar";
import "../css/page/Statistics.css";
import axios from "axios";
import useFetchNewPosts from "../hooks/useFetchNewPosts";
import useFetchChannelCount from "../hooks/useFetchChannelCount";
import useFetchNewTelegramChannels from "../hooks/useFetchNewTelegramChannels";
import useFetchPostDetails from "../hooks/useFetchPostDetails";
import useFetchChannels from "../hooks/useFetchChannels";
import ToolTip from "../components/ToolTip";

const ProgressBar = ({label, percentage, value, color}) => (
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

const calculateMonthlyPostGrowth = (posts) => {
    const monthlyCounts = Array(12).fill(0);
    posts.forEach(post => {
        if (post.updatedAt) {
            const date = new Date(post.updatedAt);
            if (!isNaN(date) && date.getFullYear() === 2025) {
                monthlyCounts[date.getMonth()]++;
            }
        }
    });

    const currentMonth = new Date().getMonth();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;

    const thisMonthCount = monthlyCounts[currentMonth];
    const lastMonthCount = monthlyCounts[lastMonth];

    if (lastMonthCount === 0) return null;
    const growthRate = ((thisMonthCount - lastMonthCount) / lastMonthCount) * 100;
    return Math.round(growthRate);
};

const calculateMonthlyChannelGrowth = (channels) => {
    const monthlyCounts = Array(12).fill(0);
    channels.forEach(channel => {
        if (channel.createdAt) {
            const date = new Date(channel.createdAt);
            if (date.getFullYear() === 2025) {
                const month = date.getMonth();
                monthlyCounts[month]++;
            }
        }
    });

    const currentMonth = new Date().getMonth();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;

    const thisMonthCount = monthlyCounts[currentMonth];
    const lastMonthCount = monthlyCounts[lastMonth];

    if (lastMonthCount === 0) return null;

    const growthRate = ((thisMonthCount - lastMonthCount) / lastMonthCount) * 100;
    return Math.round(growthRate);
};

const RankList = ({title, items, link, tooltip}) => {
    const isNew = (date) => {
        const today = new Date();
        const createdDate = new Date(date);
        const diffTime = Math.abs(today - createdDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 3;
    };

    return (
        <div className="rank-card">
            <h3 className="tooltip" data-tooltip={tooltip}>{title}</h3>
            <ul>
                {items.map((item, index) => (
                    <li key={index} className="rank-item">
                        <span className="rank-number">{index + 1}</span>
                        <div className="rank-content">
                            {item.channelId ? (
                                <a href={`/ai-reports?channelId=${item.channelId}`}>
                                    <p className="rank-title">{item.name}</p>
                                </a>
                            ) : (
                                <p className="rank-title">{item.name}</p>
                            )}
                            <p className="rank-detail">{item.detail}</p>
                        </div>
                        {isNew(item.createdAt) && <span className="rank-new">NEW</span>}
                    </li>
                ))}
            </ul>
        </div>
    );
};

const Statistics = () => {
    const chartRef = useRef(null);
    const chartInstance = useRef(null);
    const {posts} = useFetchPostDetails();
    const [monthlyPostData, setMonthlyPostData] = useState(Array(12).fill(0));

    const [argotData, setArgotData] = useState([]);
    const [newArgotData, setNewArgotData] = useState([]);
    const [drugData, setDrugData] = useState([]);
    const [drugTypeFilter, setDrugTypeFilter] = useState("All");
    const [drugTypes, setDrugTypes] = useState([]);

    const {channels: newTelegramChannels} = useFetchNewTelegramChannels(10);
    const {posts: newPosts} = useFetchNewPosts(4);
    const {channelCount} = useFetchChannelCount();

    const {channels: allChannels} = useFetchChannels();
    const monthlyChannelGrowth = calculateMonthlyChannelGrowth(allChannels);
    const monthlyPostGrowth = calculateMonthlyPostGrowth(posts);

    const [weeklyChannelCount, setWeeklyChannelCount] = useState(0);
    const [weeklyPostCount, setWeeklyPostCount] = useState(0);

    const getWeeklyCount = (data) => {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        return data.filter((item) => new Date(item.createdAt) >= oneWeekAgo).length;
    };

    useEffect(() => {
        if (newTelegramChannels.length) {
            const activeChannels = newTelegramChannels.filter(channel => channel.status === "active");
            setWeeklyChannelCount(getWeeklyCount(activeChannels));
        }
        if (newPosts.length) {
            setWeeklyPostCount(getWeeklyCount(newPosts));
        }
    }, [newTelegramChannels, newPosts]);

    useEffect(() => {
        if (posts.length) {
            const counts = getMonthlyPostCount(posts, 2025);
            setMonthlyPostData(counts);
        }
    }, [posts]);

    const getMonthlyPostCount = (posts, year) => {
        const monthlyCounts = Array(12).fill(0);

        posts.forEach((post) => {
            if (!post.createdAt) return;
            const date = new Date(post.createdAt);
            const postYear = date.getFullYear();
            const month = date.getMonth();

            if (postYear === year) {
                monthlyCounts[month]++;
            }
        });

        return monthlyCounts;
    };

    useEffect(() => {
        if (!allChannels.length) return;

        const monthlyCounts = Array(12).fill(0);
        allChannels.forEach((channel) => {
            const date = new Date(channel.createdAt);
            if (date.getFullYear() === 2025) {
                const month = date.getMonth();
                monthlyCounts[month]++;
            }
        });

        if (chartInstance.current) {
            chartInstance.current.destroy();
        }

        chartInstance.current = new Chart(chartRef.current, {
            type: "bar",
            data: {
                labels: [
                    "1월", "2월", "3월", "4월", "5월", "6월",
                    "7월", "8월", "9월", "10월", "11월", "12월"
                ],
                datasets: [
                    {
                        label: "월별 신규 게시글 감지 수",
                        data: monthlyCounts,
                        backgroundColor: "rgba(75, 192, 192, 0.6)",
                        borderColor: "rgba(75, 192, 192, 1)",
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: true,
                        position: "top"
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1,
                            precision: 0
                        }
                    }
                }
            }
        });

        return () => {
            if (chartInstance.current) {
                chartInstance.current.destroy();
            }
        };
    }, [allChannels]);

    useEffect(() => {
        const fetchArgotData = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/chat/all`);
                const argotCounts = {};
                response.data.forEach((item) => {
                    if (item.argot) item.argot.forEach((argotId) => {
                        argotCounts[argotId] = (argotCounts[argotId] || 0) + 1;
                    });
                });

                const sorted = Object.entries(argotCounts)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 10);

                const total = sorted.reduce((sum, [_, count]) => sum + count, 0);
                const argotNamesPromises = sorted.map(([argotId]) =>
                    axios.get(`${process.env.REACT_APP_API_BASE_URL}/argots/id/${argotId}`).then(res => {
                        const data = res.data;
                        return data.name || data.slang || data.argot || "알 수 없음";
                    })
                );

                const argotNames = await Promise.all(argotNamesPromises);
                const formattedData = sorted.map(([, count], index) => ({
                    label: argotNames[index],
                    percentage: ((count / total) * 100).toFixed(2),
                    color: getColorByPercentage((count / total) * 100),
                }));

                setArgotData(formattedData);
            } catch (error) {
                console.error("Error fetching argot data:", error);
            }
        };

        const fetchDrugData = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/chat/all`);
                const drugCounts = {};
                response.data.forEach((item) => {
                    if (item.drugs) item.drugs.forEach((drugId) => {
                        drugCounts[drugId] = (drugCounts[drugId] || 0) + 1;
                    });
                });

                const sorted = Object.entries(drugCounts)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 10);

                const total = sorted.reduce((sum, [_, count]) => sum + count, 0);
                const drugNamesPromises = sorted.map(([drugId]) =>
                    axios.get(`${process.env.REACT_APP_API_BASE_URL}/drugs/id/${drugId}`).then(res => res.data.drugName)
                );

                const drugNames = await Promise.all(drugNamesPromises);
                const formattedData = sorted.map(([, count], index) => ({
                    label: drugNames[index],
                    value: count,
                    percentage: ((count / total) * 100).toFixed(2),
                    color: getColorByPercentage((count / total) * 100),
                }));

                setDrugData(formattedData);
            } catch (error) {
                console.error("Error fetching drug data:", error);
            }
        };

        const fetchDrugTypes = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/drugs/all`);
                const types = [...new Set(response.data.map((drug) => drug.drugType))];
                setDrugTypes(["All", ...types]);
            } catch (error) {
                console.error("Error fetching drug types:", error);
            }
        };

        const fetchRecentArgotData = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/chat/all`);
                const latestArgotMap = {};

                response.data.forEach((item) => {
                    if (item.argot && item.timestamp) {
                        item.argot.forEach((argotId) => {
                            if (
                                !latestArgotMap[argotId] ||
                                new Date(latestArgotMap[argotId].timestamp) < new Date(item.timestamp)
                            ) {
                                latestArgotMap[argotId] = {
                                    timestamp: item.timestamp,
                                };
                            }
                        });
                    }
                });

                const entries = Object.entries(latestArgotMap)
                    .sort((a, b) => new Date(b[1].timestamp) - new Date(a[1].timestamp))
                    .slice(0, 5);

                const detailedData = await Promise.all(entries.map(async ([argotId, meta]) => {
                    const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/argots/id/${argotId}`);
                    return {
                        name: res.data.name || res.data.argot || "알 수 없음",
                        detail: new Date(meta.timestamp).toLocaleDateString(),
                    };
                }));

                setNewArgotData(detailedData);
            } catch (error) {
                console.error("Error fetching recent argot data:", error);
            }
        };

        fetchArgotData();
        fetchDrugData();
        fetchDrugTypes();
        fetchRecentArgotData();
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
            <Sidebar/>
            <main className="main with-sidebar">
                <ToolTip title="통계" tooltipText="텔레그램 채널/홍보 게시글/거래 마약류 등의 각종 통계를 표시합니다." />
                <section className="statistics-chart">
                    <div className="statistics">
                        <div className="card tooltip" data-tooltip="최근 7일 동안 탐지된 신규 텔레그램 채널 수를 표시합니다.">
                            <h3>주간 신규 채널</h3>
                            <p>{weeklyChannelCount}</p>
                        </div>
                        <div className="card tooltip" data-tooltip="최근 7일 동안 탐지된 신규 홍보 게시글 수를 표시합니다.">
                            <h3>주간 신규 포스트</h3>
                            <p>{weeklyPostCount}</p>
                        </div>
                        <div className="card tooltip" data-tooltip="탐지된 전체 텔레그램 채널 수를 표시합니다.">
                            <h3>총 탐지 채널</h3>
                            <p>{channelCount}</p>
                        </div>
                        <div className="card tooltip" data-tooltip="직전 월 대비 홍보 게시글 증감율을 표시합니다.">
                            <h3>홍보 게시글 증감율</h3>
                            <p>{monthlyPostGrowth !== null ? `${monthlyPostGrowth}%` : '데이터 없음'}</p>
                        </div>
                        <div className="card tooltip" data-tooltip="직전 월 대비 신규 마약 판매 텔레그램 채널 증감율을 표시합니다.">
                            <h3>거래 채널 증감율</h3>
                            <p>{monthlyChannelGrowth !== null ? `${monthlyChannelGrowth}%` : '데이터 없음'}</p>
                        </div>
                        <div className="card tooltip" data-tooltip="월간 가장 많이 판매한 마약류를 표시합니다.">
                            <h3>월간 최다거래</h3>
                            <p>메스암페타민</p>
                        </div>
                    </div>
                    <div className="chart">
                        <canvas ref={chartRef}></canvas>
                    </div>
                </section>

                <section className="additional-statistics">
                    <div className="card tooltip" data-tooltip="가장 많이 사용된 마약 관련 은어 순위를 표시합니다.">
                        <h3>최다 사용 은어</h3>
                        {argotData.map((item, index) => (
                            <ProgressBar
                                key={index}
                                label={item.label}
                                percentage={item.percentage}
                                color={item.color}
                            />
                        ))}
                    </div>
                    <div className="card tooltip" data-tooltip="가장 많이 탐지된 마약류 순위를 표시합니다.">
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
                    <RankList title="신규 탐지 채널"
                              items={newTelegramChannels.filter(channel => channel.status === "active")} tooltip="감지된 텔레그램 채널을 최신순으로 표시합니다."/>
                    <RankList title="최근 탐지 은어" items={newArgotData} tooltip="새롭게 감지된 은어명을 최신순으로 표시합니다."/>
                </section>
            </main>
        </div>
    );
};

export default Statistics;
