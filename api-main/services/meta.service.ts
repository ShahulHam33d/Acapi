import {isMetaConfigured} from "@/lib/meta/config"; 
export function getEmbeddedSignupConfig(){
    if(!isMetaConfigured()) 
        return {configured:false as const,reason:"Meta Embedded Signup is not configured."}; 
    return {configured:true as const,appId:process.env.NEXT_PUBLIC_META_APP_ID!,configId:process.env.NEXT_PUBLIC_META_CONFIG_ID!};
}
