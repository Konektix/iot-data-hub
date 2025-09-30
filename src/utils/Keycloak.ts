import { createRemoteJWKSet, jwtVerify } from 'jose';
import { ServiceTokenData } from '../types';

export class Keycloak {
    private readonly internalUrl: string;
    private readonly externalUrl: string;
    private readonly clientId: string;
    private readonly clientSecret: string;
    private readonly jwks: ReturnType<typeof createRemoteJWKSet>;
    private serviceToken: string | null = null;
    private serviceTokenExpiry: number = 0;

    constructor(url: string, realm: string, clientId: string, clientSecret: string) {
        this.internalUrl = `http://keycloak:8080/realms/${realm}`;
        this.externalUrl = `${url}realms/${realm}`;
        this.clientId = clientId;
        this.clientSecret = clientSecret;
        const certsUrl = new URL(`${this.internalUrl}/protocol/openid-connect/certs`);
        this.jwks = createRemoteJWKSet(certsUrl);
    }

    public verifyToken = async (token: string) => {
        const { payload } = await jwtVerify(token, this.jwks, {
            issuer: [this.internalUrl, this.externalUrl],
            audience: [this.clientId],
        });

        return payload;
    };

    private fetchNewServiceToken = async () => {
        const response = await fetch(`${this.internalUrl}/protocol/openid-connect/token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                grant_type: 'client_credentials',
                client_id: this.clientId,
                client_secret: this.clientSecret,
            }),
        });

        if (!response.ok) {
            throw new Error(`Couldn't get the service token. Response status: ${response.status}`);
        }

        return (await response.json()) as Promise<ServiceTokenData>;
    };

    public getServiceToken = async () => {
        const now = Math.floor(Date.now() / 1000);

        // Reuse cached token if still valid for > 20s
        if (this.serviceToken && now < this.serviceTokenExpiry - 20) {
            return this.serviceToken;
        }

        const { access_token, expires_in } = await this.fetchNewServiceToken();

        this.serviceToken = access_token;
        this.serviceTokenExpiry = Math.floor(Date.now() / 1000) + expires_in;

        return this.serviceToken;
    };
}
