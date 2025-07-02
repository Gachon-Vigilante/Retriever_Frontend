export const menuItems = [
    {
        // name: "실시간 마약 거래 현황",
        name: "텔레그램 채널",
        path: "/channels",
    },
    {
        name: "AI 관리",
        subItems: [
            {name: "AI 챗봇", path: "/aichat"},
            {name: "AI 리포트", path: "/ai-reports"},
        ]
    },
    {
        name: "통계",
        path: "/statistics",
    },
    {
        name: "인터넷 게시글",
        path: "/posts",
    },
    {
        name: "유사도 그래프",
        path: "/network-graph",
    },
    {
        name: "테스트 페이지",
        path: "/test",
    }
    // {
    //     name: "유사도 분석",
    //     subItems: [
    //         {
    //             name: "게시글 유사도 분석",
    //             path: "/similarity",
    //         },
    //         {
    //             name: "채널 유사도 분석",
    //             path: "/channel-similarities",
    //         }
    //     ]
    // }
];