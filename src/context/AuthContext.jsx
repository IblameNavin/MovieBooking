import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import Cookies from 'js-cookie';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                setUser(firebaseUser);

                // Fetch user role from Firestore
                try {
                    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
                    const role = userDoc.exists() ? userDoc.data().role || 'user' : 'user';
                    setUserRole(role);

                    // Set cookies for backward compatibility
                    Cookies.set('token', await firebaseUser.getIdToken(), { expires: 7 });
                    Cookies.set('role', role, { expires: 7 });
                } catch (error) {
                    console.error('Error fetching user role:', error);
                    setUserRole('user');
                    Cookies.set('role', 'user', { expires: 7 });
                }
            } else {
                setUser(null);
                setUserRole(null);
                Cookies.remove('token');
                Cookies.remove('role');
            }

            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const value = {
        user,
        userRole,
        loading
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
