import {PageHeader,EmptyState} from "@/components/ui"; 
export default async function Module(
    {params}:{params:Promise<{module:string}>}){const {module}=await params;
    const title=module.split("-").map(x=>x[0].toUpperCase()+x.slice(1)).join(" "); 
    return <div className="p-6 md:p-10">
        <PageHeader title={title} description="This workspace module is part of the Alpha Connect roadmap."/><EmptyState title={`${title} — Coming Soon`} 
        description="This feature is intentionally not implemented in the first phase."/>
        </div>}
