import { JWTPayload } from 'jose';

declare global {
    namespace NodeJS {
        interface ProcessEnv {
            KEYCLOAK_URL: string;
            KEYCLOAK_REALM: string;
            KEYCLOAK_CLIENT: string;
            KEYCLOAK_SECRET: string;
        }
    }

    namespace Express {
        interface Request {
            user?: JWTPayload;
        }
    }
}
export {};
