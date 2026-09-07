export type ConversationTab="ACTIVE"|"REQUESTING"|"INTERVENED";
export function belongsInTab(status:string,ownerId:string|undefined,currentUserId:string,tab:ConversationTab){if(tab==="REQUESTING")return status==="REQUESTING"&&!ownerId;if(tab==="INTERVENED")return ownerId===currentUserId;return status==="ACTIVE"&&Boolean(ownerId);}
