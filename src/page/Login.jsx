import axiosInstance from '../axiosConfig';
import React, {useState} from 'react';
import {
    Backdrop,
    Box,
    Button,
    Checkbox,
    FormControlLabel,
    Modal,
    Paper,
    Stack,
    TextField,
    Typography
} from '@mui/material';
import {useNavigate} from 'react-router-dom';
import "../css/page/Login.css";
import "../css/components/UserRegister.css";

const Login = () => {
    const [id, setId] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [mode, setMode] = useState('login');
    const [modalMessage, setModalMessage] = useState('');
    const [modalOpen, setModalOpen] = useState(false);

    const navigate = useNavigate();


    const handleLogin = async () => {
        try {
            const res = await axiosInstance.post(
                '/auth/login',
                {
                    loginId: id,
                    password: password
                }
            );

            const {name, role, accessToken, refreshToken} = res.data;
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);
            localStorage.setItem('name', name);
            localStorage.setItem('role', role);
            axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
            navigate('/dashboard');
        } catch (e) {
            console.error('로그인 실패', e);
            setModalMessage('이메일 또는 비밀번호가 올바르지 않습니다.');
            setModalOpen(true);
        }
    };


    const handleModalClose = () => {
        setModalOpen(false);
    };

    return (
        <Box className="wrapper">
            <Box className="circle1"/>
            <Box className="circle2"/>
            <Paper className="paper" elevation={3}>
                <Typography
                    variant="h5"
                    gutterBottom
                    sx={{
                        fontSize: '2.5rem',
                        fontWeight: 'semibold',
                        color: '#333333',
                        marginBottom: '0.75rem',
                        textAlign: 'center',
                    }}
                >Retriever</Typography>
                {/*<Typography variant="h5" className="title">온라인 마약탐지 플랫폼</Typography>*/}

                {mode === 'login' && (
                    <>
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            handleLogin();
                        }}>
                            <TextField fullWidth label="아이디를 입력해 주세요" variant="outlined" sx={{mb: 2}}
                                       value={id} onChange={(e) => setId(e.target.value)}/>
                            <TextField fullWidth label="비밀번호를 입력해 주세요"
                                       type={showPassword ? 'text' : 'password'} variant="outlined" sx={{mb: 1}}
                                       value={password} onChange={(e) => setPassword(e.target.value)}/>
                            <FormControlLabel
                                control={<Checkbox checked={showPassword}
                                                   onChange={() => setShowPassword(!showPassword)}/>}
                                label="비밀번호 표시"
                            />
                            <Button fullWidth variant="contained" color="primary" type="submit" sx={{mt: 2}}>
                                LOGIN
                            </Button>
                        </form>
                    </>
                )}
            </Paper>

            <Modal
                open={modalOpen}
                onClose={handleModalClose}
                closeAfterTransition
                BackdropComponent={Backdrop}
                BackdropProps={{timeout: 300}}
            >
                <Box className="modal">
                    <Typography className="modalTitle">
                        로그인 오류
                    </Typography>
                    <Typography className="modalMessage">
                        {modalMessage}
                    </Typography>
                    <Button variant="contained" onClick={handleModalClose}>확인</Button>
                </Box>
            </Modal>
        </Box>
    );
};

export default Login;
