export const menuItems = [
    {
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
        name: "사용자/관리자 등록",
        path: "/userlist",
    }
];