import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, Navigate } from "react-router-dom";
import Home from './pages/Home/Home';
import Room from './pages/Room/Room';
import './App.css';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import api from './services/api';
import ProtectedRoute from './utils/ProtectedRoute';
import Wait from './pages/Wait/Wait';

export default function App() {
  const [currentRoomData, setCurrentRoomData] = useState(null);
  const [roomLoading, setRoomLoading] = useState(true)

  const fetchRoomData = async () => {
    try {
      const res = await api.get(`/api/room/`);
      setCurrentRoomData(res.data);
    } catch (err) {
      console.error('Error cargando sala', err);
      setCurrentRoomData(null)
    } finally {
      setRoomLoading(false)
    }
  }

  useEffect(() => {
    fetchRoomData()
  }, [])

  const handleLeaveRoom = async () => {
    try {
      await api.post(`/api/room/leave`);
    } catch (err) {
      console.error(`Error, pero saliendo igual`)
    } finally {
      setCurrentRoomData(null)
    }
  };

  const handleLoginClick = () => {
    window.location.href = "/login"
  }

  const handleRegisterClick = () => {
    window.location.href = "/register"
  }

  const handleLogoutClick = async () => {
    await api.post("/api/auth/logout");
    window.location.href = "/";
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home onRoomLoaded={fetchRoomData} onLoginClick={handleLoginClick} onRegisterClick={handleRegisterClick} onLogoutClick={handleLogoutClick} />}/>
        <Route path="/wait/:id" element={<Wait onRoomLoaded={fetchRoomData} onLoginClick={handleLoginClick} onRegisterClick={handleRegisterClick} onLogoutClick={handleLogoutClick}/>}/>
        <Route element={<ProtectedRoute roomLoading={roomLoading} permiso={currentRoomData !== null} redirect="/"/>}>
          <Route path="/room" element={<Room roomData={currentRoomData} onLeave={handleLeaveRoom} onLoginClick={handleLoginClick} onRegisterClick={handleRegisterClick} onLogoutClick={handleLogoutClick}/>}/>
        </Route>
        <Route path="/login" element={<Login onRegisterClick={handleRegisterClick}/>} />
        <Route path="/register" element={<Register onLoginClick={handleLoginClick}/>} />
        <Route path="*" element={<Navigate to='/' redirect />} />
      </Routes>
    </BrowserRouter>
  );
}