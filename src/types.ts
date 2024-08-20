export type UserData = {
    [key: string]: any,
}

export const enum UserTypes {
    'Mitarbeiter' = 'Mitarbeiter',
    'Buchung' = 'Buchung',
    'Agentur' = 'Agentur',
}

export interface UserProps {
    online: boolean,
    data: UserData | null,
    jwt: string | undefined,

    setJWTKey: (key: string) => void,
    setUserKey: (key: string) => void,
    setSessionOnly: (sessionOnly: boolean) => void,
    
    load: () => UserProps,
    persist: () => void,

    getType: () => string | null,
    getAgencyNr: () => number | null,
    getPhxUsername: () => string | null,
    hasRole: (role: string) => boolean,
    
    isPhx: () => boolean,
    isAdmin: () => boolean,
    isAgency: () => boolean,
    isLoggedIn: () => boolean,
    isSessionOnly: () => boolean,
    isServiceProvider: () => boolean,
    isPasswordAuthenticated: () => boolean,
    isInPrivileged: (names: Array<string>) => boolean,
    
    logout: () => void,
    login: (jwt: string, data?: UserData) => void,
}
