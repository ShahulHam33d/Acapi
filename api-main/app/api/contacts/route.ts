import {NextResponse} from "next/server"; import {z} from "zod"; 
import {prisma} from "@/lib/prisma";
const contactSchema=z.object({name:z.string().trim().min(1),phone:z.string().trim().regex(/^\+?[0-9 ()-]{7,20}$/),email:z.string().email().optional().or(z.literal(""))});
export async function GET(){const contacts=await prisma.contact.findMany({orderBy:{updatedAt:"desc"},include:{conversations:{orderBy:{updatedAt:"desc"},take:1,select:{status:true,updatedAt:true}}}});return NextResponse.json({contacts});}
export async function PATCH(request:Request){const parsed=contactSchema.safeParse(await request.json());if(!parsed.success)return NextResponse.json({error:"Invalid contact details",issues:parsed.error.flatten()},{status:400});return NextResponse.json({contact:parsed.data,note:"Connect this validated handler to a workspace-scoped Prisma update."});}
