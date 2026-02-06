import React from 'react';
import { Navigate } from 'react-router-dom';
import Cookies from 'js-cookie';

export const AdminRoute = ({ children }) => {
    const token = Cookies.get('token');
    const userRole = Cookies.get('role');

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    if (userRole !== 'admin') {
        return <Navigate to="/" replace />;
    }

    return children;
};
