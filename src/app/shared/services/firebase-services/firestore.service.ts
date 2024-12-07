import { inject, Injectable } from '@angular/core';
import { UserInterface } from '../../../landing-page/interfaces/userinterface';
import { addDoc, collection, deleteDoc, doc, Firestore, getDoc, onSnapshot, QuerySnapshot, updateDoc } from '@angular/fire/firestore';
import { Channel } from '../../interfaces/channel';
import { BehaviorSubject } from 'rxjs';
import { AuthserviceService } from '../../../landing-page/services/authservice.service';

type EntityTypes = UserInterface | Channel;

/**
 * Service for managing Firestore operations, including creating, updating, deleting,
 * and listening to changes in Firestore collections and documents.
 */
@Injectable({
  providedIn: 'root'
})
export class FirestoreService {

  firestore: Firestore = inject(Firestore);
  authService: AuthserviceService = inject(AuthserviceService);

  userList: UserInterface[] = [];
  userList$ = new BehaviorSubject<UserInterface[]>([]);

  channelList: Channel[] = [];
  channelList$ = new BehaviorSubject<Channel[]>([]);

  unsubList!: () => void;

  currentlyFocusedChat: EntityTypes;

  constructor() { }

  /**
   * Sets the currently focused chat entity and returns it.
   * @param {EntityTypes} obj - The entity to focus on.
   */
  setAndGetCurrentlyFocusedChat(obj: EntityTypes) {
    this.currentlyFocusedChat = obj;
  }

  /**
   * Starts a Firestore snapshot listener for the specified collection ID.
   * Depending on the collection ID ('users' or 'channels'), this method calls the appropriate snapshot handler.
   * @param {string} collId - The collection ID to listen to (e.g., 'users' or 'channels').
   */
  startSnapshot(collId: string) {
    if (collId === 'users') this.startUserSnapshot(collId);
    if (collId === 'channels') this.startChannelSnapshot(collId);
  }

  /**
   * Sets up a Firestore snapshot listener for the 'users' collection and updates the `userList$` observable.
   * It filters out unwanted users, sorts the remaining users by username, and ensures that the current user
   * is always at the top of the list.
   * @param {string} collId - The collection ID to listen to (typically 'users').
   */
  startUserSnapshot(collId: string) {
    this.unsubList = onSnapshot(this.getCollectionRef(collId), (snapshot) => {
      this.userList = [];

      this.extractUsersFromSnapshot(snapshot, this.userList);
      let filteredUserList = this.filterUnwantedUsers(this.userList);
      this.setUserIDsToGlobalChannel(this.getUserIDs(filteredUserList));
      this.sortAndPrioritizeCurrentUser(filteredUserList);
      this.userList$.next(filteredUserList);
    });
  }

  /**
   * Extracts users from a Firestore snapshot and adds them to the provided list.
   * @param {QuerySnapshot} snapshot - The Firestore snapshot containing user documents.
   * @param {UserInterface[]} userList - The array to populate with extracted users.
   */
  extractUsersFromSnapshot(snapshot: QuerySnapshot, userList: UserInterface[]): void {
    snapshot.forEach(doc => {
      let userObj = this.setDummyObject(doc.data() as UserInterface, doc.id) as UserInterface;
      userList.push(userObj);
    });
  }

  /**
   * Filters out unwanted users based on username and email criteria.
   * @param {UserInterface[]} userList - The full list of users to filter.
   * @returns {UserInterface[]} - The filtered list of users.
   */
  filterUnwantedUsers(userList: UserInterface[]): UserInterface[] {
    return userList.filter(user => user.username !== 'Neuer Gast' && user.email !== 'gast@gast.de');
  }

  /**
   * Sorts users alphabetically by username and ensures that the current user is placed at the top of the list.
   * @param {UserInterface[]} userList - The list of users to sort.
   */
  sortAndPrioritizeCurrentUser(userList: UserInterface[]): void {
    let currentUserData = this.authService.currentUserSig();
    let currentUser = currentUserData ? currentUserData.username : null;

    userList.sort((a, b) => a.username.localeCompare(b.username));

    if (currentUser && currentUser !== 'Neuer Gast' || currentUserData?.email !== 'gast@gast.de') {
      let currentUserIndex = userList.findIndex(user => user.username === currentUser);
      if (currentUserIndex > -1) {
        let [currentUserObj] = userList.splice(currentUserIndex, 1);
        userList.unshift(currentUserObj);
      }
    }
  }

  /**
   * Sets up a snapshot listener for the 'channels' collection and updates the `channelList$` observable.
   * Only channels that include the current user's ID or have the title "Allgemein" are shown.
   * The "Allgemein" channel is always shown at the top, and the rest are sorted alphabetically by title.
   * @param {string} collId - The collection ID to listen to (typically 'channels').
   */
  startChannelSnapshot(collId: string) {
    this.unsubList = onSnapshot(this.getCollectionRef(collId), (snapshot) => {
      this.channelList = [];

      this.extractChannelsFromSnapshot(snapshot, this.channelList);
      let filteredChannelList = this.filterChannelsForCurrentUser(this.channelList);
      this.sortAndPrioritizeGeneralChannel(filteredChannelList);
      this.channelList$.next(filteredChannelList);
    });
  }

  setUserIDsToGlobalChannel(userIDs: string[]) {
    let generalChannel = this.channelList.find(channel => channel.title === 'Allgemein');
    if (generalChannel) {
      this.updateDoc('channels', generalChannel.channelID!, { userIDs: userIDs });
    }
  }

  getUserIDs(list: UserInterface[]): string[] {
    return list.map(user => user.userID);
  }

  /**
   * Extracts channels from a Firestore snapshot and adds them to the provided list.
   * @param {QuerySnapshot} snapshot - The Firestore snapshot containing channel documents.
   * @param {Channel[]} channelList - The array to populate with extracted channels.
   */
  extractChannelsFromSnapshot(snapshot: QuerySnapshot, channelList: Channel[]): void {
    snapshot.forEach(doc => {
      let channelObj = this.setDummyObject(doc.data() as Channel, doc.id) as Channel;
      channelList.push(channelObj);
    });
  }

  /**
   * Filters channels for the current user, including only those channels the user is a part of 
   * or the channel with the title "Allgemein".
   * @param {Channel[]} channelList - The full list of channels to filter.
   * @returns {Channel[]} - The filtered list of channels for the current user.
   */
  filterChannelsForCurrentUser(channelList: Channel[]): Channel[] {
    let currentUserData = this.authService.currentUserSig();
    let currentUserId = currentUserData ? currentUserData.userID : null;

    if (currentUserId) {
      return channelList.filter(channel =>
        channel.userIDs.includes(currentUserId) || channel.title === 'Allgemein'
      );
    }
    return [];
  }

  /**
   * Sorts channels alphabetically by title, but ensures the "Allgemein" channel is always at the top.
   * @param {Channel[]} channelList - The list of channels to sort.
   */
  sortAndPrioritizeGeneralChannel(channelList: Channel[]): void {
    channelList.sort((a, b) => a.title.localeCompare(b.title));
    let generalChannelIndex = channelList.findIndex(channel => channel.title === 'Allgemein');
    if (generalChannelIndex > 0) {
      let [generalChannel] = channelList.splice(generalChannelIndex, 1);
      channelList.unshift(generalChannel);
    }
  }

  /**
   * Stops the currently active Firestore snapshot listener, if one exists.
   */
  stopSnapshot() {
    if (this.unsubList) {
      this.unsubList();
    }
  }

  /**
   * Adds a new document to the specified Firestore collection.
   * @param {EntityTypes} obj - The entity to be added (either a `UserInterface` or a `Channel` object).
   * @param {string} collId - The collection ID to add the document to.
   */
  async addDoc(obj: EntityTypes, collId: string) {
    await addDoc(this.getCollectionRef(collId), obj)
      .catch(err => console.error(err));
  }

  /**
   * Deletes a document from a specified Firestore collection.
   * @param {string} collId - The collection ID where the document is located.
   * @param {string} docId - The ID of the document to be deleted.
   */
  async deleteDoc(collId: string, docId: string) {
    await deleteDoc(doc(this.firestore, collId, docId));
  }

  /**
   * Creates a dummy object for either a user or a channel based on the provided entity type.
   * @param {EntityTypes} obj - The original entity to create a dummy from.
   * @param {string} id - The ID to be assigned to the dummy object.
   * @returns {EntityTypes} - The newly created dummy entity.
   * @throws Will throw an error if the entity type is not recognized.
   */
  setDummyObject(obj: EntityTypes, id: string): EntityTypes {
    if (this.isUserInterface(obj)) return this.getUserDummyObject(obj, id);
    if (this.isChannel(obj)) return this.getChannelDummyObject(obj, id);

    throw new Error('Invalid object type');
  }

  /**
   * Checks if the given entity is of type `UserInterface`.
   * @param {EntityTypes} obj - The entity to check.
   * @returns {obj is UserInterface} - True if the entity is a `UserInterface`.
   */
  isUserInterface(obj: EntityTypes): obj is UserInterface {
    return 'userID' in obj;
  }

  /**
   * Checks if the given entity is of type `Channel`.
   * @param {EntityTypes} obj - The entity to check.
   * @returns {obj is Channel} - True if the entity is a `Channel`.
   */
  isChannel(obj: EntityTypes): obj is Channel {
    return 'createdBy' in obj;
  }

  /**
   * Creates a new dummy user object based on the provided `UserInterface` and ID.
   * @param {UserInterface} obj - The original user object.
   * @param {string} id - The ID to be assigned to the dummy object.
   * @returns {UserInterface} - The newly created dummy user object.
   */
  getUserDummyObject(obj: UserInterface, id: string): UserInterface {
    return {
      userID: id,
      password: obj.password,
      email: obj.email,
      username: obj.username,
      avatar: obj.avatar,
      userStatus: obj.userStatus,
      isFocus: obj.isFocus,
    };
  }

  /**
   * Creates a new dummy channel object based on the provided `Channel` and ID.
   * @param {Channel} obj - The original channel object.
   * @param {string} id - The ID to be assigned to the dummy object.
   * @returns {Channel} - The newly created dummy channel object.
   */
  getChannelDummyObject(obj: Channel, id: string): Channel {
    return {
      channelID: id,
      title: obj.title,
      description: obj.description,
      createdBy: obj.createdBy,
      isFocus: obj.isFocus,
      userIDs: obj.userIDs,
      messages: obj.messages,
    };
  }

  /**
   * Retrieves a document from Firestore based on its collection ID and document ID.
   * @param {string} collId - The ID of the collection containing the document.
   * @param {string} docId - The ID of the document to retrieve.
   * @returns {Promise<DocumentSnapshot<any>>} - A promise resolving to the document snapshot retrieved from Firestore.
   */
  async getObjectById(collId: string, docId: string) {
    let docSnapshot = await getDoc(this.getSingleDocRef(collId, docId));
    return docSnapshot.data();
  }

  /**
   * Updates an existing Firestore document within a specified collection with the provided data.
   * @param {string} collId - The ID of the collection containing the document to update.
   * @param {string} docId - The ID of the document to update.
   * @param {Object} updatedDoc - The new data to update the document with.
   * @returns {Promise<void>} - A promise that resolves once the document is updated.
   */
  async updateDoc(collId: string, docId: string, updatedDoc: {}) {
    await updateDoc(this.getSingleDocRef(collId, docId), updatedDoc);
  }

  /**
   * Returns a reference to a Firestore collection based on its ID.
   * @param {string} collId - The ID of the collection.
   * @returns {CollectionReference} - The Firestore collection reference.
   */
  getCollectionRef(collId: string) {
    return collection(this.firestore, collId);
  }

  /**
   * Returns a reference to a specific document within a specified collection.
   * @param {string} collId - The name of the collection in Firestore.
   * @param {string} docId - The ID of the document within the specified collection.
   * @returns {DocumentReference} - The Firestore document reference.
   */
  getSingleDocRef(collId: string, docId: string) {
    return doc(collection(this.firestore, collId), docId);
  }
}
