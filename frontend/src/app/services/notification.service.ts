import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Notification {
  id: number;
  type: string;
  message: string;
  read: boolean;
  createdAt: string;
  actorUsername?: string;
  postId?: number;
  postTitle?: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private baseUrl = 'http://localhost:8080/api/notifications';

  constructor(private http: HttpClient) { }

  // Get unread notifications
  getUnreadNotifications(): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${this.baseUrl}/unread`);
  }

  // Mark notification as read
  markAsRead(id: number): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}/read`, {});
  }

  // Mark all as read
  markAllAsRead(): Observable<any> {
    return this.http.put(`${this.baseUrl}/read-all`, {});
  }
}
