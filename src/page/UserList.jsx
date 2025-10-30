import Sidebar from "../components/Sidebar";
import UserAdd from "../components/UserAdd";
import React, {useEffect, useState} from "react";
import "../css/components/Pagination.css";
import "../css/page/UserList.css";
import axiosInstance from "../axiosConfig";
import {DataGrid} from '@mui/x-data-grid';
import {Box} from '@mui/material';
import {jwtDecode} from "jwt-decode";

axiosInstance.defaults.withCredentials = true;

const getRoleFromAccessToken = () => {
    const storedRole = localStorage.getItem("role");
    if (!storedRole) return null;
    return storedRole.replace(/^ROLE_/, "");
};

const UserList = () => {
    const [users, setUsers] = useState([]);
    const [openAddModal, setOpenAddModal] = useState(false);
    const [currentUserRole, setCurrentUserRole] = useState(null);

    const fetchUsers = async () => {
        try {
            const res = await axiosInstance.get(`${process.env.REACT_APP_API_BASE_URL}/user`, {withCredentials: true});
            setUsers(res.data);
        } catch (err) {
            console.error("Error fetching users:", err);
        }
    };

    useEffect(() => {
        fetchUsers();
        const role = getRoleFromAccessToken();
        console.log("현재 로그인한 사용자 권한:", role);
        setCurrentUserRole(role);
    }, []);

    const handleRoleChange = async (rowId, newRole) => {
        const targetUser = users[rowId];
        try {
            await axiosInstance.patch(`${process.env.REACT_APP_API_BASE_URL}/user/grant-role`, {
                loginId: targetUser.loginId,
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
        {field: 'loginId', headerName: '아이디', flex: 1},
        {field: 'name', headerName: '이름', flex: 1},
        {
            field: 'role',
            headerName: '역할',
            flex: 1,
            editable: currentUserRole === "ROOT",
            type: 'singleSelect',
            valueOptions: ['ADMIN', 'USER'],
            renderEditCell: (params) => {
                const handleChange = async (event) => {
                    const newRole = event.target.value;

                    if (params.row.role === "ROOT") {
                        alert("ROOT 권한은 변경할 수 없습니다.");
                        if (params.api?.stopCellEditMode) {
                            params.api.stopCellEditMode({id: params.id, field: params.field});
                        }
                        return;
                    }

                    if (
                        (params.value === "USER" && newRole === "ADMIN") ||
                        (params.value === "ADMIN" && newRole === "USER")
                    ) {
                        await handleRoleChange(params.id, newRole);
                    } else {
                        alert("USER와 ADMIN 간에만 변경 가능합니다.");
                    }

                    if (params.api?.stopCellEditMode) {
                        params.api.stopCellEditMode({id: params.id, field: params.field});
                    }
                };

                return (
                    <select value={params.value} onChange={handleChange} autoFocus>
                        <option value="ADMIN">ADMIN</option>
                        <option value="USER">USER</option>
                    </select>
                );
            }
        }
    ];

    return (
        <div className="user-page">
            <Sidebar/>
            <main className="user-main with-sidebar">
                <header className="ai-chat-header">
                    <h1>사용자 목록</h1>
                    <button className="user-add-button" onClick={() => setOpenAddModal(true)}>사용자 추가</button>
                </header>
                <div className="user-table">
                    <Box sx={{height: '100%', width: '100%', marginBottom: '2rem'}}>
                        {/*<h3>사용자 목록</h3>*/}
                        <div className="user-table-datagrid">
                            <DataGrid
                                rows={users.map((user, index) => ({id: index, ...user}))}
                                columns={userColumns}
                                pageSize={5}
                                rowsPerPageOptions={[5, 10]}
                                disableRowSelectionOnClick
                                onCellEditCommit={(params) => {
                                    const prevRole = users[params.id].role;
                                    if (prevRole === "ROOT") {
                                        alert("ROOT 권한은 변경할 수 없습니다.");
                                        return;
                                    }
                                    if (params.field === 'role') {
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
                        </div>
                    </Box>
                </div>
                <UserAdd open={openAddModal} onClose={() => setOpenAddModal(false)} onUserAdded={fetchUsers}/>
            </main>
        </div>
    );
};
export default UserList;