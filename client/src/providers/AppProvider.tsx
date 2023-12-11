import React, { createContext, useEffect, useState } from "react"
import { GetProfile } from "../features/get-profile";
import { AuthResponse } from "../features/get-profile/api/ClientPrincipal";

type AppProviderProps = {
    children: React.ReactNode;
};

const AppContext = createContext<AuthResponse | null>(null);

const AppProvider : React.FC<AppProviderProps> = ({children}) => {
    const [user, setUser] = useState<AuthResponse | null>(null);

    useEffect(() =>
    {
        GetProfile().then((response) => setUser(response));
    }, []);

    if(user === null){
        return <div>Loading...</div>
    }

    return(
        <AppContext.Provider value={user}>
            {children}
        </AppContext.Provider>
    )
};

export function useAppContext(){
    const context = React.useContext(AppContext);
    if(context === undefined){
        throw new Error("useAppContext must be used within a AppProvider");
    }
    return context;
}



export default AppProvider;