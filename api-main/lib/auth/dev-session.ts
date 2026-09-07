import {cookies} from "next/headers";
// DEVELOPMENT ONLY: replace this boundary with production authentication later.
export const DEV_SESSION_COOKIE="alpha_connect_dev_session"; export const DEV_SESSION_MAX_AGE=60*60*24*7;
export function createDevelopmentUserId(){return `dev-user-${crypto.randomUUID()}`;}
export function developmentSessionCookie(userId:string){return {name:DEV_SESSION_COOKIE,value:userId,httpOnly:true,sameSite:"lax" as const,secure:process.env.NODE_ENV==="production",path:"/",maxAge:DEV_SESSION_MAX_AGE};}
export async function getDevelopmentSession(){return (await cookies()).get(DEV_SESSION_COOKIE)?.value??null;}
