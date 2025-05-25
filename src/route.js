// 페이지 라우터 컴포넌트
import React from 'react';
import {BrowserRouter, Route, Routes} from "react-router-dom";
import MainDashboard from "./page/MainDashboard";
import AiChat from "./page/AiChat";
import Statistics from "./page/Statistics";
import {Guide} from "./page/Guide";
import {Settings} from "./page/Setting";
import Channels from "./page/Channels";
import Similarity from "./page/Similarity";
import Posts from "./page/Posts";
import ChannelSimilarities from "./page/ChannelSimilarities";
import GraphVisualizer from "./components/GraphVisualizer";
import AIReports from "./page/AIReports";

function AppRouter() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<MainDashboard/>}/>
                <Route path="/channels" element={<Channels/>}/>
                <Route path="/posts" element={<Posts/>}/>
                <Route path="/aichat" element={<AiChat/>}/>
                <Route path="/statistics" element={<Statistics/>}/>
                <Route path="/similarity" element={<Similarity/>}/>
                <Route path="/guide" element={<Guide/>}/>
                <Route path="/setting" element={<Settings/>}/>
                <Route path="/channel-similarities" element={<ChannelSimilarities/>}/>
                {/*<Route path="/network-graph" element={<NetworkGraph />} />*/}
                <Route path="/network-graph" element={<GraphVisualizer/>}/>
                <Route path="/ai-reports" element={<AIReports/>}/>
            </Routes>
        </BrowserRouter>
    );
}

export default AppRouter;