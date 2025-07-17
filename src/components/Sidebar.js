import React, {useState, useEffect} from "react";
import {Link, useLocation} from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import {menuItems} from "./columns/MenuItems";
import "../css/components/sidebar.css";

const Sidebar = () => {
    const location = useLocation();
    const [expandedMenu, setExpandedMenu] = useState(null);
    const [userName, setUserName] = useState("사용자");

    useEffect(() => {
        const matchedMenu = menuItems.find((menuItem) =>
            menuItem.subItems?.some((subItem) => location.pathname === subItem.path)
        );
        if (matchedMenu) {
            setExpandedMenu(matchedMenu.name);
        }
    }, [location.pathname]);

    useEffect(() => {
        const cookies = document.cookie.split("; ");
        const accessTokenCookie = cookies.find(cookie => cookie.startsWith("accessToken="));
        if (accessTokenCookie) {
            const token = accessTokenCookie.split("=")[1];
            try {
                const decoded = jwtDecode(token);
                if (decoded?.role) {
                    setUserName(decoded.role.replace("ROLE_", ""));
                }
            } catch (err) {
                console.error("JWT decode error:", err);
            }
        }
    }, []);

    const handleMenuClick = (menuName) => {
        setExpandedMenu((prevMenu) => (prevMenu === menuName ? null : menuName));
    };

    return (
        <aside className="sidebar open">
            <Link to="/dashboard">
                <img
                    src={`${process.env.PUBLIC_URL}/retriever_logo.png`}
                    alt="Retriever 로고"
                    className="logo-image"
                />
            </Link>
            <nav className="menu">
                {menuItems.map((menuItem) => (
                    <div key={menuItem.name} className="menu-item-container">
                        {menuItem.subItems ? (
                            <>
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

                                <div
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
                                        <div
                                            key={subItem.name}
                                            className={`submenu-item ${
                                                location.pathname === subItem.path
                                                    ? "active"
                                                    : ""
                                            }`}
                                        >
                                            <Link to={subItem.path}>{subItem.name}</Link>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            menuItem.name === "테스트 페이지" ? (
                                <a
                                    href={menuItem.path}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`menu-item ${
                                        location.pathname === menuItem.path ? "active" : ""
                                    }`}
                                >
                                    {menuItem.name}
                                </a>
                            ) : (
                                <Link
                                    to={menuItem.path}
                                    className={`menu-item ${
                                        location.pathname === menuItem.path ? "active" : ""
                                    }`}
                                >
                                    {menuItem.name}
                                </Link>
                            )
                        )}
                    </div>
                ))}
            </nav>
            <div className="user-info">
                <img
                    src={`${process.env.PUBLIC_URL}/police.png`}
                    alt="profile image"
                    className="profile-image"
                />
                <div className="user-details">
                    <p className="user-name">{userName}</p>
                </div>
                <a
                    className="logout-button"
                    href="#"
                    onClick={(e) => {
                        e.preventDefault();
                        // Clear cookies
                        document.cookie = "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
                        document.cookie = "refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
                        // Redirect to login page
                        window.location.href = "/";
                    }}
                >
                    로그아웃
                </a>
            </div>
        </aside>
    );
};

export default Sidebar;
