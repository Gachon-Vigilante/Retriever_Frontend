// 페이지 라우터 컴포넌트
import React from 'react';
import {BrowserRouter, Route, Routes} from "react-router-dom";
import Dashboard from "./page/MainDashboard";
import AiChat from "./page/AiChat";
import Statistics from "./page/Statistics";
import {Guide} from "./page/Guide";
import {Settings} from "./page/Setting";
import Channels from "./page/Channels";
import Similarity from "./page/Similarity";
import Posts from "./page/Posts";

function AppRouter() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/channels" element={<Channels />} />
                <Route path="/posts" element={<Posts />} />
                <Route path="/aichat" element={<AiChat />} />
                <Route path="/statistics" element={<Statistics />} />
                <Route path="/similarity" element={<Similarity />} />
                <Route path="/guide" element={<Guide />} />
                <Route path="/setting" element={<Settings />} />
            </Routes>
        </BrowserRouter>
    );
}

export default AppRouter;