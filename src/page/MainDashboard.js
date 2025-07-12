import React, {useEffect, useRef, useState} from "react";
import {Chart} from "chart.js/auto";
import Sidebar from "../components/Sidebar";
import "../css/page/MainDashboard.css";
import useFetchChannels from "../hooks/useFetchChannels";
import useFetchNewPosts from "../hooks/useFetchNewPosts";
import useFetchChannelCount from "../hooks/useFetchChannelCount";
import useFetchPostDetails from "../hooks/useFetchPostDetails";
import axios from "axios";

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

const RankList = ({title, items, link}) => {
    const isNew = (date) => {
        const today = new Date();
        const createdDate = new Date(date);
        const diffTime = Math.abs(today - createdDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
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
            <a href={link} className="view-link">
                전체 목록 확인
            </a>
        </div>
    );
};

const MainDashboard = () => {
    const chartRef = useRef(null);
    const chartInstance = useRef(null);
    const {posts} = useFetchPostDetails(); // 불러오기
    const [monthlyPostData, setMonthlyPostData] = useState(Array(12).fill(0));

    const {channels: allChannels} = useFetchChannels(); // fetch all channels
    const monthlyChannelGrowth = calculateMonthlyChannelGrowth(allChannels);
    const monthlyPostGrowth = calculateMonthlyPostGrowth(posts);
    const newTelegramChannels = allChannels.slice(0, 6);
    const [newReportData, setNewReportData] = useState([]);
    const {posts: newPosts} = useFetchNewPosts(5);
    const {channelCount} = useFetchChannelCount();

    const [weeklyChannelCount, setWeeklyChannelCount] = useState(0);
    const [weeklyPostCount, setWeeklyPostCount] = useState(0);

    // Utility function to calculate weekly count
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
        if (posts.length) {
            const counts = getMonthlyPostCount(posts, 2025);
            setMonthlyPostData(counts);
        }
    }, [posts]);

    const getMonthlyPostCount = (posts, year) => {
        const monthlyCounts = Array(12).fill(0);

        posts.forEach((post) => {
            if (!post.updatedAt) return;
            const date = new Date(post.updatedAt);
            const postYear = date.getFullYear();
            const month = date.getMonth();

            if (postYear === year) {
                monthlyCounts[month]++;
            }
        });

        return monthlyCounts;
    };
    useEffect(() => {
        const fetchRecentReports = async () => {
            try {
                const [reportsRes, channelsRes] = await Promise.all([
                    axios.get(`${process.env.REACT_APP_API_BASE_URL}/report/all`),
                    axios.get(`${process.env.REACT_APP_API_BASE_URL}/channels/all`),
                ]);

                const reportList = reportsRes.data;
                const channels = channelsRes.data;

                // 채널 ID → 이름 매핑
                const channelMap = {};
                channels.forEach((channel) => {
                    channelMap[channel.id] = channel.title || "제목 없음";
                });

                // 채널별 최신 리포트만 남기기
                const latestReportPerChannel = {};
                reportList.forEach((report) => {
                    if (!report.channelId || !report.timestamp) return;
                    const existing = latestReportPerChannel[report.channelId];
                    if (!existing || new Date(report.timestamp) > new Date(existing.timestamp)) {
                        latestReportPerChannel[report.channelId] = report;
                    }
                });

                const sorted = Object.values(latestReportPerChannel)
                    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                    .slice(0, 6)
                    .map((report) => ({
                        name: channelMap[report.channelId] || `채널 ID: ${report.channelId}`,
                        detail: new Date(report.timestamp).toLocaleDateString(),
                        createdAt: report.timestamp,
                        channelId: report.channelId
                    }));

                setNewReportData(sorted);
            } catch (err) {
                console.error("실시간 리포트 조회 실패:", err);
            }
        };

        fetchRecentReports();
    }, []);


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

    return (
        <div className="dashboard with-sidebar">
            <Sidebar/>
            <main className="main">
                <header className="header">
                    <h1>실시간 거래 현황</h1>
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
                            <h3>전월 대비 홍보 게시글 증감율</h3>
                            <p>{monthlyPostGrowth !== null ? `${monthlyPostGrowth}%` : '데이터 없음'}</p>
                        </div>
                        <div className="card">
                            <h3>전월 대비 거래 채널 증감율</h3>
                            <p>{monthlyChannelGrowth !== null ? `${monthlyChannelGrowth}%` : '데이터 없음'}</p>
                        </div>
                        <div className="card">
                            <h3>월간 최다 거래 마약류</h3>
                            <p className="p">메스암페타민</p>
                        </div>
                    </div>
                    <div className="chart">
                        <canvas ref={chartRef}></canvas>
                    </div>
                </section>

                <section className="tables">
                    <RankList title="신규 텔레그램 채널" items={newTelegramChannels} link="/channels"/>
                    <RankList title="신규 탐지 게시글" items={newPosts} link="/posts"/>
                    <RankList title="실시간 AI 리포트" items={newReportData} link="/ai-reports"/>
                </section>
            </main>
        </div>
    );
};

export default MainDashboard;
