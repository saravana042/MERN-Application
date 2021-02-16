import { createContext } from 'react';

export const AuthContext = createContext({
    isLoggendIn: false,
    login: () => { },
    logout: () => { }
});