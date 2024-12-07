import { MessageInterface } from "./message-interface";


export interface Channel {
    channelID?: string,
    title: string,
    description: string,
    createdBy: string,
    isFocus: boolean,
    userIDs: string[],
    messages: MessageInterface[],
}
