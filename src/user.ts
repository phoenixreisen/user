import JwtDecode from 'jwt-decode';
import Stores from './stores';

type UserData = {
    [key: string]: any,
}

/**
 * Props & Types
 */
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

    getType,
    getAgencyNr,
    getPhxUsername,
    setJWTKey,
    setUserKey,
    load,
    persist,
    login,
    logout,
    isPhx,
    isAdmin,
    isAgency,
    isLoggedIn,
    isServiceProvider,
    isPasswordAuthenticated,
}

//--- Funktionen -----

/**
 * Gibt den gesetzten Store zurück.
 */
function getStore(sessionOnly: boolean = localConfig.sessionOnly): StoreJsAPI {
    return (sessionOnly || (typeof sessionOnly === 'undefined' && localConfig.sessionOnly))
        ? Stores.Session
        : Stores.Browser;
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
 * Speichert das Benutzerobjekt sowie das JWT im Store.
*/
export function persist(sessionOnly: boolean = localConfig.sessionOnly): void {
    const Store: StoreJsAPI = getStore(sessionOnly);
    User.jwt && Store.set(localConfig.keys.jwt, User.jwt);
    User.data && Store.set(localConfig.keys.user, User.data);
}

/**
 * Lädt Benutzer und JWt aus dem Storage. Wird kein User gefunden,
 * werden Standardwerte gesetzt.
 */
export function load(): UserProps {
    const {Session} = Stores;
    const {jwt, user} = localConfig.keys;

    User.online = navigator.onLine;
    localConfig.sessionOnly = (Session.get(jwt, null) !== null);

    const Store = getStore();
    User.jwt = Store.get(jwt, null) || User.jwt;
    User.data = Store.get(user, null) || User.data;
    return User;
}

/**
 * Prüft, ob ein JWT gesetzt und dieses noch nicht abgelaufen ist.
 */
export function isLoggedIn(): boolean {
    if(User.jwt) {
        try {
            const now = new Date();
            const data: JWTProps = JwtDecode(User.jwt || '');
            const exp = new Date(parseInt(data.exp));
            return (exp >= now);
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
    if(isLoggedIn()) {
        const data: JWTProps = JwtDecode(User.jwt || '');
        return data.pwd || false;
    }
    return false;
}

/**
 * Prüft anhand einer Rollenangabe im JWT,
 * ob es sich um einen Phoenix-Mitarbeiter handelt.
 */
export function isPhx(): boolean {
    if(isLoggedIn()) {
        const data: JWTProps = JwtDecode(User.jwt || '');
        return data.roles && data.roles.includes('phoenixmitarbeiter');
    }
    return false;
}

/**
 * Prüft anhand einer Rollenangabe im JWT,
 * ob es sich um einen Phoenix-Admin handelt.
 */
export function isAdmin(): boolean {
    if(isLoggedIn()) {
        const data: JWTProps = JwtDecode(User.jwt || '');
        return data.roles && data.roles.includes('phoenixadmin');
    }
    return false;
}

/**
 * Prüft, ob es sich um eine Agentur handelt.
 */
export function isAgency(): boolean {
    if(isLoggedIn()) {
        const data: JWTProps = JwtDecode(User.jwt || '');
        return data?.kind === 'Agentur';
    }
    return false;
};

/**
 * Prüft anhand einer Rollenangabe im JWT,
 * ob es sich um einen Dienstleister an Bord handelt.
 */
export function isServiceProvider(): boolean {
    if(isLoggedIn()) {
        const data: JWTProps = JwtDecode(User.jwt || '');
        return !!data?.anbieter && data?.roles?.includes('phoenixbordpersonal');
    }
    return false;
};

/**
 * Gibt den Nutzertyp zurück,
 * der im JWT steht (Eigenschaft "kind")
 */
export function getType(): string | null {
    if(isLoggedIn()) {
        return (JwtDecode(User.jwt || '') as JWTProps).kind || null;
    }
    return null;
}

/**
 * Holt die Benutzerkennung des MAs aus dem JWT,
 * falls es sich um einen PHX-MA handelt.
 */
export function getPhxUsername(): string | null {
    if(isLoggedIn() && isPhx()) {
        return (JwtDecode(User.jwt || '') as JWTProps).sub || null;
    }
    return null;
}

/**
 * Holt die Agenturnummer aus dem JWT,
 * sofern es sich um eine Agentur handelt.
 */
export function getAgencyNr(): number | null {
    if(isLoggedIn() && isAgency()) {
        return parseInt((JwtDecode(User.jwt || '') as JWTProps).sub) || null;
    }
    return null;
}

/**
 * Hinterlegt die Credentials im Storage.
 * Authentifizierung muss aber in der jeweiligen
 * Anwendung implementiert werden.
 */
export function login(jwt: string, data?: UserData, sessionOnly?: boolean): void | Error {
    try {
        JwtDecode(jwt); // Prüfung, ob valides JWT
        localConfig.sessionOnly = !!sessionOnly;
        User.data = data || null;
        User.jwt = jwt;
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

    const Store: StoreJsAPI = getStore();
    Store.remove(localConfig.keys.jwt);
    Store.remove(localConfig.keys.user);
}

export default User;