import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-notification-center',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="notif-trigger" (click)="open.set(!open())">
      <i class="pi pi-bell"></i>
      @if(unreadCount() > 0){ <span class="badge">{{ unreadCount() }}</span> }
    </div>
    @if(open()){
      <div class="notif-backdrop" (click)="open.set(false)"></div>
      <div class="notif-panel">
        <div class="np-header"><h3>Notifications</h3><button class="mark-btn" (click)="markAllRead()">Mark all read</button></div>
        <div class="np-tabs">
          @for(t of ['All','Alerts','Tasks','System'];track t){
            <button [class.active]="tab()===t" (click)="tab.set(t)">{{ t }}</button>
          }
        </div>
        <div class="np-list">
          @for(n of filtered();track $index){
            <div class="np-item" [class.unread]="!n.read" (click)="n.read=true;updateCount()">
              <div class="np-icon" [style.background]="n.color+'15'" [style.color]="n.color"><i [class]="n.icon"></i></div>
              <div class="np-body"><strong>{{ n.title }}</strong><p>{{ n.msg }}</p><span>{{ n.time }}</span></div>
            </div>
          }
          @if(filtered().length===0){<div style="padding:32px;text-align:center;color:#94a3b8;font-size:13px">No notifications</div>}
        </div>
      </div>
    }
  `,
  styles: [`
    .notif-trigger{position:relative;width:36px;height:36px;border-radius:10px;background:#f1f5f9;display:flex;align-items:center;justify-content:center;cursor:pointer}.notif-trigger:hover{background:#e2e8f0}.notif-trigger i{font-size:16px;color:#475569}
    .badge{position:absolute;top:-2px;right:-2px;min-width:16px;height:16px;border-radius:50%;background:#ef4444;color:#fff;font-size:9px;font-weight:700;display:flex;align-items:center;justify-content:center;padding:0 3px}
    .notif-backdrop{position:fixed;inset:0;z-index:290}
    .notif-panel{position:absolute;top:50px;right:0;width:380px;max-height:480px;background:#fff;border-radius:14px;box-shadow:0 10px 40px rgba(0,0,0,.15);overflow:hidden;z-index:300;display:flex;flex-direction:column}
    .np-header{display:flex;justify-content:space-between;align-items:center;padding:14px 18px;border-bottom:1px solid #f1f5f9}.np-header h3{font-size:15px;font-weight:700;margin:0}.mark-btn{background:none;border:none;color:#2563eb;font-size:12px;cursor:pointer;font-weight:600}
    .np-tabs{display:flex;gap:2px;padding:6px 14px;border-bottom:1px solid #f1f5f9}.np-tabs button{padding:5px 10px;border:none;background:none;font-size:11px;font-weight:500;color:#64748b;cursor:pointer;border-radius:6px}.np-tabs button.active{background:#1e3a8a;color:#fff}
    .np-list{overflow-y:auto;max-height:350px}
    .np-item{display:flex;gap:10px;padding:12px 18px;border-bottom:1px solid #f8fafc;cursor:pointer;transition:background .15s}.np-item:hover{background:#f8fafc}.np-item.unread{background:#eff6ff}
    .np-icon{width:32px;height:32px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0}
    .np-body{flex:1;min-width:0}.np-body strong{font-size:12px;display:block;margin-bottom:2px}.np-body p{font-size:11px;color:#64748b;margin:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.np-body span{font-size:10px;color:#94a3b8}
  `]
})
export class NotificationCenterComponent {
  open = signal(false);
  tab = signal('All');
  unreadCount = signal(5);
  notifications = [
    {type:'Alerts',title:'Critical Risk Alert',msg:'RSK-2026-0042 exceeded threshold',time:'2m ago',icon:'pi pi-exclamation-triangle',color:'#ef4444',read:false},
    {type:'Alerts',title:'New Fraud Alert',msg:'High-value transaction flagged - AL-2026-0891',time:'15m ago',icon:'pi pi-shield',color:'#f59e0b',read:false},
    {type:'Tasks',title:'Assessment Due',msg:'Q1 Risk Assessment needs your approval',time:'1h ago',icon:'pi pi-clock',color:'#3b82f6',read:false},
    {type:'Tasks',title:'SAR Filing Reminder',msg:'2 SARs pending submission before deadline',time:'2h ago',icon:'pi pi-file',color:'#8b5cf6',read:false},
    {type:'System',title:'Model Drift Detected',msg:'AML Risk Scorer drift score exceeds 0.05',time:'3h ago',icon:'pi pi-chart-line',color:'#f59e0b',read:false},
    {type:'Alerts',title:'Case Escalated',msg:'CASE-2026-0089 escalated to senior analyst',time:'4h ago',icon:'pi pi-arrow-up',color:'#3b82f6',read:true},
    {type:'System',title:'Backup Complete',msg:'Nightly backup completed successfully',time:'8h ago',icon:'pi pi-check-circle',color:'#22c55e',read:true},
    {type:'Tasks',title:'Training Assigned',msg:'AML Compliance Training due by Feb 28',time:'1d ago',icon:'pi pi-book',color:'#8b5cf6',read:true},
  ];
  filtered = computed(() => {
    const t = this.tab();
    return t === 'All' ? this.notifications : this.notifications.filter(n => n.type === t);
  });
  markAllRead() { this.notifications.forEach(n => n.read = true); this.unreadCount.set(0); }
  updateCount() { this.unreadCount.set(this.notifications.filter(n => !n.read).length); }
}
