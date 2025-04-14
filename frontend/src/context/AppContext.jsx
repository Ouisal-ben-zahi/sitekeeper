import { createContext, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

export const AppContext = createContext();

export default function AppProvider({ children }) {
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [user, setUser] = useState(null);
    const [userRole, setUserRole] = useState(localStorage.getItem('RoleUser'));
    const [userId, setUserId] = useState(localStorage.getItem('UserId'));
    const [isLoading, setIsLoading] = useState(true);

    async function getUser() {
        try {
            const res = await fetch('http://127.0.0.1:8000/api/user', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (!res.ok) throw new Error("Échec de la récupération de l'utilisateur");

            const data = await res.json();
            setUser(data);
            setUserRole(data.role);
            setUserId(data.id);  // Assuming the user object has an 'id' property
            localStorage.setItem('RoleUser', data.role);
            localStorage.setItem('UserId', data.id);
            setIsLoading(false);
            return data;
        } catch (error) {
            console.error("Erreur lors de la récupération de l'utilisateur:", error);
            logout();
            throw error;
        }
    }

    function logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('RoleUser');
        localStorage.removeItem('UserId');
        setToken(null);
        setUser(null);
        setUserRole(null);
        setUserId(null);
        setIsLoading(false);
    }
    
    function login(newToken, userData) {
        localStorage.setItem('token', newToken);
        localStorage.setItem('RoleUser', userData.role);
        localStorage.setItem('UserId', userData.id);
        setToken(newToken);
        setUser(userData);
        setUserRole(userData.role);
        setUserId(userData.id);
    }

    useEffect(() => {
        if (token) {
            getUser();
        } else {
            setIsLoading(false);
        }
    }, [token]);

    return (
        <AppContext.Provider value={{ 
            token, 
            user, 
            userRole, 
            userId,
            isLoading,
            login,
            logout,
            getUser
        }}>
            {children}
        </AppContext.Provider>
    );
}