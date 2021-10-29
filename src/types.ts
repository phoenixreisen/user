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
    load: () => UserProps,
    persist: () => void,
    getType: () => string | null,
    getAgencyNr: () => number | null,
    getPhxUsername: () => string | null,
    isPhx: () => boolean,
    isAdmin: () => boolean,
    isAgency: () => boolean,
    isLoggedIn: () => boolean,
    isServiceProvider: () => boolean,
    isPasswordAuthenticated: () => boolean,
    logout: () => void,
    login: (
        jwt: string,
        data: UserData,
        sessionOnly: boolean
    ) => void,
}

export interface JWTProps {
    pwd: boolean,
    sub: string,
    exp: string,
    kind: string,
    email: string,
    anbieter: string,
    roles: Array<string>,
}