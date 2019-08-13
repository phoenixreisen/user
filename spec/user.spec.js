const Store = require('store');
const User = require('../src/user');
const jwt = require('jsonwebtoken');

describe("User Handler", () => {

    const token = jwt.sign({
        pwd: true,
        data: 'ICH BIN JON SNOW, KÖNIG DES NORDENS UND ICH HABE MEINE TANTE GEBUMST.',
        exp: new Date(new Date().getTime() + 24*60*60*1000).getTime(),
    }, 'shhhhh');

    beforeEach(() => {
        mockLocalStorage();
        sessionStorage = localStorage;

        spyOn(Store, 'set').and.callThrough();
        spyOn(Store, 'get').and.callThrough();
        spyOn(Store, 'remove').and.callThrough();

        User.setJWTKey('jwt');
        User.setUserKey('user');

        global.navigator = { onLine: true };
    });

    afterEach(() => {
        User.logout();
    });

    it("should contain following properties without any configuration or initialization", () => {
        expect(User.data).toBeDefined();
        expect(User.load).toBeDefined();
        expect(User.logout).toBeDefined();
        expect(User.persist).toBeDefined();
        expect(User.isLoggedIn).toBeDefined();
    });

    it("should be possible to handle the users data and its current state", () => {
        expect(User.data).toBeNull();
        expect(User.jwt).toBeUndefined();
        
        // Fixe Mockdaten zum arbeiten
        User.login(token, {
            prename: 'Fabian',
            surname: 'Marcus',
        });
        expect(Store.set).toHaveBeenCalledTimes(2);
        expect(User.data.prename).toBe('Fabian');
        expect(User.data.surname).toBe('Marcus');
        
        // Im gemockten LocalStorage speichern
        User.persist();
        expect(Store.set).toHaveBeenCalledTimes(4);

        // Daten wieder resetten
        User.data = null;
        User.jwt = undefined;

        // Daten aus Storage auslesen
        User.load();
        expect(Store.get).toHaveBeenCalledTimes(2);
        
        // Prüfen, ob User das enthält, was wir erwarten
        expect(User.data.prename).toBe('Fabian');
        expect(User.data.surname).toBe('Marcus');
        
        // Login-Check: Das Token läuft erst in einer Stunde aus.
        // Die Prüfung sollte also truthy ausgehen.
        const isLoggedIn = User.isLoggedIn();
        expect(isLoggedIn).toBeTruthy();

        // Passwort-Check: Prüft, ob der User sein Passwort 
        // bereits eingegeben hat. JWT enthält dann entsprechenden 
        // Eintrag. Sollte truthy sein.
        const isPasswordAuthenticated = User.isPasswordAuthenticated();
        expect(isPasswordAuthenticated).toBeTruthy();

        // Logout => User sollte danach nicht mehr im 
        // Storage zu finden sein.
        User.logout();
        expect(Store.remove).toHaveBeenCalledTimes(2);
        expect(User.jwt).toBeUndefined();
        expect(User.data).toBeNull();

        // Auch aus dem localStorage sollte er gelöscht sein.
        User.load();
        expect(Store.get).toHaveBeenCalledTimes(4);
        expect(User.jwt).toBeUndefined();
        expect(User.data).toBeNull();
    });

    it("should be possible to recognize a phoenix employee", () => {
        User.jwt = jwt.sign({ roles: ['phoenixmitarbeiter','phoenixadmin'] }, 'shhhhh');
        expect(User.isPhx()).toBeTruthy();
        expect(User.isAdmin()).toBeTruthy();
        
        User.jwt = jwt.sign({ roles: ['keinmitarbeiter','keinadmin'] }, 'shhhhh');
        expect(User.isPhx()).toBeFalsy();
        expect(User.isAdmin()).toBeFalsy();
    });
});