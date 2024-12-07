import { CommonModule } from '@angular/common';
import { Component, ViewChild, ElementRef, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MenuComponent } from './menu/menu.component';
import { AuthserviceService } from '../../landing-page/services/authservice.service';
import { UserInterface } from '../../landing-page/interfaces/userinterface';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import { SearchService } from '../../shared/services/search-service/search.service';
import { SearchResultComponent } from "../../shared/components/search-result/search-result.component";
import { ViewportService } from '../../shared/services/viewport.service';
import { MessengerService } from '../../shared/services/messenger-service/messenger.service';
import { ThreadService } from '../../shared/services/thread-service/thread.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    MatIconModule,
    MatMenuModule,
    MatCardModule,
    CommonModule,
    MenuComponent,
    SearchResultComponent
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  @ViewChild('searchInput') searchInput!: ElementRef;

  authService: AuthserviceService = inject(AuthserviceService)
  firestore: Firestore = inject(Firestore);
  searchService: SearchService = inject(SearchService);
  messengerService: MessengerService = inject(MessengerService);
  threadService: ThreadService = inject(ThreadService);
  viewportService: ViewportService = inject(ViewportService);

  userStatus: string = 'on';

  isMenuOpen: boolean = false;
  isProfileMenuOpen: boolean = false;
  isUnderMenuOpen: boolean = false;
  isOpenEditEditor: boolean = false;


  constructor() { }

  /**
   * Focuses the search input element to allow the user to type a search query.
   */
  focusSearchInput(): void {
    this.searchInput.nativeElement.focus();
  }

  /**
   * Handles the search functionality by passing the user's input to the SearchService.
   */
  onSearch(): void {
    this.searchService.search(this.searchInput.nativeElement.value);
  }

  /**
   * Closes the profile menu. Chooses the appropriate method to close either
   * the normal menu or the mobile menu based on the viewport size.
   */
  closeProfileMenu(): void {
    if (!this.isMobileMenuOpen()) {
      this.closeNormalMenu();
    } else {
      this.closeMobileMenu();
    }
  }

  /**
   * Closes the normal profile menu with a fade-out animation.
   */
  closeNormalMenu(): void {
    const menuElement = document.querySelector('.profile-menu-contain');
    if (this.isProfileMenuOpen) {
      menuElement?.classList.remove('open');
      menuElement?.classList.add('close');
      setTimeout(() => {
        this.isProfileMenuOpen = false;
      }, 120);
    }
    if (this.isUnderMenuOpen) {
      setTimeout(() => {
        this.isUnderMenuOpen = false;
      }, 120);
    }
    if (this.isOpenEditEditor) {
      setTimeout(() => {
        this.isOpenEditEditor = false;
      }, 120);
    }
  }

  /**
   * Closes the mobile profile menu with a slide-down animation.
   */
  closeMobileMenu(): void {
    const menuElement = document.querySelector('.cdk-overlay-pane');
    if (this.isProfileMenuOpen || this.isMenuOpen) {
      menuElement?.classList.remove('openMobileMenu');
      menuElement?.classList.add('closeMobileMenu');
      setTimeout(() => {
        this.isMenuOpen = false;
        this.isProfileMenuOpen = false;
      }, 120);
    }
    if (this.isUnderMenuOpen) {
      setTimeout(() => {
        this.isUnderMenuOpen = false;
        this.isMenuOpen = false;
      }, 120);
    }
    if (this.isOpenEditEditor) {
      setTimeout(() => {
        this.isOpenEditEditor = false;
        this.isMenuOpen = false;
      }, 120);
    }
  }

  /**
   * Opens the mobile profile menu with a slide-up animation.
   */
  openProfileMenu(): void {
    if (!this.isMobileMenuOpen()) return;

    let menuElement = document.querySelector('.cdk-overlay-pane');
    menuElement?.classList.remove('closeMobileMenu');
    menuElement?.classList.add('openMobileMenu');
    this.isMenuOpen = true;
  }

  /**
   * Updates the user's status.
   * @param newStatus - The new status of the user ('on', 'off', or 'busy').
   */
  onStatusChange(newStatus: string): void {
    this.userStatus = newStatus;
  }

  /**
   * Updates the state of the under menu.
   * @param isOpen - Whether the under menu is open.
   */
  onUnderMenuStatusChange(isOpen: boolean): void {
    this.isUnderMenuOpen = isOpen;
  }

  /**
   * Updates the state of the edit editor.
   * @param isOpen - Whether the edit editor is open.
   */
  onEditEditorChange(isOpen: boolean): void {
    this.isUnderMenuOpen = isOpen;
  }

  /**
   * Fetches the user status from Firestore for a given user ID.
   * @param uid - The user ID for which to fetch the status.
   * @returns A promise that resolves when the user status is updated.
   */
  async fetchUserStatus(uid: string): Promise<void> {
    const userDocRef = doc(this.firestore, `users/${uid}`);
    const userDocSnap = await getDoc(userDocRef);
    if (userDocSnap.exists()) {
      const userData = userDocSnap.data() as UserInterface;
      this.userStatus = userData.userStatus || 'on';
    }
  }

  /**
   * Lifecycle hook to initialize the component.
   * Subscribes to the user stream and updates the current user and status.
   */
  ngOnInit(): void {
    this.authService.user$.subscribe((user: any) => {
      if (user) {
        this.fetchUserStatus(user.uid);
        const newUser: UserInterface = this.setNewUser(user);
        this.authService.currentUserSig.set(newUser);
      } else {
        this.authService.setCurrentUser(null);
      }
    });
  }

  /**
   * Creates a new user object from the raw user data.
   * @param user - The raw user data from the authentication service.
   * @returns A formatted UserInterface object.
   */
  setNewUser(user: any): UserInterface {
    return {
      userID: user.uid,
      password: '',
      email: user.email,
      username: user.displayName,
      avatar: user.photoURL,
      isFocus: user.isFocus,
      userStatus: this.userStatus,
    };
  }

  /**
   * Checks if the current viewport size qualifies as mobile.
   * @returns True if the viewport width is less than or equal to 460px.
   */
  isMobileMenuOpen(): boolean {
    return this.viewportService.width <= 460;
  }

  messengerOrThreadIsOpen() {
    return this.messengerService.openMessenger || this.threadService.showThreadSideNav;
  }

  backToChannelUserList() {
    this.messengerService.closeEverthing();
  }
}