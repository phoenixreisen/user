export interface UserProps {
    jwt: string | undefined,
    data: object | null,
    online: boolean,

    setJWTKey: (key: string) => void,
    setUserKey: (key: string) => void,

    load: () => UserProps,
    persist: () => void,

    getType: () => string | null,
    getPhxUsername: () => string | null,

    isPhx: () => boolean,
    isAdmin: () => boolean,
    isAgency: () => boolean,
    isLoggedIn: () => boolean,
    isServiceProvider: () => boolean,
    isPasswordAuthenticated: () => boolean,

    login: (
        jwt: string,
        data: {[key:string]: string | number},
        sessionOnly: boolean
    ) => void,
    logout: () => void,
}

export interface JWTProps {
    pwd: boolean,
    sub: string,
    exp: string,
    kind: string,
    anbieter: string,
    roles: Array<string>,
}

export default Phx;