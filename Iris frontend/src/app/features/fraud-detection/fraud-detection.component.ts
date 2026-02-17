import { Component, OnInit, signal, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MockDataService } from '../../core/services/mock-data.service';
import { InteractionService } from '../../core/services/interaction.service';
import { FraudAlert, Transaction } from '../../core/models';
import * as d3 from 'd3';

@Component({
  selector: 'app-fraud-detection',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="page">
      <div class="page-header">
        <div><h1>Fraud Detection</h1><p>Real-time fraud monitoring, alerts & investigation</p></div>
        <div class="page-actions">
          <div class="live-indicator"><span class="pulse"></span> Live Monitoring</div>
          <button class="btn-outline" (click)="exportData()"><i class="pi pi-download"></i> Export</button>
        </div>
      </div>

      <div class="hero-section">
        <img src="assets/images/fraud-detection-bg.png" class="hero-img" />
        <div class="hero-ov"><h2>Fraud Detection & Prevention</h2><p>Real-time transaction monitoring powered by AI/ML</p></div>
      </div>

      <div class="kpi-row">
        <div class="kpi-card"><div class="kpi-icon blue"><i class="pi pi-bolt"></i></div><div><span class="kpi-val">24,567</span><span class="kpi-lbl">Transactions Today</span></div></div>
        <div class="kpi-card"><div class="kpi-icon red"><i class="pi pi-exclamation-triangle"></i></div><div><span class="kpi-val">{{ alerts.length }}</span><span class="kpi-lbl">Fraud Alerts</span></div></div>
        <div class="kpi-card"><div class="kpi-icon green"><i class="pi pi-dollar"></i></div><div><span class="kpi-val">$1.25M</span><span class="kpi-lbl">Fraud Prevented</span></div></div>
        <div class="kpi-card"><div class="kpi-icon orange"><i class="pi pi-percentage"></i></div><div><span class="kpi-val">12.5%</span><span class="kpi-lbl">False Positive Rate</span></div></div>
      </div>

      <div class="tabs">
        <button class="tab" [class.active]="activeTab() === 'alerts'" (click)="activeTab.set('alerts')">Fraud Alerts</button>
        <button class="tab" [class.active]="activeTab() === 'transactions'" (click)="activeTab.set('transactions')">Transactions</button>
        <button class="tab" [class.active]="activeTab() === 'rules'" (click)="activeTab.set('rules')">Fraud Rules</button>
        <button class="tab" [class.active]="activeTab() === 'blacklist'" (click)="activeTab.set('blacklist')">Blacklist</button>
        <button class="tab" [class.active]="activeTab() === 'watchlist'" (click)="activeTab.set('watchlist')">Watchlist</button>
      </div>

      <div class="filter-bar">
        <input type="text" placeholder="Search alerts..." class="search-input" [(ngModel)]="searchTerm" (input)="filterAlerts()" />
        <select [(ngModel)]="filterPriority" (change)="filterAlerts()" class="filter-select"><option value="">All Priorities</option><option value="HIGH">High</option><option value="MEDIUM">Medium</option><option value="LOW">Low</option></select>
        <span class="result-count">{{ filteredAlerts.length }} alerts</span>
      </div>

      <div class="data-table">
        <table>
          <thead><tr><th>Alert ID</th><th>Created</th><th>Customer</th><th>Type</th><th>Amount</th><th>Score</th><th>Priority</th><th>Status</th><th>Assigned</th><th>Actions</th></tr></thead>
          <tbody>
            @for (alert of filteredAlerts.slice(0, 15); track alert.id) {
              <tr (click)="selectedAlert.set(alert)" [class.selected]="selectedAlert()?.id === alert.id">
                <td class="mono">{{ alert.id }}</td>
                <td>{{ alert.createdAt | date:'short' }}</td>
                <td>{{ alert.customerName }}</td>
                <td><span class="type-tag">{{ alert.alertType }}</span></td>
                <td class="mono">{{ alert.amount | number }}</td>
                <td><span class="fraud-score" [style.color]="getScoreColor(alert.fraudScore)">{{ alert.fraudScore }}</span></td>
                <td><span class="priority-tag" [class]="'p-' + alert.priority.toLowerCase()">{{ alert.priority }}</span></td>
                <td><span class="status-pill">{{ alert.status }}</span></td>
                <td>{{ alert.assignedToName || 'Unassigned' }}</td>
                <td><button class="icon-btn" title="Investigate"><i class="pi pi-search"></i></button></td>
              </tr>
            }
          </tbody>
        </table>
      </div>


      @if(activeTab()==='rules'){
        <div style="display:flex;justify-content:space-between;margin-bottom:12px"><h3 style="font-size:16px;font-weight:700;margin:0">Fraud Rule Management</h3><button style="padding:8px 16px;background:linear-gradient(135deg,#1e3a8a,#2563eb);color:#fff;border:none;border-radius:10px;font-size:13px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:4px" (click)="interact.info('Creating new rule...')"><i class="pi pi-plus"></i> New Rule</button></div>
        <div class="data-table"><table><thead><tr><th>Rule ID</th><th>Name</th><th>Category</th><th>Condition</th><th>Action</th><th>Hit Rate</th><th>FP Rate</th><th>Status</th><th>Actions</th></tr></thead><tbody>
          <tr><td class="mono">FR-001</td><td><strong>High Value Txn</strong></td><td><span class="type-tag">Amount</span></td><td>Amount > $10,000</td><td><span class="priority-tag p-high">ALERT</span></td><td>5.7%</td><td>18%</td><td><span class="status-pill s-active">ACTIVE</span></td><td class="actions-cell"><button class="icon-btn" (click)="interact.info('Editing rule')"><i class="pi pi-pencil"></i></button><button class="icon-btn" (click)="interact.info('Testing rule')"><i class="pi pi-play"></i></button></td></tr>
          <tr><td class="mono">FR-002</td><td><strong>Velocity Check</strong></td><td><span class="type-tag">Velocity</span></td><td>> 5 txns / 10 min</td><td><span class="priority-tag p-critical">BLOCK</span></td><td>3.2%</td><td>12%</td><td><span class="status-pill s-active">ACTIVE</span></td><td class="actions-cell"><button class="icon-btn" (click)="interact.info('Editing rule')"><i class="pi pi-pencil"></i></button><button class="icon-btn" (click)="interact.info('Testing rule')"><i class="pi pi-play"></i></button></td></tr>
          <tr><td class="mono">FR-003</td><td><strong>Foreign Location</strong></td><td><span class="type-tag">Geographic</span></td><td>High-risk country</td><td><span class="priority-tag p-high">ALERT</span></td><td>8.5%</td><td>22%</td><td><span class="status-pill s-active">ACTIVE</span></td><td class="actions-cell"><button class="icon-btn" (click)="interact.info('Editing rule')"><i class="pi pi-pencil"></i></button><button class="icon-btn" (click)="interact.info('Testing rule')"><i class="pi pi-play"></i></button></td></tr>
          <tr><td class="mono">FR-004</td><td><strong>New Device + High Val</strong></td><td><span class="type-tag">Device</span></td><td>New device AND > $5K</td><td><span class="priority-tag p-medium">CHALLENGE</span></td><td>2.1%</td><td>25%</td><td><span class="status-pill s-review">TESTING</span></td><td class="actions-cell"><button class="icon-btn" (click)="interact.info('Editing rule')"><i class="pi pi-pencil"></i></button><button class="icon-btn" (click)="interact.info('Testing rule')"><i class="pi pi-play"></i></button></td></tr>
          <tr><td class="mono">FR-005</td><td><strong>CNP Anomaly</strong></td><td><span class="type-tag">Channel</span></td><td>3x avg CNP amount</td><td><span class="priority-tag p-high">ALERT</span></td><td>4.8%</td><td>20%</td><td><span class="status-pill s-active">ACTIVE</span></td><td class="actions-cell"><button class="icon-btn" (click)="interact.info('Editing rule')"><i class="pi pi-pencil"></i></button><button class="icon-btn" (click)="interact.info('Testing rule')"><i class="pi pi-play"></i></button></td></tr>
        </tbody></table></div>
        <div style="margin-top:14px;display:flex;gap:12px">
          <div style="flex:1;padding:14px;background:#f8fafc;border-radius:10px;border:1px solid #e2e8f0;text-align:center"><span style="font-size:20px;font-weight:800;color:#3b82f6;display:block">5</span><span style="font-size:11px;color:#64748b">Active Rules</span></div>
          <div style="flex:1;padding:14px;background:#f8fafc;border-radius:10px;border:1px solid #e2e8f0;text-align:center"><span style="font-size:20px;font-weight:800;color:#f59e0b;display:block">1</span><span style="font-size:11px;color:#64748b">Testing</span></div>
          <div style="flex:1;padding:14px;background:#f8fafc;border-radius:10px;border:1px solid #e2e8f0;text-align:center"><span style="font-size:20px;font-weight:800;color:#22c55e;display:block">4.9%</span><span style="font-size:11px;color:#64748b">Avg Hit Rate</span></div>
          <div style="flex:1;padding:14px;background:#f8fafc;border-radius:10px;border:1px solid #e2e8f0;text-align:center"><span style="font-size:20px;font-weight:800;color:#ef4444;display:block">19.4%</span><span style="font-size:11px;color:#64748b">Avg FP Rate</span></div>
        </div>
      }

      @if(activeTab()==='blacklist'){
        <div style="display:flex;justify-content:space-between;margin-bottom:12px"><h3 style="font-size:16px;font-weight:700;margin:0">Blacklist Management</h3><button class="btn-outline" (click)="interact.info('Adding...')"><i class="pi pi-plus"></i> Add Entry</button></div>
        <div class="data-table"><table><thead><tr><th>Type</th><th>Identifier</th><th>Reason</th><th>Added By</th><th>Date</th><th>Expiry</th><th>Actions</th></tr></thead><tbody>
          <tr><td><span class="type-tag">Card</span></td><td class="mono">****4523</td><td>Confirmed fraud</td><td>Fraud Team</td><td>Feb 10</td><td>Permanent</td><td><button class="btn-outline" style="padding:4px 10px;font-size:11px" (click)="interact.warn('Removed')"><i class="pi pi-trash"></i></button></td></tr>
          <tr><td><span class="type-tag">Account</span></td><td class="mono">ACC-789</td><td>Account takeover</td><td>System</td><td>Feb 12</td><td>Mar 12</td><td><button class="btn-outline" style="padding:4px 10px;font-size:11px" (click)="interact.warn('Removed')"><i class="pi pi-trash"></i></button></td></tr>
          <tr><td><span class="type-tag">Device</span></td><td class="mono">FP-abc</td><td>Bot activity</td><td>ML Model</td><td>Feb 14</td><td>Permanent</td><td><button class="btn-outline" style="padding:4px 10px;font-size:11px" (click)="interact.warn('Removed')"><i class="pi pi-trash"></i></button></td></tr>
          <tr><td><span class="type-tag">IP</span></td><td class="mono">192.168.x</td><td>Brute force</td><td>Security</td><td>Feb 15</td><td>Feb 22</td><td><button class="btn-outline" style="padding:4px 10px;font-size:11px" (click)="interact.warn('Removed')"><i class="pi pi-trash"></i></button></td></tr>
          <tr><td><span class="type-tag">Merchant</span></td><td class="mono">MRC-998</td><td>Suspicious</td><td>Compliance</td><td>Jan 28</td><td>Review</td><td><button class="btn-outline" style="padding:4px 10px;font-size:11px" (click)="interact.warn('Removed')"><i class="pi pi-trash"></i></button></td></tr>
        </tbody></table></div>
      }

      @if(activeTab()==='watchlist'){
        <div style="display:flex;justify-content:space-between;margin-bottom:12px"><h3 style="font-size:16px;font-weight:700;margin:0">Watchlist Monitoring</h3><button class="btn-outline" (click)="interact.info('Adding...')"><i class="pi pi-plus"></i> Add Entry</button></div>
        <div class="data-table"><table><thead><tr><th>Type</th><th>Identifier</th><th>Reason</th><th>Flag</th><th>Since</th><th>Alerts</th><th>Actions</th></tr></thead><tbody>
          <tr><td><span class="type-tag">Customer</span></td><td class="mono">CUST-456</td><td>Unusual pattern</td><td><span class="priority-tag p-high">ENHANCED</span></td><td>Jan 15</td><td>3</td><td><button class="btn-outline" style="padding:4px 10px;font-size:11px" (click)="interact.info('Viewing')"><i class="pi pi-eye"></i></button></td></tr>
          <tr><td><span class="type-tag">Account</span></td><td class="mono">ACC-112</td><td>High velocity</td><td><span class="priority-tag p-medium">MONITOR</span></td><td>Feb 01</td><td>5</td><td><button class="btn-outline" style="padding:4px 10px;font-size:11px" (click)="interact.info('Viewing')"><i class="pi pi-eye"></i></button></td></tr>
          <tr><td><span class="type-tag">Merchant</span></td><td class="mono">MRC-334</td><td>High chargeback</td><td><span class="priority-tag p-medium">REVIEW</span></td><td>Feb 08</td><td>2</td><td><button class="btn-outline" style="padding:4px 10px;font-size:11px" (click)="interact.info('Viewing')"><i class="pi pi-eye"></i></button></td></tr>
        </tbody></table></div>
      }

      @if (selectedAlert()) {
        <div class="detail-overlay" (click)="selectedAlert.set(null)">
          <div class="detail-panel" style="width:780px" (click)="$event.stopPropagation()">
            <div class="detail-header"><div><span class="mono">{{ selectedAlert()!.id }}</span><h2>Fraud Investigation</h2><div style="display:flex;gap:6px;margin-top:4px"><span class="priority-tag" [class]="'p-'+selectedAlert()!.priority.toLowerCase()">{{ selectedAlert()!.priority }}</span><span class="type-tag">{{ selectedAlert()!.status }}</span></div></div><button class="close-btn" (click)="selectedAlert.set(null)"><i class="pi pi-times"></i></button></div>
            <div style="display:flex;gap:0;border-bottom:1px solid #e2e8f0;padding:0 20px;overflow-x:auto">@for(t of [{id:'summary',l:'Summary'},{id:'scoring',l:'Scoring'},{id:'cust360',l:'Customer 360'},{id:'velocity',l:'Velocity'},{id:'device',l:'Device/Geo'},{id:'decide',l:'Decision'}];track t.id){<button style="padding:10px 14px;border:none;background:none;font-size:12px;cursor:pointer;border-bottom:2px solid transparent;white-space:nowrap" [style.color]="fraudTab()===t.id?'#2563eb':'#64748b'" [style.border-bottom-color]="fraudTab()===t.id?'#2563eb':'transparent'" [style.font-weight]="fraudTab()===t.id?'600':'500'" (click)="fraudTab.set(t.id)">{{ t.l }}</button>}</div>
            <div class="detail-body">
              @if(fraudTab()==='summary'){
                <div class="alert-summary"><div class="score-circle" [style.border-color]="getScoreColor(selectedAlert()!.fraudScore)"><span>{{ selectedAlert()!.fraudScore }}</span></div><div class="summary-grid"><div><label>Customer</label><span>{{ selectedAlert()!.customerName }}</span></div><div><label>Amount</label><span class="mono">{{ selectedAlert()!.amount | number }}</span></div><div><label>Channel</label><span>{{ selectedAlert()!.channel }}</span></div><div><label>Rule</label><span>{{ selectedAlert()!.ruleTriggered }}</span></div><div><label>Created</label><span>{{ selectedAlert()!.createdAt | date:'short' }}</span></div><div><label>Assigned</label><span>{{ selectedAlert()!.assignedTo || 'Unassigned' }}</span></div></div></div>
                <div class="invest-section"><h4>Notes</h4><textarea rows="3" placeholder="Add investigation notes..."></textarea></div>
              }
              @if(fraudTab()==='scoring'){
                <h4 style="font-size:15px;font-weight:700;margin:0 0 12px">Score Breakdown</h4>
                <div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:8px;margin-bottom:16px"><div style="background:#fef2f2;padding:12px;border-radius:10px;text-align:center"><span style="font-size:10px;color:#64748b;display:block">Overall</span><span style="font-size:24px;font-weight:800;color:#ef4444">{{ selectedAlert()!.fraudScore }}</span></div><div style="background:#fffbeb;padding:12px;border-radius:10px;text-align:center"><span style="font-size:10px;color:#64748b;display:block">Rule</span><span style="font-size:24px;font-weight:800;color:#f59e0b">720</span></div><div style="background:#f5f3ff;padding:12px;border-radius:10px;text-align:center"><span style="font-size:10px;color:#64748b;display:block">ML</span><span style="font-size:24px;font-weight:800;color:#8b5cf6">890</span></div><div style="background:#eff6ff;padding:12px;border-radius:10px;text-align:center"><span style="font-size:10px;color:#64748b;display:block">Device</span><span style="font-size:24px;font-weight:800;color:#3b82f6">340</span></div></div>
                <h4 style="font-size:13px;font-weight:700;margin:0 0 8px">Triggered Indicators</h4>
                <div style="display:flex;flex-direction:column;gap:4px"><div style="display:flex;align-items:center;gap:8px;padding:8px 12px;background:#fef2f2;border-radius:8px;border-left:3px solid #ef4444"><span style="font-size:12px;flex:1">Unusual amount exceeds 10x average</span><span style="font-size:11px;font-weight:700;color:#ef4444">+250</span></div><div style="display:flex;align-items:center;gap:8px;padding:8px 12px;background:#fef2f2;border-radius:8px;border-left:3px solid #ef4444"><span style="font-size:12px;flex:1">High-risk country</span><span style="font-size:11px;font-weight:700;color:#ef4444">+200</span></div><div style="display:flex;align-items:center;gap:8px;padding:8px 12px;background:#fffbeb;border-radius:8px;border-left:3px solid #f59e0b"><span style="font-size:12px;flex:1">Off-hours (03:42 AM)</span><span style="font-size:11px;font-weight:700;color:#f59e0b">+100</span></div><div style="display:flex;align-items:center;gap:8px;padding:8px 12px;background:#fffbeb;border-radius:8px;border-left:3px solid #f59e0b"><span style="font-size:12px;flex:1">New device fingerprint</span><span style="font-size:11px;font-weight:700;color:#f59e0b">+80</span></div><div style="display:flex;align-items:center;gap:8px;padding:8px 12px;background:#f0fdf4;border-radius:8px;border-left:3px solid #22c55e"><span style="font-size:12px;flex:1">Verified KYC customer</span><span style="font-size:11px;font-weight:700;color:#22c55e">-50</span></div></div>
              }
              @if(fraudTab()==='cust360'){
                <h4 style="font-size:15px;font-weight:700;margin:0 0 12px">Customer 360</h4>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:16px"><div style="background:#f8fafc;padding:10px;border-radius:8px;border:1px solid #e2e8f0"><span style="font-size:10px;color:#64748b;display:block">Name</span><strong style="font-size:13px">{{ selectedAlert()!.customerName }}</strong></div><div style="background:#f8fafc;padding:10px;border-radius:8px;border:1px solid #e2e8f0"><span style="font-size:10px;color:#64748b;display:block">Account Age</span><strong style="font-size:13px">3y 4m</strong></div><div style="background:#f8fafc;padding:10px;border-radius:8px;border:1px solid #e2e8f0"><span style="font-size:10px;color:#64748b;display:block">KYC</span><span class="type-tag" style="background:#f0fdf4;color:#22c55e;font-size:11px">VERIFIED</span></div><div style="background:#f8fafc;padding:10px;border-radius:8px;border:1px solid #e2e8f0"><span style="font-size:10px;color:#64748b;display:block">Risk</span><strong style="color:#f59e0b">68/100</strong></div><div style="background:#f8fafc;padding:10px;border-radius:8px;border:1px solid #e2e8f0"><span style="font-size:10px;color:#64748b;display:block">Prior Cases</span><strong>1 (resolved)</strong></div><div style="background:#f8fafc;padding:10px;border-radius:8px;border:1px solid #e2e8f0"><span style="font-size:10px;color:#64748b;display:block">Avg Monthly</span><strong>$4,500</strong></div></div>
                <h4 style="font-size:13px;font-weight:700;margin:0 0 8px">Recent Transactions</h4>
                <table style="width:100%;font-size:12px;border-collapse:collapse"><thead><tr style="background:#f8fafc"><th style="text-align:left;padding:8px;font-size:10px;color:#64748b;text-transform:uppercase">Date</th><th style="text-align:left;padding:8px;font-size:10px;color:#64748b;text-transform:uppercase">Amount</th><th style="text-align:left;padding:8px;font-size:10px;color:#64748b;text-transform:uppercase">Merchant</th><th style="text-align:left;padding:8px;font-size:10px;color:#64748b;text-transform:uppercase">Status</th></tr></thead><tbody><tr><td style="padding:6px 8px;border-bottom:1px solid #f1f5f9">Feb 15</td><td style="padding:6px 8px;font-weight:700;color:#ef4444;border-bottom:1px solid #f1f5f9">$12,500</td><td style="padding:6px 8px;border-bottom:1px solid #f1f5f9">Unknown</td><td style="padding:6px 8px;border-bottom:1px solid #f1f5f9"><span class="priority-tag p-high">FLAGGED</span></td></tr><tr><td style="padding:6px 8px;border-bottom:1px solid #f1f5f9">Feb 14</td><td style="padding:6px 8px;border-bottom:1px solid #f1f5f9">$85</td><td style="padding:6px 8px;border-bottom:1px solid #f1f5f9">Grocery</td><td style="padding:6px 8px;border-bottom:1px solid #f1f5f9"><span class="type-tag" style="background:#f0fdf4;color:#22c55e">OK</span></td></tr><tr><td style="padding:6px 8px">Feb 13</td><td style="padding:6px 8px">$2,100</td><td style="padding:6px 8px">Electronics</td><td style="padding:6px 8px"><span class="type-tag" style="background:#f0fdf4;color:#22c55e">OK</span></td></tr></tbody></table>
              }
              @if(fraudTab()==='velocity'){
                <h4 style="font-size:15px;font-weight:700;margin:0 0 12px">Velocity Metrics</h4>
                <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:16px"><div style="background:#fef2f2;padding:14px;border-radius:10px;text-align:center"><span style="font-size:22px;font-weight:800;color:#ef4444;display:block">5</span><span style="font-size:10px;color:#64748b">Txns/1hr</span></div><div style="background:#fffbeb;padding:14px;border-radius:10px;text-align:center"><span style="font-size:22px;font-weight:800;color:#f59e0b;display:block">12</span><span style="font-size:10px;color:#64748b">Txns/24hr</span></div><div style="background:#fef2f2;padding:14px;border-radius:10px;text-align:center"><span style="font-size:22px;font-weight:800;color:#ef4444;display:block">$15.2K</span><span style="font-size:10px;color:#64748b">Amt/1hr</span></div><div style="background:#f8fafc;padding:14px;border-radius:10px;text-align:center"><span style="font-size:22px;font-weight:800;display:block">6</span><span style="font-size:10px;color:#64748b">Merchants</span></div></div>
                <h4 style="font-size:13px;font-weight:700;margin:0 0 8px">vs Peer Group</h4>
                <div style="display:flex;flex-direction:column;gap:6px">@for(m of [{l:'Txn Count',v:85,p:35,c:'#ef4444',t:'12 vs 4'},{l:'Amount',v:92,p:25,c:'#ef4444',t:'$15K vs $1.2K'},{l:'Merchants',v:70,p:40,c:'#f59e0b',t:'6 vs 3'}];track m.l){<div style="display:flex;align-items:center;gap:8px;font-size:12px"><span style="width:80px;color:#64748b">{{ m.l }}</span><div style="flex:1;height:10px;background:#f1f5f9;border-radius:4px;position:relative"><div [style.width.%]="m.v" style="height:100%;border-radius:4px" [style.background]="m.c"></div><div [style.left.%]="m.p" style="position:absolute;top:-2px;height:14px;width:2px;background:#1e293b"></div></div><span style="width:80px;font-weight:700;font-size:10px" [style.color]="m.c">{{ m.t }}</span></div>}</div>
              }
              @if(fraudTab()==='device'){
                <h4 style="font-size:15px;font-weight:700;margin:0 0 12px">Device & Geographic</h4>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
                  <div><h4 style="font-size:13px;font-weight:700;margin:0 0 6px">Device</h4>@for(r of [{l:'Browser',v:'Chrome 121'},{l:'OS',v:'Android 14'},{l:'Device',v:'FP-8a3c2f...'},{l:'First Seen',v:'TODAY (NEW)',c:'#ef4444'},{l:'IP Risk',v:'HIGH RISK',c:'#ef4444'},{l:'VPN/Proxy',v:'DETECTED',c:'#ef4444'}];track r.l){<div style="display:flex;justify-content:space-between;font-size:12px;padding:6px 0;border-bottom:1px solid #f1f5f9"><span style="color:#64748b">{{ r.l }}</span><span [style.color]="r.c||''" [style.font-weight]="r.c?'700':''">{{ r.v }}</span></div>}</div>
                  <div><h4 style="font-size:13px;font-weight:700;margin:0 0 6px">Geographic</h4>@for(r of [{l:'Current',v:'Lagos, Nigeria'},{l:'Home',v:'New York, USA'},{l:'Last Txn',v:'New York (2h ago)'},{l:'Distance',v:'8,500 km',c:'#ef4444'},{l:'Travel',v:'IMPOSSIBLE',c:'#ef4444'}];track r.l){<div style="display:flex;justify-content:space-between;font-size:12px;padding:6px 0;border-bottom:1px solid #f1f5f9"><span style="color:#64748b">{{ r.l }}</span><span [style.color]="r.c||''" [style.font-weight]="r.c?'700':''">{{ r.v }}</span></div>}</div>
                </div>
              }
              @if(fraudTab()==='decide'){
                <h4 style="font-size:15px;font-weight:700;margin:0 0 12px">Quick Actions</h4>
                <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-bottom:16px">
                  <button style="padding:10px;background:#fef2f2;border:1px solid #fecaca;border-radius:8px;cursor:pointer;font-weight:600;font-size:11px;color:#ef4444" (click)="interact.success('Blocked!')"><i class="pi pi-ban"></i> Block Txn</button>
                  <button style="padding:10px;background:#fef2f2;border:1px solid #fecaca;border-radius:8px;cursor:pointer;font-weight:600;font-size:11px;color:#ef4444" (click)="interact.success('Card blocked!')"><i class="pi pi-lock"></i> Block Card</button>
                  <button style="padding:10px;background:#fffbeb;border:1px solid #fef3c7;border-radius:8px;cursor:pointer;font-weight:600;font-size:11px;color:#f59e0b" (click)="interact.info('OTP sent!')"><i class="pi pi-mobile"></i> OTP</button>
                  <button style="padding:10px;background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;cursor:pointer;font-weight:600;font-size:11px;color:#3b82f6" (click)="interact.success('Case created!')"><i class="pi pi-folder-open"></i> Case</button>
                  <button style="padding:10px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;cursor:pointer;font-weight:600;font-size:11px;color:#22c55e" (click)="interact.success('Whitelisted!')"><i class="pi pi-check-circle"></i> Whitelist</button>
                  <button style="padding:10px;background:#f5f3ff;border:1px solid #ddd6fe;border-radius:8px;cursor:pointer;font-weight:600;font-size:11px;color:#8b5cf6" (click)="interact.info('Watchlisted')"><i class="pi pi-eye"></i> Watch</button>
                </div>
                <h4 style="font-size:14px;font-weight:700;margin:0 0 8px">Decision</h4>
                <div class="decision-btns">
                  <button class="btn-decision tp" (click)="interact.success('True Positive confirmed')"><i class="pi pi-check"></i> True Positive</button>
                  <button class="btn-decision fp" (click)="interact.success('False Positive - Closed')"><i class="pi pi-times"></i> False Positive</button>
                  <button class="btn-decision esc" (click)="interact.info('Escalated')"><i class="pi pi-arrow-up"></i> Escalate</button>
                </div>
                <div style="margin-top:12px"><label style="font-size:13px;font-weight:600;display:block;margin-bottom:6px">Evidence Summary</label><textarea rows="3" placeholder="Summarize findings..." style="width:100%;padding:10px;border:1px solid #e2e8f0;border-radius:8px;font-size:13px;font-family:inherit;outline:none"></textarea></div>
                <button style="margin-top:8px;padding:10px 20px;background:linear-gradient(135deg,#1e3a8a,#2563eb);color:#fff;border:none;border-radius:10px;font-size:13px;font-weight:600;cursor:pointer" (click)="interact.success('Decision submitted!')"><i class="pi pi-check"></i> Submit</button>
              }
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .page { max-width: 1600px; margin: 0 auto; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
    .page-header h1 { font-size: 28px; font-weight: 800; color: #0f172a; margin: 0; }
    .page-header p { font-size: 14px; color: #64748b; margin: 4px 0 0; }
    .page-actions { display: flex; gap: 10px; align-items: center; }
    .live-indicator { display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 600; color: #22c55e; padding: 8px 16px; background: #f0fdf4; border-radius: 20px; }
    .pulse { width: 8px; height: 8px; background: #22c55e; border-radius: 50%; animation: pulse 2s infinite; }
    @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }
    .btn-outline { padding: 10px 20px; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 6px; border: 1px solid #e2e8f0; background: #fff; color: #475569; }
    .hero-section { position: relative; border-radius: 16px; overflow: hidden; height: 140px; margin-bottom: 20px; }
    .hero-img { width: 100%; height: 100%; object-fit: cover; }
    .hero-ov { position: absolute; inset: 0; background: linear-gradient(135deg, rgba(15,23,42,0.85), rgba(30,58,138,0.7)); display: flex; flex-direction: column; justify-content: center; padding: 0 32px; }
    .hero-ov h2 { font-size: 24px; font-weight: 800; color: #fff; margin: 0 0 4px; }
    .hero-ov p { font-size: 14px; color: rgba(255,255,255,0.7); margin: 0; }
    .kpi-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 20px; }
    .kpi-card { display: flex; align-items: center; gap: 14px; padding: 18px; background: #fff; border-radius: 14px; border: 1px solid #e2e8f0; }
    .kpi-icon { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 18px; }
    .kpi-icon.blue { background: #eff6ff; color: #3b82f6; } .kpi-icon.red { background: #fef2f2; color: #ef4444; }
    .kpi-icon.green { background: #f0fdf4; color: #22c55e; } .kpi-icon.orange { background: #fffbeb; color: #f59e0b; }
    .kpi-val { font-size: 22px; font-weight: 800; color: #0f172a; display: block; }
    .kpi-lbl { font-size: 12px; color: #64748b; }
    .tabs { display: flex; gap: 4px; margin-bottom: 20px; background: #fff; border-radius: 12px; padding: 4px; border: 1px solid #e2e8f0; }
    .tab { padding: 10px 20px; border-radius: 8px; border: none; background: none; font-size: 14px; font-weight: 500; color: #64748b; cursor: pointer; }
    .tab.active { background: #1e3a8a; color: #fff; }
    .filter-bar { display: flex; gap: 10px; margin-bottom: 14px; align-items: center; }
    .search-input { padding: 10px 16px; border: 1px solid #e2e8f0; border-radius: 10px; font-size: 14px; width: 280px; outline: none; }
    .filter-select { padding: 10px 14px; border: 1px solid #e2e8f0; border-radius: 10px; font-size: 13px; background: #fff; }
    .result-count { font-size: 13px; color: #64748b; margin-left: auto; }
    .data-table { background: #fff; border-radius: 14px; border: 1px solid #e2e8f0; overflow: auto; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    thead th { text-align: left; padding: 12px; background: #f8fafc; color: #64748b; font-size: 11px; font-weight: 600; text-transform: uppercase; border-bottom: 2px solid #e2e8f0; white-space: nowrap; }
    tbody td { padding: 10px 12px; border-bottom: 1px solid #f1f5f9; color: #334155; white-space: nowrap; }
    tbody tr { cursor: pointer; } tbody tr:hover { background: #f8fafc; } tbody tr.selected { background: #eff6ff; }
    .mono { font-family: monospace; font-size: 12px; }
    .type-tag { font-size: 11px; padding: 3px 10px; border-radius: 20px; background: #f1f5f9; color: #475569; }
    .fraud-score { font-weight: 800; font-size: 15px; }
    .priority-tag { padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; }
    .p-high { background: #fef2f2; color: #ef4444; } .p-medium { background: #fffbeb; color: #f59e0b; } .p-low { background: #f0fdf4; color: #22c55e; }
    .status-pill { font-size: 11px; padding: 3px 10px; border-radius: 20px; background: #f1f5f9; color: #475569; font-weight: 600; }
    .icon-btn { width: 30px; height: 30px; border-radius: 6px; border: 1px solid #e2e8f0; background: #fff; cursor: pointer; }
    .icon-btn i { font-size: 12px; color: #64748b; }
    .detail-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 200; display: flex; justify-content: flex-end; }
    .detail-panel { width: 680px; max-width: 90vw; background: #fff; height: 100vh; overflow-y: auto; box-shadow: -10px 0 40px rgba(0,0,0,0.15); }
    .detail-header { display: flex; justify-content: space-between; padding: 24px; border-bottom: 1px solid #e2e8f0; }
    .detail-header h2 { font-size: 20px; font-weight: 700; color: #0f172a; margin: 4px 0 0; }
    .close-btn { background: #f1f5f9; border: none; width: 36px; height: 36px; border-radius: 10px; cursor: pointer; }
    .detail-body { padding: 24px; }
    .alert-summary { display: flex; gap: 24px; background: #f8fafc; border-radius: 14px; padding: 20px; margin-bottom: 24px; }
    .score-circle { width: 72px; height: 72px; border-radius: 50%; border: 4px solid; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .score-circle span { font-size: 24px; font-weight: 800; }
    .summary-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; flex: 1; }
    .summary-grid label { font-size: 11px; color: #94a3b8; display: block; }
    .summary-grid span { font-size: 14px; font-weight: 600; color: #1e293b; }
    .invest-section { margin-bottom: 20px; }
    .invest-section h4 { font-size: 15px; font-weight: 700; margin: 0 0 10px; }
    textarea { width: 100%; padding: 12px; border: 1px solid #e2e8f0; border-radius: 10px; font-size: 14px; outline: none; resize: vertical; box-sizing: border-box; }
    .decision-btns { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    .btn-decision { padding: 12px 16px; border-radius: 10px; border: 1px solid #e2e8f0; background: #fff; font-size: 14px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px; justify-content: center; }
    .btn-decision.tp:hover { background: #f0fdf4; border-color: #22c55e; color: #22c55e; }
    .btn-decision.fp:hover { background: #fef2f2; border-color: #ef4444; color: #ef4444; }
    .btn-decision.esc:hover { background: #fffbeb; border-color: #f59e0b; color: #f59e0b; }
    .btn-decision.case:hover { background: #eff6ff; border-color: #3b82f6; color: #3b82f6; }
    @media (max-width: 1024px) { .kpi-row { grid-template-columns: repeat(2, 1fr); } }
  `]
})
export class FraudDetectionComponent implements OnInit {
  alerts: FraudAlert[] = [];
  filteredAlerts: FraudAlert[] = [];
  selectedAlert = signal<FraudAlert | null>(null);
  activeTab = signal('alerts');
  fraudTab = signal('summary');
  searchTerm = '';
  filterPriority = '';

  constructor(public mockData: MockDataService, public interact: InteractionService) {}

  ngOnInit() {
    this.alerts = this.mockData.getFraudAlerts();
    this.filteredAlerts = [...this.alerts];
  }

  exportData() {
    this.interact.exportCSV(this.filteredAlerts, 'fraud-alerts', ['id','customerName','alertType','fraudScore','amount','priority','status']);
  }

  filterAlerts() {
    this.filteredAlerts = this.alerts.filter(a => {
      const s = !this.searchTerm || a.customerName.toLowerCase().includes(this.searchTerm.toLowerCase()) || a.id.toLowerCase().includes(this.searchTerm.toLowerCase());
      const p = !this.filterPriority || a.priority === this.filterPriority;
      return s && p;
    });
  }

  getScoreColor(score: number): string {
    return score >= 800 ? '#ef4444' : score >= 600 ? '#f59e0b' : score >= 300 ? '#eab308' : '#22c55e';
  }
}
