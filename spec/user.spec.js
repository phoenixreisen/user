/**
 * Tests für Phoenix User.
 *
 * Hinweis: tatsächlich wird in der Node-Test-Umgebung weder mit sessionStorage noch
 * localStorage gearbeitet, sondern einfach mit einem memoryStorage, den sich "Browser"
 * & "Session" quasi teilen. Deshalb müssen wir an manchen Stellen einen Storage stubben,
 * um so zu tun, als gäbe es ihn nicht.
 */
const User = require('../dist/user').default;
const jwt = require('jsonwebtoken');

global.navigator = { onLine: true };
global.sessionStorage = Object.assign({}, localStorage);

describe("User Handler", () => {

    const token = jwt.sign({
        pwd: true,
        sub: 'fabian',
        roles: ['phoenixmitarbeiter'],
        data: 'ICH BIN JON SNOW, KÖNIG DES NORDENS UND ICH HABE MEINE TANTE GEBUMST.',
        exp: new Date(new Date().getTime() + 24*60*60*1000).getTime(),
    }, 'shhhhh');

    beforeAll(() => {
        mockLocalStorage();
    });

    beforeEach(() => {
        localStorage.setItem.calls.reset();
        localStorage.getItem.calls.reset();
        localStorage.removeItem.calls.reset();

        // Da wir hier nur mit localStorage arbeiten wollen, stubben
        // wir den sessionStorage weg, indem er immer null zurück gibt.
        spyOn(sessionStorage, 'getItem').and.returnValue(null);

        User.setJWTKey('jwt');
        User.setUserKey('user');
    });

    afterEach(() => {
        User.logout();
    });

    it("should provide following properties without any configuration or initialization", () => {
        expect(User.data).toBeDefined();
        expect(User.load).toBeDefined();
        expect(User.logout).toBeDefined();
        expect(User.persist).toBeDefined();
        expect(User.isLoggedIn).toBeDefined();
    });

    it("should be able to handle the users data and its current state", () => {
        expect(User.data).toBeNull();
        expect(User.jwt).toBeUndefined();

        // Fixe Mockdaten zum arbeiten
        User.login(token, { prename: 'Fabian', surname: 'Marcus' });
        expect(localStorage.setItem).toHaveBeenCalledTimes(2);
        expect(User.data.prename).toBe('Fabian');
        expect(User.data.surname).toBe('Marcus');

        // Im gemockten LocalStorage speichern
        User.persist();
        expect(localStorage.setItem).toHaveBeenCalledTimes(4);

        // Daten wieder resetten
        User.data = null;
        User.jwt = undefined;

        // Daten aus Storage auslesen
        User.load();
        expect(localStorage.getItem).toHaveBeenCalledTimes(2);

        // Prüfen, ob User das enthält, was wir erwarten
        expect(User.data.prename).toBe('Fabian');
        expect(User.data.surname).toBe('Marcus');

        // Login-Check: Das Token läuft erst in einer Stunde aus.
        // Die Prüfung sollte also truthy ausgehen.
        const isLoggedIn = User.isLoggedIn();
        expect(isLoggedIn).toBeTruthy();

        // Passwort-Check: Prüft, ob der User sein Passwort bereits
        // eingegeben hat. JWT enthält dann entsprechenden Eintrag.
        // Sollte truthy sein.
        const isPasswordAuthenticated = User.isPasswordAuthenticated();
        expect(isPasswordAuthenticated).toBeTruthy();

        // Prüft, ob der Benutzername im JWT im übergebenen Array vorkommt.
        // Dient zum setzen von Feature Flags.
        expect(User.isInPrivileged(['fabian'])).toBeTruthy();
        expect(User.isInPrivileged(['blabla'])).toBeFalsy();
        expect(User.isInPrivileged('fabian')).toBeFalsy();
        expect(User.isInPrivileged([])).toBeFalsy();
        expect(User.isInPrivileged()).toBeFalsy();

        // Logout => User sollte danach nicht
        // mehr im Storage zu finden sein.
        User.logout();
        expect(localStorage.removeItem).toHaveBeenCalledTimes(2);
        expect(User.jwt).toBeUndefined();
        expect(User.data).toBeNull();

        // Auch aus dem localStorage sollte er gelöscht sein.
        User.load();
        expect(localStorage.getItem).toHaveBeenCalledTimes(4);
        expect(User.jwt).toBeUndefined();
        expect(User.data).toBeNull();
    });

    it("should be able to recognize a phoenix employee", () => {
        User.jwt = jwt.sign({
            roles: ['phoenixmitarbeiter','phoenixadmin'],
            exp: new Date(new Date().getTime() + 24*60*60*1000).getTime(),
        }, 'shhhhh');
        expect(User.isPhx()).toBeTruthy();
        expect(User.isAdmin()).toBeTruthy();

        User.jwt = jwt.sign({ roles: ['keinmitarbeiter','keinadmin'] }, 'shhhhh');
        expect(User.isPhx()).toBeFalsy();
        expect(User.isAdmin()).toBeFalsy();
    });

    it("should be able to recognize an agency and get its number out of the JWT", () => {
        User.jwt = jwt.sign({
            exp: new Date(new Date().getTime() + 24*60*60*1000).getTime(),
            kind: 'Agentur',
            sub: '444440',
        }, 'secret!');
        expect(User.isPhx()).toBeFalsy();
        expect(User.isAgency()).toBeTruthy();
        expect(User.getAgencyNr()).toBe(444440);
    });

    it("should correctly check if a user has a certain role", () => {
        User.login(token, { prename: 'Fabian', surname: 'Marcus' });
        expect(User.hasRole('phoenixmitarbeiter')).toBeTrue();
        expect(User.hasRole('phoenixadmin')).toBeFalse();
    });
});

describe("Storage", () => {

    const token = jwt.sign({
        pwd: true,
        data: 'TOKENS, TOKENS, TOKENS. ÜBERALL TOKENS.',
        exp: new Date(new Date().getTime() + 24*60*60*1000).getTime(),
    }, 'shhhhh');

    beforeAll(() => {
        mockLocalStorage();
    });

    beforeEach(() => {
        localStorage.setItem.calls.reset();
        localStorage.getItem.calls.reset();
        localStorage.removeItem.calls.reset();

        spyOn(sessionStorage, 'setItem').and.callThrough();
        spyOn(sessionStorage, 'getItem').and.callThrough();
    });

    afterEach(() => {
        User.logout();
    });

    it('should be able to set a "session only" flag', () => {
        User.setSessionOnly(true);

        // User sollte im sessionStorage (true flag),
        // nicht localStorage gespeichert werden.
        User.login(token, { prename: 'Fabian', surname: 'Marcus' });
        expect(sessionStorage.setItem).toHaveBeenCalledTimes(2);
        expect(localStorage.setItem).toHaveBeenCalledTimes(0);
        // User sollte aus sessionStorage,
        // nicht aus localStorage kommen.
        User.load();
        expect(sessionStorage.getItem).toHaveBeenCalledTimes(2);
        expect(localStorage.getItem).toHaveBeenCalledTimes(0);

        // Zähler nullen
        sessionStorage.setItem.calls.reset();
        sessionStorage.getItem.calls.reset();
        localStorage.setItem.calls.reset();
        localStorage.getItem.calls.reset();

        // sessionStorage ausschalten
        sessionStorage.getItem.and.returnValue(null);

        User.setSessionOnly(false);
        // User sollte im localStorage (false flag),
        // nicht sessionStorage gespeichert werden.
        User.login(token, { prename: 'Fabian', surname: 'Marcus' });
        expect(sessionStorage.setItem).toHaveBeenCalledTimes(0);
        expect(localStorage.setItem).toHaveBeenCalledTimes(2);
        // User sollte aus localStorage,
        // nicht aus sessionStorage kommen.
        User.load();
        expect(sessionStorage.getItem).toHaveBeenCalledTimes(0);
        expect(localStorage.getItem).toHaveBeenCalledTimes(2);
    });
})