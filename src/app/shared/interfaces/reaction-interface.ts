export interface ReactionInterface {
    content: string,
    senderIDs: string[],
    senderNames: string[],
    messageID: string,
    reactionID: string,
    latestReactionTime: number,
}
