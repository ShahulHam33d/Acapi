import {NextResponse} from "next/server"; 
import {prisma} from "@/lib/prisma";
export async function GET(){const conversations=await prisma.conversation.findMany({orderBy:{updatedAt:"desc"},include:{contact:true,messages:{orderBy:{timestamp:"asc"}}}});return NextResponse.json({conversations});}
