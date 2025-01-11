import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import "../css/components/sidebar.css";

const Sidebar = () => {
    const location = useLocation();

    // State to track which main menu is expanded
    const [expandedMenu, setExpandedMenu] = useState(null);

    const menuItems = [
        {
            name: "실시간 마약 거래 현황",
            subItems: [
                { name: "신규 텔레그램 채널", path: "/channels" },
                { name: "신규 탐지 게시글", path: "/posts" },
            ],
        },
        {
            name: "AI 관리",
            path: "/aichat",
        },
        {
            name: "통계",
            path: "/statistics",
        },
        {
            name: "유사도 분석",
            path: "/similarity",
        },
    ];

    // Ensure the correct menu is expanded based on current location
    useEffect(() => {
        const matchedMenu = menuItems.find((menuItem) =>
            menuItem.subItems?.some((subItem) => location.pathname === subItem.path)
        );
        if (matchedMenu) {
            setExpandedMenu(matchedMenu.name);
        }
    }, [location.pathname]);

    const handleMenuClick = (menuName) => {
        setExpandedMenu((prevMenu) => (prevMenu === menuName ? null : menuName));
    };

    return (
        <aside className="sidebar">
            {/* Logo links to the homepage */}
            <Link to="/">
                <img
                    src={`${process.env.PUBLIC_URL}/retriever_logo.png`}
                    alt="Retriever 로고"
                    className="logo-image"
                />
            </Link>
            <nav className="menu">
                <ul>
                    {menuItems.map((menuItem) => (
                        <li key={menuItem.name} className="menu-item-container">
                            {menuItem.subItems ? (
                                <>
                                    {/* Main menu item */}
                                    <div
                                        className={`menu-item ${
                                            expandedMenu === menuItem.name ||
                                            menuItem.subItems.some(
                                                (subItem) => location.pathname === subItem.path
                                            )
                                                ? "active"
                                                : ""
                                        }`}
                                        onClick={() => handleMenuClick(menuItem.name)}
                                    >
                                        {menuItem.name}
                                    </div>
                                    {/* Submenu items with smooth animation */}
                                    <ul
                                        className={`submenu ${
                                            expandedMenu === menuItem.name ? "expanded" : ""
                                        }`}
                                        style={{
                                            maxHeight:
                                                expandedMenu === menuItem.name
                                                    ? `${menuItem.subItems.length * 40}px`
                                                    : "0",
                                        }}
                                    >
                                        {menuItem.subItems.map((subItem) => (
                                            <li
                                                key={subItem.name}
                                                className={`${
                                                    location.pathname === subItem.path
                                                        ? "active"
                                                        : ""
                                                }`}
                                            >
                                                <Link to={subItem.path}>{subItem.name}</Link>
                                            </li>
                                        ))}
                                    </ul>
                                </>
                            ) : (
                                // Main menu without submenus
                                <Link
                                    to={menuItem.path}
                                    className={`menu-item ${
                                        location.pathname === menuItem.path ? "active" : ""
                                    }`}
                                >
                                    {menuItem.name}
                                </Link>
                            )}
                        </li>
                    ))}
                </ul>
            </nav>
            <div className="user-info">
                <img
                    src={`${process.env.PUBLIC_URL}/police.png`}
                    alt="profile image"
                    className="profile-image"
                />
                <div className="user-details">
                    <p className="user-name">관리자</p>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
