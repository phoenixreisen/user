import type { PhxPayload, UserData, UserProps, UserTypes } from './types';
import { jwtDecode } from 'jwt-decode';

/**
 * Typen Export
 * um sie aus diesem Modul
 * heraus importieren zu können.
 */
export  {
    type UserData,
    type UserProps,
    type UserTypes,
    type PhxPayload,
} from './types';

//--- Konstanten & Variablen -----

/**
 * Standardkonfig
 */
const localConfig = {
    keys: {
        jwt: 'jwt',
        user: 'user',
    },
    sessionOnly: false,
};

/**
 * User Model
 */
export const User: UserProps = {
    jwt: undefined,
    online: true,
    data: null,

    hasRole,
    getType,
    getAgencyNr,
    getPhxUsername,
    setJWTKey,
    setUserKey,
    setSessionOnly,
    load,
    persist,
    login,
    logout,
    isPhx,
    isAdmin,
    isAgency,
    isLoggedIn,
    isSessionOnly,
    isInPrivileged,
    isServiceProvider,
    isPasswordAuthenticated,
}

//--- Funktionen -----

/**
 * Gibt den gesetzten Store zurück.
 */
function getStore(): Storage {
    return localConfig.sessionOnly
        ? sessionStorage
        : localStorage;
}

/**
 * Setzt den Schlüsselnamen, unter dem das JWT
 * im Store gespeichert werden soll.
 */
export function setJWTKey(key: string): void {
    localConfig.keys.jwt = key;
}

/**
 * Setzt den Schlüsselnamen, unter dem das Benutzerobjekt
 * im Store gespeichert werden soll.
 */
export function setUserKey(key: string): void {
    localConfig.keys.user = key;
}

/**
 * Setzt, ob die Daten nur für die 
 * Browser Session gespeichert werden sollen.
 */
export function setSessionOnly(sessionOnly: boolean): void {
    localConfig.sessionOnly = sessionOnly;
}

/**
 * Speichert das Benutzerobjekt sowie das JWT im Store.
*/
export function persist(): void {
    const Store = getStore();
    User.jwt && Store.setItem(localConfig.keys.jwt, JSON.stringify(User.jwt));
    User.data && Store.setItem(localConfig.keys.user, JSON.stringify(User.data));
}

/**
 * Lädt Benutzer und JWt aus dem Storage. Wird kein User gefunden,
 * werden Standardwerte gesetzt.
 */
export function load(): UserProps {
    const { jwt, user } = localConfig.keys;
    
    const Store = getStore();
    const token = Store.getItem(jwt);
    const data = Store.getItem(user);

    User.online = navigator.onLine;
    User.jwt = token ? JSON.parse(token) : User.jwt;
    User.data = data ? JSON.parse(data) : User.data;
    return User;
}

/**
 * Prüft, ob ein JWT gesetzt und dieses noch nicht abgelaufen ist.
 */
export function isLoggedIn(): boolean {
    if(User.jwt) {
        try {
            const now = new Date();
            const data = jwtDecode(User.jwt) as PhxPayload;
            if(data?.exp) {
                const exp = new Date(+data.exp);
                return (exp >= now);
            }
        } catch(e) {}
    }
    return false;
}

/**
 * Prüfen, ob sich der User bereits mit seinem Passwort
 * authentifiziert hat. Das JWT enthält dann einen
 * entsprechenden Eintrag.
 **/
export function isPasswordAuthenticated(): boolean {
    if(User.jwt && isLoggedIn()) {
        const data = jwtDecode(User.jwt) as PhxPayload;
        return data.pwd || false;
    }
    return false;
}

/**
 * Prüft anhand einer Rollenangabe im JWT,
 * ob es sich um einen Phoenix-Mitarbeiter handelt.
 */
export function isPhx(): boolean {
    if(User.jwt && isLoggedIn()) {
        return hasRole('phoenixmitarbeiter');
    }
    return false;
}

/**
 * Prüft anhand einer Rollenangabe im JWT,
 * ob es sich um einen Phoenix-Admin handelt.
 */
export function isAdmin(): boolean {
    if(User.jwt && isLoggedIn()) {
        return hasRole('phoenixadmin');
    }
    return false;
}

/**
 * Zum setzen von Feature Flags.
 * Prüft, ob der Benutzername im JWT im Array privilegierter Namen vorkommt.
 */
export function isInPrivileged(names: Array<string>): boolean {
    if(User.jwt && isLoggedIn() && isPhx()) {
        if(Array.isArray(names) && names?.length > 0) {
            // Holt den Benutzernamen aus dem JWT
            const name = getPhxUsername();
            if(name) {
                return names.includes(name);
            }
        }
    }
    return false;
}

/**
 * Prüft, ob es sich um eine Agentur handelt.
 */
export function isAgency(): boolean {
    if(User.jwt && isLoggedIn()) {
        const data = jwtDecode(User.jwt) as PhxPayload;
        return data?.kind === 'Agentur';
    }
    return false;
};

/**
 * Prüft anhand einer Rollenangabe im JWT,
 * ob es sich um einen Dienstleister an Bord handelt.
 */
export function isServiceProvider(): boolean {
    if(User.jwt && isLoggedIn()) {
        const data = jwtDecode(User.jwt) as PhxPayload;
        return !!data?.anbieter && hasRole('phoenixbordpersonal');
    }
    return false;
};

/**
 * Gibt das sessionOnly-Flag zurück.
 */
export function isSessionOnly(): boolean {
    return localConfig.sessionOnly;
}

/**
 * Gibt den Nutzertyp zurück,
 * der im JWT steht (Eigenschaft "kind")
 */
export function getType(): UserTypes | null {
    if(User.jwt && isLoggedIn()) {
        return (jwtDecode(User.jwt) as PhxPayload).kind || null;
    }
    return null;
}

/**
 * Holt die Benutzerkennung des MAs aus dem JWT,
 * falls es sich um einen PHX-MA handelt.
 */
export function getPhxUsername(): string | null {
    if(User.jwt && isLoggedIn() && isPhx()) {
        return (jwtDecode(User.jwt) as PhxPayload).sub || null;
    }
    return null;
}

/**
 * Holt die Agenturnummer aus dem JWT,
 * sofern es sich um eine Agentur handelt.
 */
export function getAgencyNr(): number | null {
    if(User.jwt && isLoggedIn() && isAgency()) {
        const data = jwtDecode(User.jwt) as PhxPayload;
        if(data?.sub) {
            return parseInt(data.sub) || null;
        }
    }
    return null;
}

/**
 * Prüft, ob der Benutzer eine bestimmte Rolle
 * im JWT hinterlegt hat.
 */
export function hasRole(role: string): boolean {
    if(User.jwt && isLoggedIn()) {
        const data = jwtDecode(User.jwt) as PhxPayload;
        return data.roles && data.roles.includes(role);
    }
    return false;
}

/**
 * Hinterlegt die Credentials im Storage.
 * Authentifizierung muss aber in der jeweiligen
 * Anwendung implementiert werden.
 */
export function login(token: string, data?: UserData): void | Error {
    try {
        jwtDecode(token); // Prüfung, ob valides JWT
        User.data = data || null;
        User.jwt = token;
        User.persist();
    } catch(e) {
        throw 'ungültiges JWT!';
    }
}

/**
 * Setzt die Benutzerdaten zurück
 * und löscht sie aus dem localStorage
 */
export function logout(): void {
    User.jwt = undefined;
    User.data = null;

    const Store = getStore();
    Store.removeItem(localConfig.keys.jwt);
    Store.removeItem(localConfig.keys.user);
}

export default User;