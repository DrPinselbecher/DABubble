import { inject, Injectable, Injector } from '@angular/core';
import { collection, Firestore, getDocs, query, where } from '@angular/fire/firestore';
import { AuthserviceService } from '../../../landing-page/services/authservice.service';
import { FilterMessage } from '../../interfaces/filter-message';
import { ThreadService } from '../thread-service/thread.service';
import { UserInterface } from '../../../landing-page/interfaces/userinterface';
import { Subscription } from 'rxjs';
import { FirestoreService } from '../firebase-services/firestore.service';
import { _getShadowRoot } from '@angular/cdk/platform';
import { Channel } from '../../interfaces/channel';
import { MessageInterface } from '../../interfaces/message-interface';
import { Message } from '../../../models/message.class';
import { RedirectService } from '../redirect-service/redirect.service';

export interface ChannelWithMessages {
  channel: Channel;
  messages: MessageInterface[];
  answers: MessageInterface[];
}
@Injectable({
  providedIn: 'root'
})
export class SearchService {
  firestore = inject(Firestore);
  authService = inject(AuthserviceService);
  threadService = inject(ThreadService);
  firestoreService = inject(FirestoreService);
  messages: FilterMessage[] = [];
  threadMessages: FilterMessage[] = [];
  filteredThreads: FilterMessage[] = [];
  searchResults: FilterMessage[] = [];
  userListSubscription!: Subscription;
  userList: UserInterface[] = [];
  filteredUsers: UserInterface[] = [];
  unsubscribeMap = new Map<string, () => void>();
  channelListSubscription!: Subscription
  foundChannels: Channel[] = [];
  filteredChannels: Channel[] = [{
    createdBy: 'Entwickler',
    description: 'Der Allgemein-Channel ist zum Teilen von Meinungen und Feedback gedacht. Der Entwickler freut sich über jede Nachricht – also schreib rein, was dir auf dem Herzen liegt (außer vielleicht dein Pizzarezept)',
    isFocus: false,
    messages: [],
    title: 'Allgemein',
    userIDs: [],
  }];
  secondUser = {} as UserInterface;
  madeQuery = false;
  filteredChannelsThreads: ChannelWithMessages[] = [];
  foundMessagesInChannels: ChannelWithMessages[] = [];
  filteredMessagesInChannels: ChannelWithMessages[] = [];
  _redirectService?: RedirectService;
  injector = inject(Injector);

  /**
   * Returns the RedirectService instance, which is used to redirect users to the
   * appropiate route based on the search query. If the instance is not yet created,
   * it will be created using the Injector.
   */
  get redirectService(): RedirectService {
    if (!this._redirectService) {
      this._redirectService = this.injector.get(RedirectService);
    }
    return this._redirectService;
  }

/**
 * Initializes the SearchService by subscribing to the user and channel lists from the FirestoreService.
 * 
 * Subscribes to the `userList$` observable to keep the `userList` updated with the latest user data.
 * Subscribes to the `channelList$` observable to update `foundChannels` with the current channel data.
 */
  constructor() {
    this.userListSubscription = this.firestoreService.userList$.subscribe(user => {
      this.userList = user;
    });
    this.channelListSubscription = this.firestoreService.channelList$.subscribe(channels => {
      this.foundChannels = channels;
    })
  }

  /**
   * Fetches all messages from all chats the current user is in.
   * Queries the 'chats' collection and for each chat document, fetches the messages from it.
   * The messages are stored in the `messages` field of the service.
   */
  async fetchAllMessages() {
    const currentUser = await this.getCurrentUser();
    if (!currentUser) return;
    const chatRef = collection(this.firestore, 'chats');
    const chatSnapshot = await getDocs(chatRef);
    this.messages = [];
    const fetchPromises = chatSnapshot.docs.map(chatDoc => this.fetchMessagesFromChat(chatDoc, currentUser));
    await Promise.all(fetchPromises);
  }

/**
 * Retrieves the current user's ID from the authentication service.
 */
  async getCurrentUser(): Promise<string | undefined> {
    let currentUser = this.authService.currentUserSig()?.userID;
    while (!currentUser) {
      await new Promise(resolve => setTimeout(resolve, 100));
      currentUser = this.authService.currentUserSig()?.userID;
    }
    return currentUser;
  }

  /**
   * Fetches all the messages from a given chat document and checks if the current user is one of the users in the chat.
   * If the user is one of the users, it fetches all the messages from the chat and adds it to the messages array..
   */
  async fetchMessagesFromChat(chatDoc: any, currentUser: string): Promise<void> {
    const chatData = chatDoc.data();
    const { user1, user2 } = chatData;
    if (user1 === currentUser || user2 === currentUser) {
      const messagesRef = collection(chatDoc.ref, 'messages');
      const messagesSnapshot = await getDocs(messagesRef);
      const fetchPromises = messagesSnapshot.docs.map(messageDoc =>
        this.extractMessageData(messageDoc)
      );
      await Promise.all(fetchPromises);
    }
  }

/**
 * Extracts message data from the provided Firestore document.
 */
  async extractMessageData(messageDoc: any): Promise<void> {
    if (messageDoc.exists()) {
      const messageData = messageDoc.data();
      const messageInfo: FilterMessage = this.setMessageData(messageData, messageDoc);
      this.messages.push(messageInfo);
      const answersRef = collection(messageDoc.ref, 'answers');
      const answersSnapshot = await getDocs(answersRef);
      if (!answersSnapshot.empty) {
        answersSnapshot.forEach(answerDoc => {
          const answerData = answerDoc.data();
          const answerInfo: FilterMessage = this.setAnswerData(answerData, messageDoc, messageData);
          this.threadMessages.push(answerInfo);
        });
      }
    }
  }

  /**
   * Sets the message data for a given message document.
   */
  setMessageData(messageData: any, messageDoc: any) {
    return {
      content: messageData['content'],
      senderName: messageData['senderName'],
      date: messageData['date'],
      messageID: messageDoc.id,
      senderID: messageData['senderID']
    };
  }

  /**
   * Sets the answer data for a given answer document.
   */
  setAnswerData(answerData: any, messageDoc: any, messageData: any) {
    return {
      content: answerData['content'],
      senderName: answerData['senderName'],
      date: answerData['date'],
      messageID: messageDoc.id,
      senderID: messageData
    };
  }

  /**
   * Unsubscribes all subscriptions stored in the unsubscribeMap.
   */
  unsubscribeAll() {
    this.unsubscribeMap.forEach((unsubscribe) => unsubscribe());
    this.unsubscribeMap.clear();
  }

/**
 * Searches for messages, users, channels, and threads based on the provided query.
 * Clears previous search results and updates the state of `madeQuery` based on the query's validity.
 * If the query is empty or consists only of whitespace, the function will clear previous search results
 * and set `madeQuery` to false. Otherwise, it filters channels, retrieves messages from found channels,
 * fetches all messages, and filters data based on the query, setting `madeQuery` to true.
 */
/******  7a5c1189-7e07-4d01-9858-a4cf1ac8fce6  *******/
  async search(query: string) {
    if (!query || !query.trim()) {
      this.redirectService.clearSearchResults();
      return;
    }
    this.redirectService.clearSearchResults();
    await this.filterChannels();
    await this.getMessagesForAllFoundChannels();
    await this.fetchAllMessages();
    await this.filterData(query);
    this.madeQuery = true;
  }

  /**
   * This function filters all data that is needed for the search result view for the 1-1 messages.
   */
  async filterData(query: string) {
    this.searchResults = this.messages.filter(message =>
      message.content.toLowerCase().includes(query.toLowerCase())
    );
    this.filteredThreads = this.threadMessages.filter(message =>
      message.content.toLowerCase().includes(query.toLowerCase())
    );
    this.filteredUsers = this.userList.filter(user =>
      user.username.toLowerCase().includes(query.toLowerCase())
    );
    this.filteredChannels = this.foundChannels.filter(channel =>
      channel.title.toLowerCase().includes(query.toLowerCase())
    );
    this.filterInChannel(query);
  }

/**
 * Filters messages and answers within found channels based on the given query.
 * Updates the `filteredMessagesInChannels` array to include only those channels where the messages or answers contain the query string.
 */
  filterInChannel(query: string) {
    this.filteredMessagesInChannels = this.foundMessagesInChannels
      .map(channelWithMessages => {
        const filteredMessages = channelWithMessages.messages.filter(message =>
          message.content?.toLowerCase().includes(query.toLowerCase())
        );
        const filteredAnswers = channelWithMessages.answers.filter(answer =>
          answer.content?.toLowerCase().includes(query.toLowerCase())
        );
        return {
          ...channelWithMessages,
          messages: filteredMessages,
          answers: filteredAnswers,
        };
      })
      .filter(
        channelWithMessages =>
          channelWithMessages.messages.length > 0 || channelWithMessages.answers.length > 0
      );
  }

  /**
   * Clears all arrays after a search query has been made
   */  
  clearArrays() {
    this.searchResults = [];
    this.filteredUsers = [];
    this.filteredThreads = [];
    this.filteredChannels = [];
    this.threadMessages = [];
    this.filteredChannelsThreads = [];
    this.filteredMessagesInChannels = [];
    this.foundMessagesInChannels = [];
  }

  /**
   * Filters the channels that were found in the channel search, and stores only the channels the current user is a part of in the `filteredChannels` array.
   */
  async filterChannels() {
    const userId = this.authService.currentUserSig()?.userID;
    this.foundChannels.forEach((channel) => {
      if (channel.userIDs.includes(userId!)) {
        this.filteredChannels.push(channel);
      }
    })
  }

  /**
   * Gets all messages and answers for all channels that were found in the channel search, and stores them in the `foundMessagesInChannels` array.
   */
  async getMessagesForAllFoundChannels() {
    if (!this.foundChannels || this.foundChannels.length === 0) {
      return;
    }
    const channelsWithMessages = await Promise.all(
      this.foundChannels.map(channel => this.getChannelWithMessages(channel))
    );
    this.foundMessagesInChannels = channelsWithMessages.filter(
      result => result !== null
    ) as ChannelWithMessages[];
  }

  /**
   * Returns a ChannelWithMessages object for the given channel.
   */
  async getChannelWithMessages(channel: Channel) {
    const channelDoc = await this.getChannelDocument(channel.title);
    if (!channelDoc) {
      return null;
    }
    const channelId = channelDoc.id;
    const channelData = { channelID: channelId, ...channelDoc.data() } as Channel;
    const messages = await this.getMessagesWithAnswers(channelId);
    return {
      channel: channelData,
      messages: messages.messagesWithAnswers,
      answers: messages.topLevelAnswers
    };
  }

  /**
   * Gets a channel document from the 'channels' collection by title.
   */
  async getChannelDocument(title: string) {
    const channelsCollection = collection(this.firestore, 'channels');
    const channelQuery = query(channelsCollection, where('title', '==', title));
    const channelSnapshot = await getDocs(channelQuery);
    if (channelSnapshot.empty) {
      return null;
    }
    return channelSnapshot.docs[0];
  }

  /**
   * Gets all messages with their answers from a channel.
   */
  async getMessagesWithAnswers(channelId: string) {
    const messagesCollection = collection(this.firestore, `channels/${channelId}/messages`);
    const messagesSnapshot = await getDocs(messagesCollection);
    const topLevelAnswers: MessageInterface[] = [];
    const messagesWithAnswers = await Promise.all(
      messagesSnapshot.docs.map(async messageDoc => {
        const messageData = this.getMessageData(messageDoc);
        const answers = await this.getAnswers(channelId, messageDoc.id);
        topLevelAnswers.push(...answers);
        return { ...messageData, answers };
      })
    );
    return { messagesWithAnswers, topLevelAnswers };
  }

  /**
   * Returns the data of a message document as a MessageInterface object
   */
  getMessageData(messageDoc: any): MessageInterface {
    return {
      content: messageDoc.data()['content'],
      isRead: messageDoc.data()['isRead'],
      senderID: messageDoc.data()['senderID'],
      senderName: messageDoc.data()['senderName'],
      senderAvatar: messageDoc.data()['senderAvatar'],
      date: messageDoc.data()['date'],
      messageID: messageDoc.id
    } as MessageInterface;
  }

  /**
   * Gets all answers to a message in a channel.
   */
  async getAnswers(channelId: string, messageId: string): Promise<MessageInterface[]> {
    const answersCollection = collection(
      this.firestore,
      `channels/${channelId}/messages/${messageId}/answers`
    );
    const answersSnapshot = await getDocs(answersCollection);
    return answersSnapshot.docs.map(answerDoc => ({
      content: answerDoc.data()['content'],
      senderID: answerDoc.data()['senderID'],
      senderName: answerDoc.data()['senderName'],
      senderAvatar: answerDoc.data()['senderAvatar'],
      date: answerDoc.data()['date'],
      messageID: messageId
    })) as MessageInterface[];
  }

  /**
   * Clears all search results and resets the arrays.
   */
  clearSearchResults() {
    setTimeout(() => {
      this.clearArrays();
      this.unsubscribeAll();
      this.threadService.showThreadSideNav = false;
      this.threadService.showThread = false;
      this.threadService.messageToReplyTo = new Message
        ();
      this.madeQuery = false;
    }, 50);
  }
}