import {NextResponse} from "next/server"; import {createDevelopmentUserId,developmentSessionCookie} from "@/lib/auth/dev-session";
// DEVELOPMENT ONLY: establishes a replaceable, non-production session.
export async function POST(){const response=NextResponse.json({ok:true});response.cookies.set(developmentSessionCookie(createDevelopmentUserId()));return response;}
