import { createContext, useEffect, useState } from "react";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [isLogin, setIsLogin] = useState(false)
    const [currentUser, setCurrentUser] = useState(null)
    const [token, setToken] = useState(localStorage.getItem('token'))

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        const storedToken = localStorage.getItem("token")
        if (storedUser && storedToken) {
            setCurrentUser(JSON.parse(storedUser));
            setToken(storedToken)
            setIsLogin(true);
        }
    }, []);
    const loginUser = (userData, tokenData) => {
        localStorage.setItem('token', tokenData);
        localStorage.setItem('user', JSON.stringify(userData));
        setCurrentUser(userData);
        setToken(tokenData);
    }

    return (
        <UserContext.Provider value={{ isLogin, setIsLogin, currentUser, loginUser, setCurrentUser, token, setToken }}>
            {children}
        </UserContext.Provider>
    )
}