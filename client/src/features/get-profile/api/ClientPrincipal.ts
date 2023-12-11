type ClientPrincipal = {
    identityProvider: string;
    userId: string;
    userDetails: string;
    userRoles: string[];
}

type AuthResponse = {
    clientPrincipal: ClientPrincipal;
}

export type { ClientPrincipal };

export type { AuthResponse };