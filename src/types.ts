import type { JwtPayload } from "jwt-decode";

export type UserData = {
    [key: string]: any,
}

/**
 * Im JWT hinterlegte Rollen
 */
export type UserTypes = 'Buchung' | 'Agentur' | 'Mitarbeiter';

/**
 * Das User-Objekt
 * samt Funktionsreferenzen
 */
export interface UserProps {
    online: boolean,
    data: UserData | null,
    jwt: string | undefined,

    setJWTKey: (key: string) => void,
    setUserKey: (key: string) => void,
    setSessionOnly: (sessionOnly: boolean) => void,
    
    load: () => UserProps,
    persist: () => void,

    getType: () => UserTypes | null,
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

/**
 * Im Phoenix JWT hinterlegte Daten
 */
export interface PhxPayload extends JwtPayload {
    pwd: boolean,
    email: string,
    kind: UserTypes,
    anbieter: string,
    roles: Array<string>,
}