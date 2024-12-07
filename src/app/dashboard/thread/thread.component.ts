import { AfterViewInit, Component, ElementRef, inject, Input, ViewChild } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { FirebaseMessengerService } from '../../shared/services/firebase-services/firebase-messenger.service';
import { ThreadService } from '../../shared/services/thread-service/thread.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageComponent } from '../../shared/components/message/message.component';
import { MessengerService } from '../../shared/services/messenger-service/messenger.service';
import { TextareaComponent } from '../../shared/components/textarea/textarea.component';
import { MessageParserService } from '../../shared/services/message-parser.service';
import { ViewportService } from '../../shared/services/viewport.service';

@Component({
  selector: 'app-thread',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    MatCardModule,
    MatIconModule,
    MessageComponent,
    TextareaComponent,
  ],
  templateUrl: './thread.component.html',
  styleUrl: './thread.component.scss'
})
export class ThreadComponent implements AfterViewInit {
  viewportService = inject(ViewportService)
  threadService = inject(ThreadService)
  firebaseMessenger = inject(FirebaseMessengerService)
  messengerService = inject(MessengerService)
  parser = inject(MessageParserService);


  @ViewChild('content') scrollContainer: ElementRef;
  @ViewChild('headerName') headerName: ElementRef;
  @ViewChild('messageToReplayName') messageToReplayName: ElementRef;

  resizeObserverHeader!: ResizeObserver;
  resizeObserverMessage!: ResizeObserver;
  messageToReplaySenderName: string;
  headerSenderName: string;
  windowWithMessage: number;
  windowWith: number;
  isTextWrapped = false;
  isTextWrappedMessage = false;
  checkTextSenderName = false;
  checkTextSenderNameMessage = false;
  reduceInteraktionBtn = true;
  editAnswerMessage = true;
  sourceThread = true;


  /**
   * Called when the component is initialized.
   * Sets the header sender name and the message to reply sender name to the sender name of the message to reply to.
   */
  ngOnInit() {
    this.headerSenderName = this.threadService.messageToReplyTo.senderName;
    this.messageToReplaySenderName = this.threadService.messageToReplyTo.senderName;
  }


  /**
   * After the view is initialized, this function assigns the scroll container
   * to the thread service and sets up resize observers to monitor changes in
   * the size of the elements referenced by `headerName` and `messageToReplayName`.
   * These observers trigger the `checkTextStatusHeader` and `checkTextStatus`
   * methods respectively to handle any necessary layout adjustments.
   */
  ngAfterViewInit() {
    this.threadService.scrollContainer = this.scrollContainer;
    this.resizeObserverMessage = new ResizeObserver(() => this.checkTextStatusHeader());
    this.resizeObserverHeader = new ResizeObserver(() => this.checkTextStatus());
    this.resizeObserverHeader.observe(this.headerName.nativeElement);
    this.resizeObserverMessage.observe(this.messageToReplayName.nativeElement);
  }


  /**
   * Closes the thread and resets the messenger component based on the window size.
   * If the window size is greater or equal to 1550px, the thread side nav is closed and the messenger component is reset.
   * If the window size is less than 1550px, the thread side nav is closed, the messenger component is reset and opened.
   */
  closeThread() {
    if (this.viewportService.width >= 1550) {
      this.threadService.showThreadSideNav = false;
      this.messengerService.showDate1Count = false;
    } else if (this.viewportService.width < 1550) {
      this.messengerService.messageDates = [];
      this.threadService.showThreadSideNav = false;
      this.messengerService.showDate1Count = false;
      this.messengerService.openMessenger = true;
      setTimeout(() => {
        this.messengerService.scrollToBottom(this.messengerService.scrollContainer);
      }, 10);
    }
  }


  /**
   * Checks if the text in the headline of the message to reply to is wrapped. If it is and the name has not yet been shortened, it shortens the name.
   * If the text is not wrapped and the name has been shortened, it sets the name back to the full name.
   * @private
   */
  checkTextStatusHeader() {
    const element = this.messageToReplayName.nativeElement;
    const lineHeight = parseFloat(getComputedStyle(element).lineHeight || '0');
    const headerNameHeight = element.offsetHeight;
    this.isTextWrappedMessage = headerNameHeight > lineHeight;
    if (this.isTextWrappedMessage && !this.checkTextSenderName) {
      this.getShortTextOfNameHeader();
    } else if (this.windowWithMessage < this.viewportService.width) {
      this.messageToReplaySenderName = this.threadService.messageToReplyTo.senderName;
      this.checkTextSenderNameMessage = false;
    }
  }


  /**
   * Sets the shortened name of the sender in the message to reply to 
   * if the text is wrapped. The shortened name is composed of the 
   * first word of the sender's name, followed by the first letter 
   * of the second word. Also saves the current width of the window 
   * and marks that the name has been shortened.
   * @private
   */
  getShortTextOfNameHeader() {
    this.windowWithMessage = this.viewportService.width;
    this.checkTextSenderNameMessage = true;
    this.messageToReplaySenderName = `${this.messengerService.getFirstWord(this.threadService.messageToReplyTo.senderName)}. ${this.messengerService.getSecondWordFirstLetter(this.threadService.messageToReplyTo.senderName)}`;
  }


  /**
   * Sets the shortened name of the sender in the thread headline 
   * if the text is wrapped. The shortened name is composed of the 
   * first word of the sender's name, followed by the first letter 
   * of the second word. Also saves the current width of the window 
   * and marks that the name has been shortened.
   * @private
   */
  getShortTextOfName() {
    this.windowWith = this.viewportService.width;
    this.checkTextSenderName = true;
    this.headerSenderName = `${this.messengerService.getFirstWord(this.threadService.messageToReplyTo.senderName)}. ${this.messengerService.getSecondWordFirstLetter(this.threadService.messageToReplyTo.senderName)}`;
  }


  /**
   * Checks if the text in the headline of a message is wrapped. If it is and the name has not yet been shortened, it shortens the name.
   * If the text is not wrapped and the name has been shortened, it sets the name back to the full name.
   * @private
   */
  checkTextStatus() {
    const element = this.headerName.nativeElement;
    const lineHeight = parseFloat(getComputedStyle(element).lineHeight || '0');
    const headerNameHeight = element.offsetHeight;
    this.isTextWrapped = headerNameHeight > lineHeight;
    if (this.isTextWrapped && !this.checkTextSenderName) {
      this.getShortTextOfName();
    } else if (this.windowWith < this.viewportService.width) {
      this.headerSenderName = this.threadService.messageToReplyTo.senderName;
      this.checkTextSenderName = false;
    }
  }


  /**
   * Lifecycle hook that is called when the component is destroyed.
   * Disconnects the ResizeObservers for the header and the message.
   * Also parses the message content for the message parser.
   */
  ngOnDestroy() {
    this.parser.parseMessage(this.firebaseMessenger.content);
    if (this.resizeObserverHeader) {
      this.resizeObserverHeader.disconnect();
    }
    if (this.resizeObserverMessage) {
      this.resizeObserverMessage.disconnect();
    }
  }


/**
 * Returns the parsed message content.
 *
 * If the component is in edit mode for answer messages, it returns the
 * original message content without any parsing. Otherwise, it invokes the
 * message parser service to parse the answer content from the firebase
 * messenger and returns the parsed result.
 *
 * @param message - The original message content.
 * @returns The parsed message content or the original message if in edit mode.
 */
  getParsedMessage(message: string): string {
    if (this.editAnswerMessage) {
      return message;
    }
    return this.parser.parseMessage(this.firebaseMessenger.answerContent);
  }


  /**
   * controlls how many answered message are under the main message
   * @returns - the number of answered messages
   */
  checkAnswerArrayLength():string {
    if (this.firebaseMessenger.answers.length > 1) {
      return `${this.firebaseMessenger.answers.length} Antworten`;
    } else if (this.firebaseMessenger.answers.length == 0) {
      return `Keine Antworten`;
    } else {
      return `${this.firebaseMessenger.answers.length} Antwort`;
    }
  }
}
