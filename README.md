# Phoenix Reisen User

User Handler, der den typischen Umgang mit einem eingeloggten bzw. sich einloggenden Phoenix-User erleichtert.

## API

```ts
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
    setSessionOnly: (sessionOnly: boolean) => void,
    
    load: () => UserProps,
    persist: () => void,

    getType: () => string | null,
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
```

## Installation

```bash
npm install --save @phoenixreisen/user
```

## Test

```bash
npm run test
```

## Deployment

```bash
[npm install]                       # Abhängigkeiten installieren
npm version [major|minor|patch]     # increase version x.x.x => major.minor.patch
npm publish                         # upload to npm
git push
```