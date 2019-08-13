const decode = require('jwt-decode');
const Store = require('store');

/**
 * Standardkonfig
 * @private
 */
const localConfig = {
    keys: {
        user: 'phx-user',
        jwt: 'phx-user-jwt',
    },
};

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
function persist() {
    if(User.jwt) {
        Store.set(localConfig.keys.jwt, User.jwt);
    }
    if(User.data) {
        Store.set(localConfig.keys.user, User.data);
    }
}

/**
 * Lädt Benutzer und JWt aus dem Storage. Wird kein User gefunden, 
 * werden Standardwerte gesetzt.
 * @return {void}
 * @public
 */
function load() {
    // Wichtig für Offline-Erkennung
    User.online = navigator.onLine;

    // Local Storage checken
    User.jwt = Store.get(localConfig.keys.jwt) || User.jwt;
    User.data = Store.get(localConfig.keys.user) || User.data;
    if(User.jwt) return; // Wir haben einen User!

    // User ist nicht eingeloggt
    User.jwt = undefined;
    User.data = null;
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
function login(jwt, data) {
    if(!jwt) {
        throw 'Ohne JWT kein Login!';
    }
    User.jwt = jwt;
    User.data = data;
    User.persist();
}

/**
 * Setzt die Benutzerdaten zurück
 * und löscht sie aus dem localStorage
 * @return {void}
 * @public
 */
function logout() {
    User.jwt = undefined;
    User.data = null;
    Store.remove(localConfig.keys.jwt);
    Store.remove(localConfig.keys.user);
}


const User = {
    jwt: undefined,
    data: null,
    online: null,

    getType,
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

module.exports = User;