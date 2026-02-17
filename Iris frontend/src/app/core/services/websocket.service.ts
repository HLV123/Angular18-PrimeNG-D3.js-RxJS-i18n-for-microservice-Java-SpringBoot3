import { Injectable, signal } from '@angular/core';
import { Observable, Subject, timer, EMPTY } from 'rxjs';
import { switchMap, retryWhen, delay } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class WebSocketService {
  private ws: WebSocket | null = null;
  private messages$ = new Subject<any>();
  connected = signal(false);

  connect(channel: string): Observable<any> {
    const url = `${environment.wsUrl}/${channel}`;
    this.ws = new WebSocket(url);
    this.ws.onopen = () => this.connected.set(true);
    this.ws.onclose = () => { this.connected.set(false); setTimeout(() => this.connect(channel), 5000); };
    this.ws.onmessage = (event) => this.messages$.next(JSON.parse(event.data));
    this.ws.onerror = () => this.connected.set(false);
    return this.messages$.asObservable();
  }

  send(data: any) { if (this.ws?.readyState === WebSocket.OPEN) this.ws.send(JSON.stringify(data)); }
  disconnect() { this.ws?.close(); this.ws = null; this.connected.set(false); }
}