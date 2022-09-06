import type { GetSession, Handle } from "@sveltejs/kit";


export const getSession: GetSession = (event) => {
    return event.locals;
}

export const handle: Handle = async ({event, resolve}) => {
    const userAgent = event.request.headers.get("User-Agent") || ""
    event.locals.userAgent = userAgent;

    return await resolve(event)
}