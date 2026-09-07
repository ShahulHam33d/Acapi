import {NextRequest,NextResponse} from "next/server"; import {DEV_SESSION_COOKIE} from "@/lib/auth/dev-session";
// DEVELOPMENT ONLY: protect dashboard routes until production auth is introduced.
export function middleware(request:NextRequest){if(!request.cookies.has(DEV_SESSION_COOKIE)){return NextResponse.redirect(new URL("/login",request.url));}return NextResponse.next();}
export const config={matcher:["/dashboard/:path*","/chats/:path*","/contacts/:path*"]};
