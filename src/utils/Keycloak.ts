import KeycloakConnect from 'keycloak-connect';

export class Keycloak extends KeycloakConnect {
    constructor(realm: string, url: string, client: string) {
        const config = {
            realm,
            'auth-server-url': url,
            'ssl-required': 'external',
            resource: client,
            'bearer-only': true,
            'confidential-port': 0,
        };

        super({}, config);
    }
}
