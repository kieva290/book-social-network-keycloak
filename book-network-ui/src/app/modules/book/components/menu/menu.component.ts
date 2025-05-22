import {Component, OnDestroy, OnInit} from '@angular/core';
import {RouterLink} from '@angular/router';
import {KeycloakService} from '../../../../services/keycloak/keycloak.service';
import {ToastrService} from 'ngx-toastr';
import * as Stomp from 'stompjs';
import SockJS from 'sockjs-client';
import {Notification} from './notification';
import {NgForOf, NgIf} from '@angular/common';

@Component({
  selector: 'app-menu',
  imports: [
    RouterLink,
    NgForOf,
    NgIf
  ],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss'
})
export class MenuComponent implements OnInit, OnDestroy {

  socketClient: any = null;
  private notificationSubscription: any;
  unreadNotificationsCount = 0;
  notifications: Array<Notification> = [];

  constructor(
    private keycloakService: KeycloakService,
    private toastService: ToastrService
  ) {
  }

  ngOnInit() {
    this.navigationHandler();

    if (this.keycloakService.keycloak.tokenParsed?.sub) {
      let ws = new SockJS('http://localhost:8088/api/v1/ws');
      // initiate web-socket connection btw frontend, and backend
      this.socketClient = Stomp.over(ws);
      this.socketClient.connect({'Authorization': 'Bearer ' + this.keycloakService.keycloak.token}, () => {
        console.log('Connecting to web socket...');
        this.notificationSubscription = this.socketClient.subscribe(
          `/user/${this.keycloakService.keycloak.tokenParsed?.sub}/notifications`,
          (message: any) => {
            const notification = JSON.parse(message.body);
            if (notification) {
              this.notifications.unshift(notification);
              switch (notification.status) {
                case 'BORROWED':
                  this.toastService.info(notification.message, notification.bookTitle);
                  break;
                case 'RETURNED':
                  this.toastService.warning(notification.message, notification.bookTitle);
                  break;
                case 'RETURN_APPROVED':
                  this.toastService.success(notification.message, notification.bookTitle);
                  break;
              }
              this.unreadNotificationsCount++;
            }
          }, () => {
            console.error('Error while connecting to webSocket!');
          });
      });
    }
  }

  ngOnDestroy() {
    if (this.socketClient !== null) {
      this.socketClient.disconnect();
      this.notificationSubscription.unsubscribe();
      this.socketClient = null;
    }
  }

  private navigationHandler() {
    const linkColor = document.querySelectorAll('.nav-link');
    linkColor.forEach(link => {
      if (window.location.href.endsWith(link.getAttribute('href') || '')) {
        link.classList.add('active');
      }
      link.addEventListener('click', () => {
        linkColor.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
      });
    });
  }

  async logout() {
    await this.keycloakService.logout();
  }

  get username() {
    return this.keycloakService.keycloak.tokenParsed?.['given_name']
  }

}
