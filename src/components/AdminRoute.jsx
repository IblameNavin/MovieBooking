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
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
                <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md">
                    <h1 className="text-3xl font-bold text-red-600 mb-4">Access Denied</h1>
                    <p className="text-gray-600 mb-6">You do not have the necessary permissions to view this page.</p>
                    <a href="/" className="inline-block bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition">Go to Home</a>
                </div>
            </div>
        );
    }

    return children;
};
