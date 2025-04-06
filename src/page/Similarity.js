import React, { useState, useEffect } from "react";
import { Buffer } from "buffer";
import Sidebar from "../components/Sidebar";
import "../css/page/Similarity.css";
import axios from "axios";

const Similarity = () => {
    const [selectedItem, setSelectedItem] = useState(null);
    const [similarities, setSimilarities] = useState([]);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 게시글 불러오기
    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const res = await axios.get("http://localhost:8080/posts/all");
                setPosts(res.data);
            } catch (err) {
                console.error("게시글 로드 실패:", err);
                setError("게시글 데이터를 불러오는 중 오류 발생");
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, []);

    // 유사 게시글 조회
    const fetchSimilarities = async (id) => {
        try {
            const res = await axios.get(`http://localhost:8080/post-similarity/post/${id}`);
            const fetched = res.data.similarPosts || [];

            const detailed = await Promise.all(
                fetched.map(async (item) => {
                    try {
                        const detail = await axios.get(`http://localhost:8080/posts/id/${item.similarPost}`);
                        return {
                            ...item,
                            title: detail.data.title || "제목 없음",
                            link: detail.data.link || "#",
                        };
                    } catch {
                        return {
                            ...item,
                            title: `게시글 ${item.similarPost}`,
                            link: "#",
                        };
                    }
                })
            );

            setSimilarities(detailed.sort((a, b) => b.similarity - a.similarity));
        } catch (err) {
            console.error("유사 게시글 로드 실패:", err);
            setSimilarities([]);
        }
    };

    // 네트워크 그래프 보기
    const openGraph = () => {
        if (!selectedItem) return;

        const graphData = {
            rootPost: selectedItem.id,
            nodes: [
                { id: selectedItem.id, text: selectedItem.title, type: "main", color: "#ff5733" },
                ...similarities.map((post) => ({
                    id: post.similarPost,
                    text: post.title || post.similarPost,
                    type: "similar",
                    color: "#3375ff",
                })),
            ],
            lines: similarities.map((post) => ({
                from: selectedItem.id,
                to: post.similarPost,
                text: `유사도: ${(post.similarity * 100).toFixed(2)}%`,
                width: 2 + post.similarity * 5,
            })),
        };

        const encoded = encodeURIComponent(Buffer.from(JSON.stringify(graphData)).toString("base64"));
        window.open(`/network-graph?data=${encoded}`, "_blank");
    };

    const handleItemClick = (item) => {
        setSelectedItem(item);
        fetchSimilarities(item.id);
    };

    return (
        <div className="similarity-page">
            <Sidebar />
            <main className="similarity-main">
                <header className="similarity-header">
                    <h1>게시글 유사도 분석</h1>
                </header>

                <div className="content">
                    <aside className="item-list">
                        <h3>게시글 리스트</h3>
                        {error ? (
                            <p className="error-message">{error}</p>
                        ) : loading ? (
                            <p>로딩 중...</p>
                        ) : (
                            <ul>
                                {posts.map((item) => (
                                    <li
                                        key={item.id}
                                        className={`item ${selectedItem?.id === item.id ? "selected" : ""}`}
                                        onClick={() => handleItemClick(item)}
                                    >
                                        <p className="item-title">{item.title}</p>
                                        <p className="item-site"><strong>사이트:</strong> {item.siteName || "N/A"}</p>
                                        <p className="item-timestamp">
                                            <strong>작성:</strong> {new Date(item.timestamp).toLocaleString()}
                                        </p>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </aside>

                    <section className="similarity-details">
                        {selectedItem ? (
                            <>
                                <iframe
                                    src={selectedItem.link}
                                    title="게시글 미리보기"
                                    width="100%"
                                    height="500"
                                    style={{ border: "none", marginBottom: "20px" }}
                                />
                                <h3>유사도 분석 결과: {selectedItem.title}</h3>
                                <button className="similarity-modal-button" onClick={openGraph}>
                                    유사도 보기 (새 창)
                                </button>
                                <div className="similarity-results">
                                    {similarities.length > 0 ? (
                                        <ul>
                                            {similarities.map((similar, idx) => (
                                                <li key={idx} className="similarity-box">
                                                    <h4>
                                                        <a
                                                            href={similar.link}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="similarity-link"
                                                        >
                                                            {similar.title}
                                                        </a>
                                                    </h4>
                                                    <p><strong>유사도:</strong> {(similar.similarity * 100).toFixed(2)}%</p>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p>유사한 게시글이 없습니다.</p>
                                    )}
                                </div>
                            </>
                        ) : (
                            <p>게시글을 선택해 주세요.</p>
                        )}
                    </section>
                </div>
            </main>
        </div>
    );
};

export default Similarity;
