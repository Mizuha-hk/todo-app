import { AuthResponse } from "./api/ClientPrincipal";

async function GetProfile() {
    const result = await fetch('/.auth/me');
    const body = await result.json() as AuthResponse;
    return body;
}

export { GetProfile };