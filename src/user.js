const decode = require('jwt-decode');
const Stores = require('./stores');

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
const User = {
    jwt: undefined,
    online: true,
    data: null,

    getType,
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
module.exports = User;

// FUNKTIONEN ------------------------------------------

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
function setJWTKey(key) {
    localConfig.keys.jwt = key;
}

/**
 * Setzt den Schlüsselnamen, unter dem das Benutzerobjekt
 * im Store gespeichert werden soll.
 * @param {string}
 * @return {void}
 * @public
 */
function setUserKey(key) {
    localConfig.keys.user = key;
}

/**
 * Speichert das Benutzerobjekt sowie das JWT im Store.
 * @return {void}
 * @public
*/
function persist(sessionOnly = localConfig.sessionOnly) {
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
function load() {
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
function isLoggedIn() {
    if(User.jwt) {
        const now = new Date();
        const exp = new Date(parseInt(decode(User.jwt).exp));
        return (exp >= now);
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
function isPasswordAuthenticated() {
    if(User.jwt) {
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
function isPhx() {
    if(User.jwt) {
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
function isAdmin() {
    if(User.jwt) {
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
function isAgency() {
    if(User.jwt) {
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
function isServiceProvider() {
    if(User.jwt) {
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
 * @param {object} User
 * @returns {string} kind
 * @public
 */
function getType() {
    if(User.jwt) {
        const data = decode(User.jwt);
        return data.kind;
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
function login(jwt, data, sessionOnly = false) {
    if(!jwt) {
        throw 'Ohne JWT kein Login!';
    }
    localConfig.sessionOnly = !!sessionOnly;
    User.data = data;
    User.jwt = jwt;
    User.persist();
}

/**
 * Setzt die Benutzerdaten zurück
 * und löscht sie aus dem localStorage
 * @return {void}
 * @public
 */
function logout() {
    User.data = null;
    User.jwt = undefined;

    const Store = getStore();
    Store.remove(localConfig.keys.jwt);
    Store.remove(localConfig.keys.user);
}