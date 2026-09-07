import {NextResponse} from "next/server"; 
export async function POST(){return NextResponse.json({error:"Authentication and workspace context are required before assigning a conversation."},{status:401});}
