import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { FirebaseMessengerService } from '../../services/firebase-services/firebase-messenger.service';
import { MessengerService } from '../../services/messenger-service/messenger.service';
import { ThreadService } from '../../services/thread-service/thread.service';
import { CommonModule } from '@angular/common';
import { AuthserviceService } from '../../../landing-page/services/authservice.service';
import { collection, doc, Firestore, onSnapshot } from '@angular/fire/firestore';
import { ReactionInterface } from '../../interfaces/reaction-interface';
import { query, where, } from 'firebase/firestore';
import { Message } from '../../../models/message.class';
import { last } from 'rxjs';

@Component({
  selector: 'app-emoji-board',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './emoji-board.component.html',
  styleUrl: './emoji-board.component.scss'
})
export class EmojiBoardComponent {
  authService = inject(AuthserviceService);
  firestore = inject(Firestore);
  firebaseMessenger = inject(FirebaseMessengerService);
  messengerService = inject(MessengerService);
  threadService = inject(ThreadService);

  @Input() message = new Message;
  @Input() binding: any;
  @Output() callFunction = new EventEmitter<any>();

  normalEmojis: string[] = [
    '😀', '😁', '😂', '🤣', '😃', '😄', '😅', '😆', '😉', '😊',
    '😋', '😎', '😍', '😗', '😙', '🙂', '🤗', '🤔', '😐', '😑',
    '😶', '🙄', '😏', '😣', '😥', '😮', '🤐', '😯', '😪', '😫',
    '😴', '😌', '😜', '🤤', '😛', '🤑', '😲', '🙃', '😷', '🤒',
    '🤕', '🤧', '😵', '🤯', '😤', '😭', '😢', '😨'
  ];
  workEmojis: string[] = [
    '💼', '📁', '📅', '🖥️', '📊', '📈', '📉', '📝', '💻', '🖱️',
    '📋', '📌', '🖇️', '📄', '✏️', '📤', '📥', '📧', '📞', '📡',
    '🔒', '🔓', '🗑️', '🧾', '📆', '🏢', '🏛️'
  ];
  activeBoard: string = 'normal';
  selectedEmoji: string | null = null;
  reactionContent: string;
  reaction: ReactionInterface[] = [];
  findReactionWithContent = false;


  setRectionObject(element: any, id: string) {
    return {
      reactionID: id || '',
      content: element.content || '',
      senderIDs: element.senderIDs || '',
      senderNames: element.senderNames || '',
      messageID: this.message.messageID || '',
      latestReactionTime: element.latestReactionTime || '',
    }
  }


  searchReaction(messageID: string, reactionContent: string, userID: string) {
    let messegeRef = query(collection(this.firestore, `${this.firebaseMessenger.checkCollectionChatOrChannel()}/${this.firebaseMessenger.checkDocChatIDOrChannelID()}/messages/${messageID}/reactions`), where('senderIDs', 'not-in', [userID]), where('content', '==', reactionContent));
    return onSnapshot(messegeRef, (list) => {
      list.forEach(element => {
        this.findReactionWithContent = true;
        this.reaction = [];
        this.reaction.push(this.setRectionObject(element.data(), element.id));
      })
    });
  }


  /**
   * We select the emoji and put it in the textarea
   * @param emoji - which emoij is choosed
   * @param inputField - the textarea that we put the emoji in
   */
  selectEmoji(emoji: string, inputField: HTMLTextAreaElement): void {
    this.selectedEmoji = emoji;
    const start = inputField.selectionStart ?? 0;
    const end = inputField.selectionEnd ?? 0;
    this.controllWhichBinding(start, emoji, end)
    if (this.binding.name == 'textareaMessenger' || this.binding.name == 'textareaThread') {
      setTimeout(() => {
        inputField.selectionStart = inputField.selectionEnd = start + emoji.length;
        inputField.focus();
      }, 0);
    }
    this.callFunction.emit();
  }


  controllWhichBinding(start: number, emoji: string, end: number) {
    if (this.binding.name == 'textareaMessenger') {
      this.firebaseMessenger.content = this.firebaseMessenger.content.slice(0, start) + emoji + this.firebaseMessenger.content.slice(end);
    } if (this.binding.name == 'textareaThread') {
      this.firebaseMessenger.answerContent = this.firebaseMessenger.answerContent.slice(0, start) + emoji + this.firebaseMessenger.answerContent.slice(end);
    } if (this.binding == this.firebaseMessenger.reaktionContent) {
      this.addEmojiToReaction(start, emoji, end);
    } if (this.binding.name == 'textareaEdit') {
      this.messengerService.editMessageContent = this.messengerService.editMessageContent.slice(0, start) + emoji + this.messengerService.editMessageContent.slice(end);
    }
  }


  addEmojiToReaction(start: number, emoji: string, end: number) {
    this.findReactionWithContent = false;
    this.firebaseMessenger.reactions = [];
    this.firebaseMessenger.reaktionContent = '';
    this.firebaseMessenger.reaktionContent = this.firebaseMessenger.reaktionContent.slice(0, start) + emoji + this.firebaseMessenger.reaktionContent.slice(end);
    this.searchReaction(this.message.messageID, this.firebaseMessenger.reaktionContent, this.authService.currentUserSig()?.userID ?? '');
    setTimeout(() => {
      this.checkIfEmojiIsAlreadyExist();
    }, 50);
  }


  checkIfEmojiIsAlreadyExist() {
    if (this.findReactionWithContent) {
      if (!this.reaction[0].senderIDs.includes(this.authService.currentUserSig()?.userID ?? '')) {
        this.reaction[0].senderIDs.push(this.authService.currentUserSig()?.userID || '');
        this.reaction[0].senderNames.push(this.authService.currentUserSig()?.username || '');
        this.firebaseMessenger.updateSomethingAtMessage(this.reaction[0].messageID, 'reaction', this.reaction[0].reactionID, this.reaction[0]);
      }
    } else {
      this.firebaseMessenger.createReaktion(this.message.messageID, 'reaction');
    }
  }


  /**
   * We change the category of the emoijs
   * @param board - which array we use (work or normal)
   */
  switchBoard(board: string): void {
    this.activeBoard = board;
  }
}
