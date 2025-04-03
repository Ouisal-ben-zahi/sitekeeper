import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../../context/AppContext";

const LogoutToLogin = () => {
    const navigate = useNavigate();
    const { logout } = React.useContext(AppContext);

    useEffect(() => {
        // Effectuer la déconnexion
        logout();
        
        // Rediriger vers la page de login
        navigate("/auth/login");
    }, [navigate, logout]);

    return null; // Ne rien afficher car la redirection est immédiate
};

export default LogoutToLogin;