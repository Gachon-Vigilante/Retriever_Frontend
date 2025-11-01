import React, {useEffect, useRef, useState} from "react";
import {Chart} from "chart.js/auto";
import Sidebar from "../components/Sidebar";
import "../css/page/Statistics.css";
import axiosInstance from "../axiosConfig";
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
                    width: `${percentage}%`,
                    backgroundColor: color,
                }}
            ></div>
        </div>
    </div>
);

const calculateMonthlyPostGrowth = (posts) => {
    const monthlyCounts = Array(12).fill(0);
    posts.forEach(post => {
        if (post.discoveredAt) {
            const date = new Date(post.discoveredAt);
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
        if (!date) return false;
        const today = new Date();
        const createdDate = new Date(date);
        if (isNaN(createdDate.getTime())) return false;
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
                                    <p className="rank-title">{item.title || item.name}</p>
                                </a>
                            ) : (
                                <p className="rank-title">{item.title || item.name}</p>
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

    const {channels: newTelegramChannels} = useFetchNewTelegramChannels(5);
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

        return data.filter((item) => {
            if (!item) return false;
            const dateStr = item.discoveredAt || item.createdAt || item.updatedAt || item.checkedAt || item.date || item.timestamp;
            if (!dateStr) return false;
            const d = new Date(dateStr);
            return !isNaN(d.getTime()) && d >= oneWeekAgo;
        }).length;
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

        const monthlyCounts = Array(12).fill(0);
        allChannels.forEach((channel) => {
            if (!channel) return;
            const dateStr = channel.createdAt || channel.updatedAt || channel.checkedAt || channel.date;
            if (!dateStr) return;
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) return;
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
        const fetchMessagesAndDrugs = async () => {
            try {
                const msgRes = await axiosInstance.get(`${process.env.REACT_APP_API_BASE_URL}/message/all`, { withCredentials: true });
                const messages = (msgRes && msgRes.data && Array.isArray(msgRes.data.data)) ? msgRes.data.data : Array.isArray(msgRes.data) ? msgRes.data : [];

                const argotCounts = {};
                messages.forEach((m) => {
                    const arr = Array.isArray(m.argots) ? m.argots : [];
                    arr.forEach((a) => {
                        const key = (typeof a === "string") ? a : (a.argot || "");
                        if (!key) return;
                        argotCounts[key] = (argotCounts[key] || 0) + 1;
                    });
                });

                const sortedArgots = Object.entries(argotCounts).sort((a, b) => b[1] - a[1]).slice(0, 10);
                const totalArgotCount = sortedArgots.reduce((s, [, c]) => s + c, 0);
                const argotFormatted = sortedArgots.map(([argot, count]) => ({
                    label: argot,
                    percentage: totalArgotCount ? ((count / totalArgotCount) * 100).toFixed(2) : "0.00",
                    color: getColorByPercentage(totalArgotCount ? ((count / totalArgotCount) * 100) : 0),
                }));
                setArgotData(argotFormatted);

                const argotKeys = Object.keys(argotCounts);
                const settled = await Promise.allSettled(argotKeys.map((a) =>
                    axiosInstance.get(`${process.env.REACT_APP_API_BASE_URL}/drugs/argot/${encodeURIComponent(a)}`, { withCredentials: true })
                ));

                const drugCounts = {};
                for (let i = 0; i < argotKeys.length; i++) {
                    const arg = argotKeys[i];
                    const cnt = argotCounts[arg] || 0;
                    const res = settled[i];
                    if (res.status === "fulfilled") {
                        const list = (res.value && res.value.data && Array.isArray(res.value.data.data)) ? res.value.data.data : Array.isArray(res.value.data) ? res.value.data : [];
                        if (list.length > 0) {
                            list.forEach((drug) => {
                                const drugName = drug.name || drug.englishName || "알 수 없음";
                                drugCounts[drugName] = (drugCounts[drugName] || 0) + cnt;
                            });
                            continue;
                        }
                    }
                    drugCounts["알 수 없음"] = (drugCounts["알 수 없음"] || 0) + cnt;
                }

                const sortedDrugs = Object.entries(drugCounts).sort((a, b) => b[1] - a[1]).slice(0, 10);
                const totalDrugCount = sortedDrugs.reduce((s, [, c]) => s + c, 0);
                const drugFormatted = sortedDrugs.map(([label, value]) => ({
                    label,
                    value,
                    percentage: totalDrugCount ? ((value / totalDrugCount) * 100).toFixed(2) : "0.00",
                    color: getColorByPercentage(totalDrugCount ? ((value / totalDrugCount) * 100) : 0),
                }));
                setDrugData(drugFormatted);

            } catch (error) {
                console.error("Error fetching messages/drugs for statistics:", error);
            }
        };

        const fetchDrugTypes = async () => {
            try {
                const response = await axiosInstance.get(`${process.env.REACT_APP_API_BASE_URL}/drugs/all`);
                const list = (response && response.data && Array.isArray(response.data.data)) ? response.data.data : Array.isArray(response.data) ? response.data : [];
                const types = [...new Set(list.map((drug) => drug.drugType))].filter(Boolean);
                setDrugTypes(["All", ...types]);
            } catch (error) {
                console.error("Error fetching drug types:", error);
            }
        };

        const fetchRecentArgotData = async () => {
            try {
                const msgRes = await axiosInstance.get(`${process.env.REACT_APP_API_BASE_URL}/message/all`, { withCredentials: true });
                const messages = (msgRes && msgRes.data && Array.isArray(msgRes.data.data)) ? msgRes.data.data : Array.isArray(msgRes.data) ? msgRes.data : [];

                const latestArgotMap = {};

                messages.forEach((m) => {
                    const arr = Array.isArray(m.argots) ? m.argots : [];
                    const tsCandidate = m.updatedAt || m.date || m.timestamp || m.editDate || m.updated_at || m.createdAt || null;
                    const parsedTs = tsCandidate ? new Date(tsCandidate) : null;

                    arr.forEach((a) => {
                        const key = (typeof a === "string") ? a : (a && (a.argot || a.name || "")) || "";
                        if (!key) return;
                        const existingTs = latestArgotMap[key] ? new Date(latestArgotMap[key]) : null;
                        if (!parsedTs) {
                            if (!existingTs) latestArgotMap[key] = new Date().toISOString();
                        } else {
                            if (!existingTs || parsedTs > existingTs) {
                                latestArgotMap[key] = parsedTs.toISOString();
                            }
                        }
                    });
                });

                const entries = Object.entries(latestArgotMap)
                    .sort((a, b) => new Date(b[1]) - new Date(a[1]))
                    .slice(0, 5);

                const detailedData = entries.map(([argot, ts]) => ({
                    name: argot || "알 수 없음",
                    detail: ts ? new Date(ts).toLocaleDateString() : "-",
                }));

                setNewArgotData(detailedData);
            } catch (error) {
                console.error("Error fetching recent argot data from messages:", error);
            }
         };

        fetchMessagesAndDrugs();
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
                            <p>{channelCount ?? 0}</p>
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
                    <RankList
                        title="신규 탐지 채널"
                        items={newTelegramChannels.slice(0, 5)}
                        tooltip="감지된 텔레그램 채널을 최신순으로 표시합니다."
                    />
                    <RankList title="최근 탐지 은어" items={newArgotData} tooltip="새롭게 감지된 은어명을 최신순으로 표시합니다."/>
                </section>
            </main>
        </div>
    );
};

export default Statistics;
