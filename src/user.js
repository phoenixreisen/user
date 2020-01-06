import decode from 'jwt-decode';
import Stores from './stores';

/**
 * Standardkonfig
 * @private
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
 * @public
 */
export const User = {
    jwt: undefined,
    online: true,
    data: null,

    getType,
    getPhxUsername,
    setJWTKey,
    setUserKey,
    load,
    login,
    logout,
    persist,
    isPhx,
    isAdmin,
    isAgency,
    isLoggedIn,
    isServiceProvider,
    isPasswordAuthenticated,
}

//--- FUNKTIONEN -----

/**
 * @return {Store}
 * @private
 */
function getStore(sessionOnly) {
    return (sessionOnly || (typeof sessionOnly === 'undefined' && localConfig.sessionOnly))
        ? Stores.Session
        : Stores.Browser;
}

/**
 * Setzt den Schlüsselnamen, unter dem das JWT
 * im Store gespeichert werden soll.
 * @param {string} key
 * @return {void}
 * @public
 */
export function setJWTKey(key) {
    localConfig.keys.jwt = key;
}

/**
 * Setzt den Schlüsselnamen, unter dem das Benutzerobjekt
 * im Store gespeichert werden soll.
 * @param {string}
 * @return {void}
 * @public
 */
export function setUserKey(key) {
    localConfig.keys.user = key;
}

/**
 * Speichert das Benutzerobjekt sowie das JWT im Store.
 * @return {void}
 * @public
*/
export function persist(sessionOnly = localConfig.sessionOnly) {
    const Store = getStore(sessionOnly);
    User.jwt && Store.set(localConfig.keys.jwt, User.jwt);
    User.data && Store.set(localConfig.keys.user, User.data);
}

/**
 * Lädt Benutzer und JWt aus dem Storage. Wird kein User gefunden,
 * werden Standardwerte gesetzt.
 * @return {void}
 * @public
 */
export function load() {
    const { Session } = Stores;
    const { jwt, user } = localConfig.keys;

    User.online = navigator.onLine;
    localConfig.sessionOnly = (Session.get(jwt, null) !== null);

    const Store = getStore();
    User.jwt = Store.get(jwt, null) || User.jwt;
    User.data = Store.get(user, null) || User.data;
}

/**
 * Prüft, ob ein JWT gesetzt und dieses noch nicht abgelaufen ist.
 * @return {bool}
 * @public
 */
export function isLoggedIn() {
    if(User.jwt) {
        try {
            const now = new Date();
            const exp = new Date(parseInt(decode(User.jwt).exp));
            return (exp >= now);
        } catch(e) {}
    }
    return false;
}

/**
 * Prüfen, ob sich der User bereits mit seinem Passwort
 * authentifiziert hat. Das JWT enthält dann einen
 * entsprechenden Eintrag.
 * @return {bool}
 * @public
 **/
export function isPasswordAuthenticated() {
    if(isLoggedIn()) {
        const data = decode(User.jwt);
        return data.pwd || false;
    }
    return false;
}

/**
 * Prüft anhand einer Rollenangabe im JWT,
 * ob es sich um einen Phoenix-Mitarbeiter handelt.
 * @return {bool}
 * @public
 */
export function isPhx() {
    if(isLoggedIn()) {
        const data = decode(User.jwt);
        return data.roles && data.roles.includes('phoenixmitarbeiter');
    }
    return false;
}

/**
 * Prüft anhand einer Rollenangabe im JWT,
 * ob es sich um einen Phoenix-Admin handelt.
 * @return {bool}
 * @public
 */
export function isAdmin() {
    if(isLoggedIn()) {
        const data = decode(User.jwt);
        return data.roles && data.roles.includes('phoenixadmin');
    }
    return false;
}

/**
 * Prüft, ob es sich um eine Agentur handelt.
 * @return {bool}
 * @public
 */
export function isAgency() {
    if(isLoggedIn()) {
        const data = decode(User.jwt);
        return data.kind && data.kind === 'Agentur';
    }
    return false;
};

/**
 * Prüft anhand einer Rollenangabe im JWT,
 * ob es sich um einen Dienstleister an Bord handelt.
 * @return {bool}
 * @public
 */
export function isServiceProvider() {
    if(isLoggedIn()) {
        const data = decode(User.jwt);
        return data.anbieter
            && data.roles
            && data.roles.includes('phoenixbordpersonal');
    }
    return false;
};

/**
 * Gibt den Nutzertyp zurück,
 * der im JWT steht (Eigenschaft "kind")
 * @returns {string} kind
 * @public
 */
export function getType() {
    if(isLoggedIn()) {
        return decode(User.jwt).kind || null;
    }
    return null;
}

/**
 * Holt die Benutzerkennung des MAs aus dem JWT,
 * falls es sich um einen PHX-MA handelt.
 * @returns {string}s
 */
export function getPhxUsername() {
    if(isLoggedIn() && isPhx()) {
        return decode(User.jwt).sub || null;
    }
    return null;
}

/**
 * Hinterlegt die Credentials im Storage.
 * Authentifizierung muss aber in der jeweiligen
 * Anwendung implementiert werden.
 * @param {string} jwt
 * @param {object} data
 * @return {void}
 * @public
 */
export function login(jwt, data, sessionOnly = false) {
    try {
        decode(jwt); // Prüfung, ob valides JWT
        localConfig.sessionOnly = !!sessionOnly;
        User.data = data;
        User.jwt = jwt;
        User.persist();
    } catch(e) {
        throw 'ungültiges JWT!';
    }
}

/**
 * Setzt die Benutzerdaten zurück
 * und löscht sie aus dem localStorage
 * @return {void}
 * @public
 */
export function logout() {
    User.data = null;
    User.jwt = undefined;

    const Store = getStore();
    Store.remove(localConfig.keys.jwt);
    Store.remove(localConfig.keys.user);
}

//--- DEFAULT EXPORT -----

export default User;