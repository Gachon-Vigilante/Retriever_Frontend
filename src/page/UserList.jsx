import Sidebar from "../components/Sidebar";
import UserAdd from "../components/UserAdd";
import React, {useEffect, useState} from "react";
import "../css/components/Pagination.css";
import "../css/page/UserList.css";
import axios from "axios";
import {DataGrid} from '@mui/x-data-grid';
import {Box} from '@mui/material';
import {jwtDecode} from "jwt-decode";

axios.defaults.withCredentials = true;

const getRoleFromAccessToken = () => {
    const cookies = Object.fromEntries(
        document.cookie.split("; ").map((c) => {
            const [key, value] = c.split("=");
            return [key.trim(), value];
        })
    );

    const token = cookies.accessToken;
    console.log("파싱된 accessToken:", token);

    if (!token) return null;

    try {
        const decoded = jwtDecode(token);
        console.log("디코딩된 JWT:", decoded);
        return decoded.role?.replace(/^ROLE_/, "");
    } catch (err) {
        console.error("JWT decode error:", err);
        return null;
    }
};

const UserList = () => {
    const [users, setUsers] = useState([]);
    const [openAddModal, setOpenAddModal] = useState(false);
    const [currentUserRole, setCurrentUserRole] = useState(null);

    const fetchUsers = async () => {
        try {
            const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/user`, {withCredentials: true});
            setUsers(res.data);
        } catch (err) {
            console.error("Error fetching users:", err);
        }
    };

    useEffect(() => {
        console.log("useEffect 실행됨");
        fetchUsers();
        const role = getRoleFromAccessToken();
        console.log("현재 로그인한 사용자 권한:", role);
        setCurrentUserRole(role);
    }, []);

    const handleRoleChange = async (rowId, newRole) => {
        const targetUser = users[rowId];
        try {
            await axios.patch(`${process.env.REACT_APP_API_BASE_URL}/user/grant-role`, {
                employeeId: targetUser.employeeId,
                role: newRole
            }, {withCredentials: true});
            fetchUsers();
            alert("역할이 변경되었습니다.");
        } catch (err) {
            console.error("역할 변경 실패:", err);
            alert("역할 변경에 실패했습니다.");
        }
    };

    const userColumns = [
        {field: 'employeeId', headerName: '사번', flex: 1},
        {field: 'name', headerName: '이름', flex: 1},
        {
            field: 'role',
            headerName: '역할',
            flex: 1,
            editable: currentUserRole === "ROOT"
        }
    ];

    return (
        <div className="user-page">
            <Sidebar/>
            <main className="user-main with-sidebar">
                <header className="ai-chat-header">
                    <h1>사용자 목록</h1>
                    <button className="user-add-button" onClick={() => setOpenAddModal(true)}>관리자 추가</button>
                </header>
                <div className="user-table">
                    <Box sx={{height: '100%', width: '100%', marginBottom: '2rem'}}>
                        <h3>사용자 목록</h3>
                        <DataGrid
                            rows={users.map((user, index) => ({id: index, ...user}))}
                            columns={userColumns}
                            pageSize={5}
                            rowsPerPageOptions={[5, 10]}
                            disableRowSelectionOnClick
                            onCellEditCommit={(params) => {
                                if (params.field === 'role') {
                                    const prevRole = users[params.id].role;
                                    const newRole = params.value;

                                    if (
                                        (prevRole === "USER" && newRole === "ADMIN") ||
                                        (prevRole === "ADMIN" && newRole === "USER")
                                    ) {
                                        handleRoleChange(params.id, newRole);
                                    } else {
                                        alert("USER와 ADMIN 간에만 변경 가능합니다.");
                                    }
                                }
                            }}
                        />
                    </Box>
                </div>
                <UserAdd open={openAddModal} onClose={() => setOpenAddModal(false)} onUserAdded={fetchUsers}/>
            </main>
        </div>
    );
};
export default UserList;