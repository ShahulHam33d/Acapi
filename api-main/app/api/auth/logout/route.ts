import {NextResponse} from "next/server"; import {DEV_SESSION_COOKIE} from "@/lib/auth/dev-session";
// DEVELOPMENT ONLY.
export async function POST(){const response=NextResponse.json({ok:true});response.cookies.set({name:DEV_SESSION_COOKIE,value:"",httpOnly:true,path:"/",maxAge:0});return response;}
