import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { FirebaseMessengerService } from '../../../services/firebase-services/firebase-messenger.service';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ThreadService } from '../../../services/thread-service/thread.service';
import { EmojiBoardComponent } from '../../emoji-board/emoji-board.component';
import { CommonModule } from '@angular/common';
import { MessengerService } from '../../../services/messenger-service/messenger.service';
import { MessageParserService } from '../../../services/message-parser.service';
import { Message } from '../../../../models/message.class';
import { ViewportService } from '../../../services/viewport.service';

@Component({
  selector: 'app-edit-message',
  standalone: true,
  imports: [
    MatIconModule,
    MatButtonModule,
    FormsModule,
    EmojiBoardComponent,
    CommonModule,
  ],
  templateUrl: './edit-message.component.html',
  styleUrl: './edit-message.component.scss'
})
export class EditMessageComponent implements OnInit {
  viewportService = inject(ViewportService);

  @Input() mentionedUsers: any[] = [];
  @Input() message = new Message;
  @Input() editAnswerMessage: boolean;
  @Input() sourceThread: boolean;
  @Output() closeEditMessage = new EventEmitter<boolean>();
  showEdit = false;
  showEmojiBoard = false;
  messageParser = inject(MessageParserService);
  messageText = '';
  messageItems: string[] = [];


  constructor(public firebase: FirebaseMessengerService, private threadService: ThreadService, public messengerService: MessengerService) {  
  }

/**
 * Angular lifecycle hook that is called after data-bound properties
 * of a directive are initialized. Invokes the getMessageText method
 * to parse and extract links and text from the current message content
 * when the component is initialized.
 */
  ngOnInit() {
    this.getMessageText();
  }

  /**
   * Parses the message content to extract links and text.
   *
   * Invokes the messageParser service to parse the message content and
   * extract links and text. It then calls the extractLinksAndText method
   * to process the parsed message content.
   */
  getMessageText() {
    const parsedMessage = this.messageParser.parseMessage(this.message.content);
    this.extractLinksAndText(parsedMessage);
  }

  /**
   * Extracts links and text from a parsed message content.
   *
   * Takes a parsed message content as input and uses a regular expression
   * to extract links and text. It processes each extracted link using the
   * processAnchorTag method and then concatenates the extracted text to form
   * the final message text.
   * @param text The parsed message content to extract links and text from.
   */
  extractLinksAndText(text: string) {
    const anchorTagRegex = /<a\s+[^>]+>(.*?)<\/a>/g;
    let match;
    let lastIndex = 0;
    let messageText = '';
    while ((match = anchorTagRegex.exec(text)) !== null) {
      messageText += text.substring(lastIndex, match.index);
      this.processAnchorTag(match[0]); 
      lastIndex = anchorTagRegex.lastIndex; 
    }
    this.messageText = messageText + text.substring(lastIndex).trim(); 
    this.messengerService.editMessageContent = this.messageText;
  }

  /**
   * Processes an anchor tag by extracting the image URL and its file extension.
   *
   * If the file extension is not a valid image type, it adds the anchor tag to the
   * message items array. Otherwise, it does nothing.
   * @param currentTag The anchor tag to process.
   */
  private processAnchorTag(currentTag: string) {
    const imageTagRegex = /<img\s+[^>]*src="([^"]+)"[^>]*>/g;
    const imageTagMatch = imageTagRegex.exec(currentTag);
    if (imageTagMatch) {
      const imageUrl = imageTagMatch[1];
      const fileExtension = (imageUrl.split('.').pop() || '').toLowerCase();
      if (!['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension)) {
        this.messageItems.push(currentTag);
      }
    } else {
      this.messageItems.push(currentTag);
    }
  }

  /**
   * Toggles the emoji board visibility.
   *
   * If the emoji board is currently not visible, it sets its visibility to true.
   * If the emoji board is currently visible, it sets its visibility to false.
   */
  closeOrOpenEmojisBoard() {
    if (!this.showEmojiBoard) {
      this.showEmojiBoard = true;
    } else {
      this.showEmojiBoard = false;
    }
  }

/**
 * Emits an event to close the edit message component.
 *
 * This function emits a boolean value indicating the visibility
 * state of the edit message component, which is used to close
 * the edit interface.
 */
  closeEdit() {
    this.closeEditMessage.emit(this.showEdit);
  }

  /**
   * Updates the message content with the edited text and images.
   *
   * This method is called when the user clicks the "Save" button in the edit
   * message interface. It takes the edited text and images and updates the
   * message content. If the message is an answer, it updates the answer message
   * content. If the message is not an answer, it updates the message content.
   * Finally, it closes the edit message interface.
   */
  checkWithMessageShouldUptade() {
    const imageTags = this.messageItems.map(item => item).join(' ');
    this.message.content = `${this.messengerService.editMessageContent} ${imageTags}`.trim();
    if (this.editAnswerMessage) {
      this.firebase.updateSomethingAtMessage(this.threadService.messageToReplyTo.messageID, 'answer', this.message.messageID, this.message)
        .catch(err => console.error('Error updating message answer:', err));
    } else {
      this.firebase.updateSomethingAtMessage('noID', 'noCollection', this.message.messageID, this.message)
        .catch(err => console.error('Error updating message:', err));
    }
    this.closeEdit();
  }

  /**
   * Deletes an image from the message items array.
   *
   * @param item The image string to delete from the message items array.
   */
  deleteImage(item: string) {
    const index = this.messageItems.indexOf(item);
    if (index > -1) {
      this.messageItems.splice(index, 1);
    }
  }
}
