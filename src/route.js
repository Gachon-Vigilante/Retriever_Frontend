// 페이지 라우터 컴포넌트
import React from 'react';
import {BrowserRouter, Route, Routes} from "react-router-dom";
import MainDashboard from "./page/MainDashboard";
import AiChat from "./page/AiChat";
import Statistics from "./page/Statistics";
import Channels from "./page/Channels";
import Similarity from "./page/Similarity";
import Posts from "./page/Posts";
import ChannelSimilarities from "./page/ChannelSimilarities";
import GraphVisualizer from "./components/GraphVisualizer";
import AIReports from "./page/AIReports";
import Login from "./page/Login";
import MigrationTest from "./components/MigrationTest";
import UserList from "./page/UserList";

function AppRouter() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Login/>}/>
                <Route path="/dashboard" element={<MainDashboard/>}/>
                <Route path="/channels" element={<Channels/>}/>
                <Route path="/posts" element={<Posts/>}/>
                <Route path="/aichat" element={<AiChat/>}/>
                <Route path="/statistics" element={<Statistics/>}/>
                <Route path="/similarity" element={<Similarity/>}/>
                <Route path="/channel-similarities" element={<ChannelSimilarities/>}/>
                <Route path="/network-graph" element={<MigrationTest/>}/>
                <Route path="/ai-reports" element={<AIReports/>}/>
                <Route path="/userlist" element={<UserList/>}/>
            </Routes>
        </BrowserRouter>
    );
}

export default AppRouter;