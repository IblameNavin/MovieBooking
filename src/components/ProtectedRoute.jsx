import React from 'react';
import { Navigate } from 'react-router-dom';
import Cookies from 'js-cookie';

export const ProtectedRoute = ({ children, role }) => {
    const token = Cookies.get('token');
    const userRole = Cookies.get('role');

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    if (role && userRole !== role) {
        return <div className="min-h-screen flex items-center justify-center text-xl text-red-600 font-bold">Access Denied: You do not have permission to view this page.</div>;
    }

    return children;
};
