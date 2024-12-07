import { inject, Injectable } from '@angular/core';
import { collection, doc, Firestore, getDoc, getDocs } from '@angular/fire/firestore';
import { AuthserviceService } from '../../../landing-page/services/authservice.service';
import { MessengerService } from '../messenger-service/messenger.service';
import { FirebaseMessengerService } from '../firebase-services/firebase-messenger.service';
import { ThreadService } from '../thread-service/thread.service';
import { FirestoreService } from '../firebase-services/firestore.service';
import { UserInterface } from '../../../landing-page/interfaces/userinterface';
import { SearchService } from '../search-service/search.service';
import { Message } from '../../../models/message.class';
import { Channel } from '../../interfaces/channel';

@Injectable({
  providedIn: 'root'
})
export class RedirectService {
  firestore = inject(Firestore);
  authService = inject(AuthserviceService);
  messengerService = inject(MessengerService);
  firebaseMessenger = inject(FirebaseMessengerService);
  threadService = inject(ThreadService);
  firestoreService = inject(FirestoreService);
  searchService = inject(SearchService);
  secondUser = this.searchService.secondUser;

  
  /**
   * Redirects to a message with the given message ID. If the message is a private message, it will open the private chat.
   */
  async goToMessage(messageID: string) {
    this.clearSearchResults();
    await this.getUserFullData(messageID);
    const user = this.secondUser;
    if (user) {
      this.configureMessenger(user);
      setTimeout(() => this.scrollToMessage(messageID), 100);
    }
  }

/**
 * Opens a thread for a specific message and scrolls to the reply message.
 * This function first navigates to the message with the given message ID and 
 * then scrolls to the message intended for reply.
 */
  async openThead(message: any, messagetoreplyto: any) {
    await this.goToMessage(message.messageID);
    this.scrollToMessage(messagetoreplyto.messageID);
    this.openedThreadConfig(message, messagetoreplyto);
  }

  /**
   * Clears all search results and resets the arrays.
   * It clears the search results and unsubscribes all subscriptions.
   * It also resets some flags and the message to reply to.
   */
  clearSearchResults() {
    setTimeout(() => {
      this.searchService.clearArrays();
      this.searchService.unsubscribeAll();
      this.threadService.showThreadSideNav = false;
      this.threadService.showThread = false;
      this.threadService.messageToReplyTo = new Message
      ();
      this.searchService.madeQuery = false;
    }, 50);
  }

/**
 * Retrieves the full data of the user involved in a chat given the message ID.
 * It determines the other user in the chat by comparing the current user's ID
 * with the users associated with the chat. The retrieved user data is stored
 * in the `secondUser` property.
 */
  async getUserFullData(messageID: string) {
    const users = await this.getTheUser1AndUser2BasedOnChatID(messageID);
    const currentUserId = this.authService.currentUserSig()?.userID;
    const otherUserId = users?.user1 === currentUserId ? users?.user2 : users?.user1;
    if (otherUserId) {
      const otherUserRef = doc(this.firestore, `users/${otherUserId}`);
      const otherUserSnapshot = await getDoc(otherUserRef);
      if (otherUserSnapshot.exists()) {
        this.secondUser = otherUserSnapshot.data() as UserInterface;
      }
    }
  }

  /**
   * Retrieves the user IDs of both participants in a chat based on a given message ID.
   * This function first obtains the chat ID associated with the given message ID.
   * It then fetches the chat document from Firestore using this chat ID and extracts
   * the user IDs of the two participants (user1 and user2) from the chat data.
   */
  async getTheUser1AndUser2BasedOnChatID(messageID: string) {
    const chatID = await this.getChatIdBasedOnMessageID(messageID);
    if (!chatID) return null;
    const chatRef = doc(this.firestore, `chats/${chatID}`);
    const chatSnapshot = await getDoc(chatRef);
    if (chatSnapshot.exists()) {
      const chatData = chatSnapshot.data();
      return { user1: chatData['user1'], user2: chatData['user2'] };
    }
    return null;
  }

/**
 * Retrieves the chat ID associated with a given message ID.
 * This function iterates through all chat documents in the Firestore
 * to find a chat containing a message with the specified message ID.
 * If such a message is found, the function returns the chat ID.
 */
  async getChatIdBasedOnMessageID(messageID: string) {
    const chatsRef = collection(this.firestore, 'chats');
    const chatSnapshot = await getDocs(chatsRef);
    for (const chatDoc of chatSnapshot.docs) {
      const messagesRef = collection(chatDoc.ref, 'messages');
      const messageSnapshot = await getDocs(messagesRef);
      if (messageSnapshot.docs.some(messageDoc => messageDoc.id === messageID)) {
        return chatDoc.id;
      }
    }
    return null;
  }

  /**
   * Configures the messenger UI to show a direct message conversation with the given user.
   * It first closes other UI elements, then sets the messenger service to open a chart
   * and assigns the given user to the messenger service. Finally, it calls the searchChat
   * function to retrieve the chat ID associated with a conversation with the given user.
   */
  configureMessenger(user: UserInterface) {
    this.closeUiElements();
    this.messengerService.openChannel = false;
    this.messengerService.openChart = true;
    this.messengerService.user = user;
    this.firebaseMessenger.searchChat(user);
  }

  /**
   * Closes all messenger UI elements to reset the UI before
   * opening a new conversation or channel.
   */
  closeUiElements(){
    this.threadService.showThreadSideNav = false;
    this.messengerService.showMessenger = false;
    this.messengerService.chartId = '';
    this.threadService.showThread = false;
  }

  /**
   * Resets the search bar and closes all messenger UI elements before
   * navigating to a channel and setting it as the currently focused chat.
   */
  goToChannel(channel: Channel) {
    this.clearSearchResults();
    this.closeUiElements();
    this.focusChannel(channel);
  }

  /**
   * Resets the messenger UI and sets the given channel as the currently focused chat.
   * It sets the channel ID, resets the messenger content, shows the channel in the messenger,
   * sets the channel as focused, retrieves the users of the channel, resets the message dates
   * and messages lists, unsubscribes from something, and finally opens the messenger.
   */
  focusChannel(channel: Channel) {
    this.threadService.channelID = channel.channelID;
    this.firestoreService.setAndGetCurrentlyFocusedChat(channel);
    this.firebaseMessenger.content = '';
    this.firebaseMessenger.answerContent = '';
    this.messengerService.showChannel(channel);
    channel.isFocus = true;
    this.threadService.getTheUsersOfChannel();
    this.messengerService.messageDates = [];
    this.firebaseMessenger.messages = [];
    this.firebaseMessenger.subSomethingList('noID', 'noCollection');
    this.messengerService.openMessenger = true;
  }

/**
 * Resets the search results and configures the messenger to focus on the specified user.
 */
  goToUser(user: UserInterface) {
    this.configureMessenger(user)
    this.clearSearchResults()
  }

  /**
   * Opens a thread in a channel and configures the messenger to focus on it.
   */
  async openThreadInChannel(message: any, messageId: any, channel: Channel) {
    this.goToChannel(channel);
    const messageToReplyTo = await this.getMessageInChannelById(messageId, channel);
    if (!messageToReplyTo) {
      console.error("Message to reply to not found!");
      return;
    }
    this.scrollToMessage(messageId);
    this.openedThreadConfig(message, messageToReplyTo);
  }

  /**
   * Scrolls to the message element with the given message ID in the '#messages-container' div.
   */
  scrollToMessage(messageID: string) {
    setTimeout(() => {
      const messagesContainer = document.querySelector('#messages-container');
      if (messagesContainer) {
        const messageElement = document.getElementById(`${messageID}`);
        if (messageElement) {
          messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }, 300);
  }

  /**
   * Configures the ThreadService to open a thread with the given message as the parent and the given messageToReplyTo as the message to reply to.
   * Waits 300 ms before setting the messageToReplyTo property and configuring the ThreadService to show the thread and the thread side nav.
   * Waits another 300 ms before scrolling to the message in the thread side nav.
   */
  openedThreadConfig(message: any, messageToReplyTo: any) {
    setTimeout(() => {
      if(window.innerWidth < 1550) {this.messengerService.openMessenger = false;}
      this.threadService.messageToReplyTo = message;
      this.threadService.showThread = true;
      this.threadService.showThreadSideNav = true;
      this.firebaseMessenger.subSomethingList(this.threadService.messageToReplyTo.messageID, 'answer');
      this.threadService.messageToReplyTo = messageToReplyTo;
    }, 300);
    setTimeout(() => {
      this.scrollToThreadMessage(message.content)
    }, 600);
  }

  /**
   * Scrolls to the message element with the given message content in the '.threadContent' div.
   */
  scrollToThreadMessage(messageContent: any) {
    const messagesContainer = document.getElementsByClassName('threadContent');
    if (messagesContainer) {
      const messageElement = document.getElementById(`${messageContent}`);
      if (messageElement) {
        messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }

/**
 * Navigates to a specific message within a channel by its message ID.
 * First, it clears the current search results, then navigates to the specified channel.
 * After a short delay, it scrolls to the message with the given message ID.
 */
  goToMessageInChannel(messageID: string, channel: Channel) {
    this.clearSearchResults();
    this.goToChannel(channel);
    setTimeout(() => {
      this.scrollToMessage(messageID);
    }, 100);
  }

/**
 * Fetches a specific message from a channel by its message ID.
 * This function retrieves a message document from the Firestore database using the provided 
 * message ID and channel. If a message with the given ID exists in the specified channel, 
 * it returns the message data as a Message object. If no such message exists, it returns null.
 */
  async getMessageInChannelById(messageId: string, channel: Channel) {
    const messageRef = doc(this.firestore, `channels/${channel.channelID}/messages/${messageId}`);
    const snapshot = await getDoc(messageRef);
    if (snapshot.exists()) {
      return snapshot.data() as Message;
    } else {
      return null;
    }
  }
}
