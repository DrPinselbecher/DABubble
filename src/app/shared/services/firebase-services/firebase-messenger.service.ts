import { inject, Injectable } from '@angular/core';
import { addDoc, collection, Firestore, onSnapshot, updateDoc } from '@angular/fire/firestore';
import { deleteDoc, doc, DocumentData, query, where, } from 'firebase/firestore';
import { MessageInterface } from '../../interfaces/message-interface';
import { ThreadService } from '../thread-service/thread.service';
import { MessengerService } from '../messenger-service/messenger.service';
import { AuthserviceService } from '../../../landing-page/services/authservice.service';
import { ReactionInterface } from '../../interfaces/reaction-interface';
import { UserInterface } from '../../../landing-page/interfaces/userinterface';
import { User } from '@angular/fire/auth';
import { FirestoreService } from './firestore.service';
import { MentionUserInterface } from '../../interfaces/mention-user-interface';

@Injectable({
  providedIn: 'root'
})
export class FirebaseMessengerService {
  firestore: Firestore = inject(Firestore);
  authService = inject(AuthserviceService);
  threadService = inject(ThreadService);
  messengerService = inject(MessengerService);

  content = '';
  answerContent = '';
  reaktionContent = '';

  messages: MessageInterface[] = [];
  answers: MessageInterface[] = [];
  reactions: ReactionInterface[] = [];

  tryOtherOption: boolean;
  messageOrThread: string;

  forCount = 0;





  async deleteReaction(messageID: string, reaktionID: string) {
    const path = `${this.checkCollectionChatOrChannel()}/${this.checkDocChatIDOrChannelID()}/messages/${messageID}/reactions/${reaktionID}`;
    try {
      await deleteDoc(doc(this.firestore, path));
    } catch (error) {
      console.error('Error deleting reaction:', error);
    }
  }


  /**
   * 
   * @param messageId - messageId where we get the answeres
   * @returns get the path of the answere chat
   */
  subSomethingList(messageID: string, collectionOfMessage: string, callback?: any) {
    const messegeRef = collection(this.firestore, `${this.checkCollectionChatOrChannel()}/${this.checkDocChatIDOrChannelID()}/messages${this.checkCollectionOfMessage(messageID, collectionOfMessage)}`);
    return onSnapshot(messegeRef, (list) => {
      if (collectionOfMessage == 'answer') {
        this.safeAnswersData(list);
      } else if (collectionOfMessage == 'noCollection') {
        this.safeChatData(list);
      }

      if (callback) {
        return callback();
      }
    })
  }


  safeAnswersData(list: any) {
    this.answers = [];
    list.forEach((element: any & { id: string }) => {
      this.answers.push(this.setMessageObject(element.data(), element.id));
    });
    this.answers = this.sortByDate(this.answers);
  }


  safeChatData(list: any) {
    this.messages = [];
    list.forEach((element: any & { id: string }) => {
      this.messages.push(this.setMessageObject(element.data(), element.id))
    });
    this.messages = this.sortByDate(this.messages);
  }


  /**
   * We check if nothing is undefinend.
   * @param element - is the array in the Firebase where the message are saved
   * @returns - return the filled array
   */
  setMessageObject(element: any, id: string) {
    return {
      content: element.content || '',
      isRead: element.isRead || false,
      senderID: element.senderID || 0,
      senderName: element.senderName || '',
      senderAvatar: element.senderAvatar || '',
      date: new Date(element.date) || 0,
      messageID: id || '',
    }
  }


  /**
   * Sort the array by the dates
   * @param messages - the array
   * @returns - return the sorted array
   */
  sortByDate(messages: MessageInterface[]): MessageInterface[] {
    return messages.sort((a, b) => {
      return a.date.getTime() - b.date.getTime();
    });
  }


  /**
 * We create a user array with his id and add this to the firebase
 * @param user - the array with all user data
 */
  createChat(user: any) {
    let users = {
      user1: user.userID,
      user2: this.authService.currentUserSig()?.userID,
    }
    this.addChat(users)
  }


  createReaktion(messageID: string, collectionOfMessage: string) {
    let date = new Date();
    let timeStamp = date.getTime();
    let reaction = {
      content: this.reaktionContent,
      senderIDs: [
        this.authService.currentUserSig()?.userID,
      ],
      senderNames: [
        this.authService.currentUserSig()?.username,
      ],
      latestReactionTime: timeStamp,
    }
    this.addSomethingToMessage(messageID, collectionOfMessage, reaction, false);
  }


  /**
   * Get the time when message is created and filled the array. 
   */
  createMessage(messageID: string, collectionOfMessage: string, mentionedUsers: any, chartID?: string, chartOrChannel?: string) {
    let date = new Date();
    let timeStamp = date.getTime();
    let message = {};
    if (messageID == 'noID') {
      this.createNormalMessage(message, timeStamp, messageID, collectionOfMessage, mentionedUsers, chartID, chartOrChannel);
    } else {
      this.createAnswerMessage(message, timeStamp, messageID, collectionOfMessage, mentionedUsers)
    }
  }


  createNormalMessage(message: any, timeStamp: number, messageID: string, collectionOfMessage: string, mentionedUsers: any, chartID?: string, chartOrChannel?: string) {
    message = {
      content: this.content,
      senderID: this.authService.currentUserSig()?.userID,
      senderName: this.authService.currentUserSig()?.username,
      senderAvatar: this.authService.currentUserSig()?.avatar,
      date: timeStamp,
    };
    this.content = '';
    this.addSomethingToMessage(messageID, collectionOfMessage, message, mentionedUsers, chartID, chartOrChannel);
  }


  createAnswerMessage(message: any, timeStamp: number, messageID: string, collectionOfMessage: string, mentionedUsers: any) {
    message = {
      content: this.answerContent,
      senderID: this.authService.currentUserSig()?.userID,
      senderName: this.authService.currentUserSig()?.username,
      senderAvatar: this.authService.currentUserSig()?.avatar,
      date: timeStamp,
    };
    this.answerContent = '';
    this.addSomethingToMessage(messageID, collectionOfMessage, message, mentionedUsers);
  }


  /**
   * We save the message in our firebase.
   * @param message - the sent message
   */
  async addSomethingToMessage(messageID: string, collectionOfMessage: string, array: any, mentionedUsers: any, chartID?: string, chartOrChannel?: string) {
    const ref = `${this.checkCollectionChatOrChannel(chartOrChannel)}/${this.checkDocChatIDOrChannelID(chartID, chartOrChannel)}/messages${this.checkCollectionOfMessage(messageID, collectionOfMessage)}`
    await addDoc(collection(this.firestore, ref), array).catch(
      (err) => {
        console.error(err);
      }
    ).then(
      (docRef) => {
        this.addMentionsToSameMessage(mentionedUsers, docRef);
      }
    )
  }


  addMentionsToSameMessage(mentionedUsers: any, docRef: any) {
    for (let i = 0; i < mentionedUsers.length; i++) {
      const mentionedUser = mentionedUsers[i];
      if (docRef?.id) {
        this.addMentionUser(docRef?.id, mentionedUser);
      }
    }
  }


  async addMentionUser(messageId: string, mentionedUser: any) {
    await addDoc(collection(this.firestore, `channels/${this.messengerService.channel.channelID}/messages/${messageId}/mentions`), mentionedUser).catch(
      (err) => {
        console.error(err);
      }
    )
  }


  /**
   * we search with the user ID, if we have already a chat with this user
   * @param userID - the user ID
   * @returns - return the element with this user
   */
  searchChat(user: any, newMessageComponent?: boolean, callback?: any) {
    this.messengerService.chartId = '';
    let alreadyTriedOtherOptins = false;
    let messegaRef = query(collection(this.firestore, 'chats'), where('user1', '==', user.userID), where('user2', '==', this.authService.currentUserSig()?.userID));
    if (this.tryOtherOption) {
      messegaRef = query(collection(this.firestore, 'chats'), where('user2', '==', user.userID), where('user1', '==', this.authService.currentUserSig()?.userID));
      this.tryOtherOption = false;
      alreadyTriedOtherOptins = true;
    }
    return onSnapshot(messegaRef, (list) => {
      list.forEach(element => {
        this.messengerService.chartId = element.id
        if (callback) {
          callback(element.id);
        }
      })
      setTimeout(() => {
        if (this.messengerService.chartId == '') {
          this.tryOtherOption = true;
          if (newMessageComponent === true) {
            this.searchChat(user, true);
          } else {
            this.searchChat(user);
          }
          if (alreadyTriedOtherOptins) {
            this.createChat(user);
          }
        } else if (this.messengerService.chartId != '') {
          this.messengerService.messageDates = [];
          this.messages = [];
          if (newMessageComponent !== true) {
            this.messengerService.openMessenger = true;
            this.subSomethingList('noID', 'noCollection', () => {
              setTimeout(() => {
                this.messengerService.scrollToBottom(this.messengerService.scrollContainer);
              }, 10);
            });
          }
        }
      });
    })
  }


  searchChannel(channel: any, callback?: any) {
    this.messengerService.channel.channelID = '';
    let alreadyTriedOtherOptins = false;
    let messegaRef = query(collection(this.firestore, 'channels'), where('title', '==', channel.title));
    return onSnapshot(messegaRef, (list) => {
      list.forEach(element => {
        this.messengerService.chartId = element.id
        if (callback) {
          callback(element.id);
        }
      })
    })
  }


  async updateSomethingAtMessage(messageID: string, collectionOfMessage: string, docID: string, array: any,) {
    let ref = doc(collection(this.firestore, `${this.checkCollectionChatOrChannel()}/${this.checkDocChatIDOrChannelID()}/messages${this.checkCollectionOfMessage(messageID, collectionOfMessage)}`), docID);
    await updateDoc(ref, this.whatShouldBeUpdated(array, collectionOfMessage)).catch(
      (err) => {
        console.error(err);
      }
    )
  }
  

  /**
   * Extracts and returns a simplified JSON object from a given message object.
   * 
   * The returned JSON object includes the message content, sender ID, and the 
   * date in milliseconds since the Unix Epoch, derived from the message's date.
   * 
   * @param message - The message object to be processed.
   * @returns {object} A JSON object containing content, senderId, and date.
   */
  whatShouldBeUpdated(message: any, collectionOfMessage: string): object {
    if (collectionOfMessage == 'reaction') {
      return {
        senderIDs: message.senderIDs,
        senderNames: message.senderNames,
      }
    } else {
      return {
        content: message.content,
        senderId: message.senderID,
        date: message.date.getTime(),
      }
    }
  }


  /**
   * Creates a new chat document in Firestore with the given users array.
   * The users array should contain the IDs of the two users participating in the chat.
   * @param users - The users array to add to the chat document.
   */
  async addChat(users: any) {
    await addDoc(collection(this.firestore, `chats`), users).catch(
      (err) => {
        console.error(err);
      }
    )
  }


  /**
   * Extracts and returns a clean reaction object containing only the sender IDs 
   * and sender names from the provided reaction data.
   * 
   * @param reaction - The reaction data object containing various details.
   * @returns {object} An object with `senderIDs` and `senderNames` extracted from the reaction.
   */
  getCleanReaction(reaction: any): object {
    return {
      senderIDs: reaction.senderIDs,
      senderNames: reaction.senderNames,
    }
  }


  /**
   * Determines the collection type based on the current context.
   * 
   * @returns {string} - Returns 'chats' if the messenger service is in chat mode,
   * otherwise returns 'channels'.
   */
  checkCollectionChatOrChannel(chartOrChannel?: string): string {
    if (chartOrChannel !== undefined) {
      if (chartOrChannel == 'chart') {
        return 'chats';
      } else {
        return 'channels';
      }
    } else if (this.messengerService.openChart) {
      return 'chats';
    } else {
      return 'channels';
    }

  }


  /**
   * Return the document ID for the chat or channel.
   * If openChart is true, return the chartId.
   * If openChannel is true, return the channelID.
   * Otherwise, return an empty string.
   * @returns {string} - the document ID
   */
  checkDocChatIDOrChannelID(chartID?: string, chartOrChannel?: string): string {
    if (this.messengerService.openChart || chartOrChannel === 'chart') {
      if (chartID !== undefined) {
        return `${chartID}`;
      } else {
        return `${this.messengerService.chartId}`;
      }
    } else if (this.messengerService.openChannel || chartOrChannel === 'channel') {
      if (chartID !== undefined) {
        return `${chartID}`;
      } else {
        return `${this.messengerService.channel.channelID}`;
      }
    } else {
      return '';
    }
  }



  /**
   * Check the collection of a message.
   * @param messageID - The id of the message
   * @param collection - The collection of the message (answer, reaction, mention)
   * @returns {string} The path of the collection
   */
  checkCollectionOfMessage(messageID: string, collection: string): string {
    if (collection == 'answer') {
      return `/${messageID}/answers`;
    } else if (collection == 'reaction') {
      return `/${messageID}/reactions`;
    } else if (collection == 'mention') {
      return `/${messageID}/mentions`;
    } else {
      return '';
    }
  }
}