import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MessageParserService {

  constructor() { }
/**
 * Parses a message string to replace file links with HTML elements.
 * 
 * This function identifies patterns in the message string where a file
 * link is specified in the format `[File: fileName](url)`. It replaces
 * each occurrence with a HTML `<div>` element containing an `<img>` tag
 * for the file thumbnail and an `<a>` tag linking to the file URL.
 * 
 * @param message - The message string containing file links in markdown format.
 * @returns The message string with file links replaced by HTML elements.
 */
  parseMessage(message: string): string {
    const regex = /\[File: (.*?)\]\((https?:\/\/[^\s]+)\)/g;
    return message.replace(regex, (match, fileName, url) => {
        return `<div>
                    <img src="${url}" onclick="viewFile(filename) alt="${fileName}" width="48px" height="48px"/><br/>
                    <a href="${url}" target="_blank">${fileName}</a>
                </div>`;
    });
  }
}
