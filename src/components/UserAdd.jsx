import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from '@mui/material';
import axios from 'axios';

const UserAdd = ({ open, onClose, onUserAdded }) => {
  const [formData, setFormData] = useState({
    loginId: '',
    password: '',
    name: ''
  });

  const handleSubmit = async () => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/auth/signup`,
        formData,
        { withCredentials: true }
      );
      alert('사용자가 성공적으로 등록되었습니다.');
      setFormData({ loginId: '', password: '', name: '' });
      if (onUserAdded) {
        onUserAdded();
      }
      onClose();
    } catch (error) {
      console.error('회원가입 실패:', error);
      alert('회원가입에 실패했습니다.');
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>사용자 추가</DialogTitle>
      <DialogContent>
        <form>
          <TextField
            autoFocus
            margin="dense"
            id="loginId"
            label="아이디 (loginId)"
            type="text"
            fullWidth
            variant="outlined"
            value={formData.loginId}
            onChange={(e) => setFormData({ ...formData, loginId: e.target.value })}
          />
          <TextField
            margin="dense"
            id="password"
            label="비밀번호"
            type="password"
            fullWidth
            variant="outlined"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />
          <TextField
            margin="dense"
            id="name"
            label="이름 또는 부서"
            type="text"
            fullWidth
            variant="outlined"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          닫기
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
        >
          등록
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserAdd;