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
    const [username, setUsername] = useState('');
    const [foundId, setFoundId] = useState(null);
    const [resetStep, setResetStep] = useState('verify');
    const [resetUser, setResetUser] = useState('');
    const [resetPhone, setResetPhone] = useState('');
    const [resetId, setResetId] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [modalMessage, setModalMessage] = useState('');
    const [modalOpen, setModalOpen] = useState(false);

    // User registration form state
    const [phone, setPhone] = useState('');
    const [openRegModal, setOpenRegModal] = useState(false);
    const [regModalMessage, setRegModalMessage] = useState('');
    // Registration verification code flow state
    const [verificationCodeSent, setVerificationCodeSent] = useState('');
    const [showCodeInput, setShowCodeInput] = useState(false);
    const [enteredCode, setEnteredCode] = useState('');
    // Registration password input state
    const [showPasswordInput, setShowPasswordInput] = useState(false);
    const [passwordReg, setPasswordReg] = useState('');

    const navigate = useNavigate();

    // Password reset verification state
    const [showVerificationCodeInput, setShowVerificationCodeInput] = useState(false);
    const [verificationCode, setVerificationCode] = useState('');

    const handleLogin = () => {
        if (id === 'admin@gmail.com' && password === '1234') {
            localStorage.setItem('role', 'admin');
            navigate('/dashboard');
        } else if (id === 'user' && password === 'user123') {
            localStorage.setItem('role', 'user');
            navigate('/dashboard');
        } else {
            setModalMessage('이메일 또는 비밀번호가 올바르지 않습니다.');
            setModalOpen(true);
        }
    };

    const resetAll = () => {
        setMode('login');
        setUsername('');
        setPhone('');
        setFoundId(null);
        setResetStep('verify');
        setResetUser('');
        setResetPhone('');
        setResetId('');
        setNewPassword('');
        setConfirmPassword('');
    };

    const handleModalClose = () => {
        setModalOpen(false);
        if (modalMessage === '비밀번호가 변경되었습니다.') {
            resetAll();
        }
    };

    // Registration form submit handler
    const handleRegisterSubmit = () => {
        // Use a fixed verification code for testing
        const code = '123456';
        setVerificationCodeSent(code);
        console.log('Verification code set to 123456'); // for testing purposes
        setShowCodeInput(true);
        setRegModalMessage('인증번호가 이메일로 전송되었습니다.');
        setOpenRegModal(true);
    };

    // Verify entered code
    const handleVerifyCode = () => {
        if (enteredCode === verificationCodeSent) {
            setShowPasswordInput(true);
        } else {
            setRegModalMessage('인증번호가 일치하지 않습니다');
            setOpenRegModal(true);
        }
    };

    // Final registration handler after password input
    const handleFinalRegister = () => {
        // Here you would normally send name/phone/password to backend
        setRegModalMessage('회원가입이 완료되었습니다');
        setOpenRegModal(true);
    };

    // Registration modal close handler
    const handleRegModalClose = () => {
        setOpenRegModal(false);
        if (regModalMessage === '회원가입이 완료되었습니다') {
            setMode('login');
            setPhone('');
            setShowCodeInput(false);
            setShowPasswordInput(false);
            setEnteredCode('');
            setVerificationCodeSent('');
            setPasswordReg('');
        }
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
                            <TextField fullWidth label="이메일" variant="outlined" sx={{mb: 2}}
                                       value={id} onChange={(e) => setId(e.target.value)}/>
                            <TextField fullWidth label="비밀번호"
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
                        <Stack direction="row" spacing={3} justifyContent="center" sx={{mt: 3}}>
                            <Button size="small" onClick={() => setMode('findId')}>이메일 찾기</Button>
                            <Button size="small" onClick={() => setMode('resetPw')}>비밀번호 찾기</Button>
                            <Button size="small" onClick={() => setMode('register')}>회원가입</Button>
                        </Stack>
                    </>
                )}

                {mode === 'findId' && (
                    <>
                        <Typography
                            variant="h5"
                            gutterBottom
                            sx={{
                                fontSize: '1.5rem',
                                fontWeight: 'bold',
                                color: '#333333',
                                marginBottom: '0.75rem',
                                textAlign: 'center',
                            }}
                        >이메일 찾기</Typography>
                        <TextField fullWidth label="사용자명" variant="outlined" sx={{mb: 2}}
                                   value={username} onChange={(e) => setUsername(e.target.value)}/>
                        <TextField fullWidth label="전화번호" variant="outlined" sx={{mb: 2}}
                                   value={phone} onChange={(e) => setPhone(e.target.value)}/>
                        <Button fullWidth variant="contained" color="primary"
                                onClick={() => setFoundId('example_id_2025')}>
                            찾기
                        </Button>
                        {foundId && (
                            <Box sx={{mt: 2, textAlign: 'center'}}>
                                <Typography variant="body1">
                                    당신의 이메일은 <strong>{foundId}</strong> 입니다.
                                </Typography>
                                <Button variant="text" sx={{mt: 1}} onClick={resetAll}>로그인 화면으로</Button>
                            </Box>
                        )}
                    </>
                )}

                {mode === 'resetPw' && resetStep === 'verify' && (
                    <>
                        <Typography
                            variant="h5"
                            gutterBottom
                            sx={{
                                fontSize: '1.5rem',
                                fontWeight: 'bold',
                                color: '#333333',
                                marginBottom: '0.75rem',
                                textAlign: 'center',
                            }}
                        >비밀번호 찾기</Typography>
                        <TextField fullWidth label="사용자명" variant="outlined" sx={{mb: 2}}
                                   value={resetUser} onChange={(e) => setResetUser(e.target.value)}/>
                        <TextField fullWidth label="이메일" variant="outlined" sx={{mb: 2}}
                                   value={resetId} onChange={(e) => setResetId(e.target.value)}/>
                        <Box sx={{display: 'flex', gap: 1, mb: 2}}>
                            <TextField fullWidth label="전화번호" variant="outlined" value={resetPhone}
                                       onChange={(e) => setResetPhone(e.target.value)}/>
                            <Button variant="contained" color="inherit" sx={{whiteSpace: 'nowrap'}}
                                    onClick={() => setShowVerificationCodeInput(true)}>
                                인증 번호 요청
                            </Button>
                        </Box>
                        {showVerificationCodeInput && (
                            <TextField
                                fullWidth
                                label="인증코드 입력"
                                variant="outlined"
                                sx={{mb: 2}}
                                value={verificationCode}
                                onChange={(e) => setVerificationCode(e.target.value)}
                            />
                        )}
                        <Button fullWidth variant="contained" color="primary" onClick={() => setResetStep('change')}>
                            인증
                        </Button>
                    </>
                )}

                {mode === 'resetPw' && (
                    <>
                        <Typography
                            variant="h5"
                            gutterBottom
                            sx={{
                                fontSize: '1.5rem',
                                fontWeight: 'bold',
                                color: '#333333',
                                marginBottom: '0.75rem',
                                textAlign: 'center',
                            }}
                        >새 비밀번호 입력</Typography>
                        <TextField fullWidth label="새 비밀번호" type="password" variant="outlined" sx={{mb: 2}}
                                   value={newPassword} onChange={(e) => setNewPassword(e.target.value)}/>
                        <TextField fullWidth label="비밀번호 확인" type="password" variant="outlined" sx={{mb: 2}}
                                   value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}/>
                        <Button fullWidth variant="contained" color="primary" onClick={() => {
                            if (newPassword !== confirmPassword) {
                                setModalMessage('비밀번호가 일치하지 않습니다.');
                                setModalOpen(true);
                            } else {
                                setModalMessage('비밀번호가 변경되었습니다.');
                                setModalOpen(true);
                            }
                        }}>
                            비밀번호 변경
                        </Button>
                    </>
                )}
                {mode === 'register' && (
                  <>
                    <Typography
                      variant="h5"
                      gutterBottom
                      sx={{
                        fontSize: '1.5rem',
                        fontWeight: 'bold',
                        color: '#333333',
                        marginBottom: '0.75rem',
                        textAlign: 'center',
                      }}
                      className="register-title"
                    >
                      사용자 정보 등록
                    </Typography>
                    <TextField
                      fullWidth
                      label="이메일"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      sx={{ mb: 2 }}
                    />
                    {!showCodeInput && !showPasswordInput && (
                      <Button
                        variant="contained"
                        fullWidth
                        sx={{ mt: 2 }}
                        onClick={handleRegisterSubmit}
                      >
                        인증번호 발송
                      </Button>
                    )}
                    {showCodeInput && !showPasswordInput && (
                      <>
                        <TextField
                          fullWidth
                          label="인증번호 입력"
                          value={enteredCode}
                          onChange={(e) => setEnteredCode(e.target.value)}
                          sx={{ mb: 2 }}
                        />
                        <Button
                          variant="contained"
                          fullWidth
                          sx={{ mt: 2 }}
                          onClick={handleVerifyCode}
                        >
                          인증번호 확인
                        </Button>
                      </>
                    )}
                    {showPasswordInput && (
                      <>
                        <TextField
                          fullWidth
                          label="비밀번호 입력"
                          type="password"
                          value={passwordReg}
                          onChange={(e) => setPasswordReg(e.target.value)}
                          sx={{ mb: 2 }}
                        />
                        <Button
                          variant="contained"
                          fullWidth
                          sx={{ mt: 2 }}
                          onClick={handleFinalRegister}
                        >
                          회원가입 완료
                        </Button>
                      </>
                    )}
                    <Modal
                      open={openRegModal}
                      onClose={() => setOpenRegModal(false)}
                      closeAfterTransition
                      BackdropComponent={Backdrop}
                      BackdropProps={{ timeout: 300 }}
                    >
                      <Box className="modal">
                        <Typography className="modalTitle">알림</Typography>
                        <Typography className="modalMessage" style={{ whiteSpace: 'pre-line' }}>
                          {regModalMessage}
                        </Typography>
                        <Button
                          variant="contained"
                          className="modalButton"
                          onClick={handleRegModalClose}
                        >
                          확인
                        </Button>
                      </Box>
                    </Modal>
                  </>
                )}
            </Paper>

            {/* 모달 영역 */}
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
