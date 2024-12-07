export class Message {
    content: string;
    senderID: string;
    senderName: string;
    senderAvatar: string;
    isRead: boolean;
    date: string;
    messageID: string;


    constructor(obj?: any) {
        this.content = obj ? obj.content : '';
        this.senderID = obj ? obj.senderID : '';
        this.senderName = obj ? obj.senderName : '';
        this.senderAvatar = obj ? obj.senderAvatar : '';
        this.isRead = obj ? obj.isRead : false;
        this.date = obj ? obj.date : '';
        this.messageID = obj ? obj.messageID : '';
    }
}
