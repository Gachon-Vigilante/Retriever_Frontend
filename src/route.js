// 페이지 라우터 컴포넌트
import React from 'react';
import {BrowserRouter, Route, Router, Routes} from "react-router-dom";
import Dashboard from "./page/MainDashboard";
import AiChat from "./page/AiChat";
import Analyze from "./page/Analyze";

function AppRouter() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/aichat" element={<AiChat />} />
                <Route path="/analyze" element={<Analyze />} />
                {/* 다른 RoutePath를 여기에 추가 */}
            </Routes>
        </BrowserRouter>
    );
}

export default AppRouter;