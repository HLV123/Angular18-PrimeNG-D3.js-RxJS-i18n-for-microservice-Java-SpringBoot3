import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MockDataService } from '../../core/services/mock-data.service';
import { InteractionService } from '../../core/services/interaction.service';

@Component({
  selector: 'app-transaction-monitoring',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="page">
      <div class="page-header">
        <div><h1>Transaction Monitoring</h1><p>Real-time transaction stream monitoring</p></div>
        <div class="page-actions">
          <button class="btn-outline" (click)="exportData()"><i class="pi pi-download"></i> Export</button>
          <button class="btn-primary" (click)="showCreate.set(true)"><i class="pi pi-plus"></i> Create New</button>
        </div>
      </div>
      <div class="hero-section"><img src="assets/images/fraud-detection-bg.png" class="hero-img" /><div class="hero-ov"><h2>Transaction Monitoring</h2><p>Real-time transaction stream monitoring</p></div></div>
      <div class="kpi-row">
        <div class="kpi-card"><div class="kpi-icon blue"><i class="pi pi-bolt"></i></div><div><span class="kpi-val">1,247</span><span class="kpi-lbl">TPS</span></div></div>
        <div class="kpi-card"><div class="kpi-icon orange"><i class="pi pi-chart-line"></i></div><div><span class="kpi-val">2.3%</span><span class="kpi-lbl">Alert Rate</span></div></div>
        <div class="kpi-card"><div class="kpi-icon red"><i class="pi pi-ban"></i></div><div><span class="kpi-val">34</span><span class="kpi-lbl">Blocked</span></div></div>
        <div class="kpi-card"><div class="kpi-icon green"><i class="pi pi-check-circle"></i></div><div><span class="kpi-val">99.9%</span><span class="kpi-lbl">Uptime</span></div></div>
      </div>
      <div class="tabs">
        <button class="tab" [class.active]="activeTab() === 'live'" (click)="activeTab.set('live')">Live Feed</button>
        <button class="tab" [class.active]="activeTab() === 'scenarios'" (click)="activeTab.set('scenarios')">Scenarios</button>
        <button class="tab" [class.active]="activeTab() === 'network'" (click)="activeTab.set('network')">Network</button>
      </div>

      @if (activeTab() === 'live') {
        <div class="filter-bar">
          <input type="text" placeholder="Search..." class="search-input" [(ngModel)]="searchTerm" (input)="applyFilters()" />
          <select [(ngModel)]="filters['channel']" (change)="applyFilters()" class="filter-select"><option value="">All Channels</option><option value="ATM">ATM</option><option value="POS">POS</option><option value="ONLINE">ONLINE</option><option value="MOBILE">MOBILE</option><option value="WIRE">WIRE</option></select>
          <select [(ngModel)]="filters['status']" (change)="applyFilters()" class="filter-select"><option value="">All Status</option><option value="APPROVED">APPROVED</option><option value="BLOCKED">BLOCKED</option><option value="UNDER_REVIEW">UNDER_REVIEW</option></select>
          
          <span class="result-count">{{ filtered.length }} records</span>
        </div>
        <div class="data-table">
          <table>
            <thead><tr><th (click)="sortBy('id')">TXN ID</th><th (click)="sortBy('customerName')">Customer</th><th (click)="sortBy('type')">Type</th><th (click)="sortBy('amount')">Amount</th><th (click)="sortBy('merchant')">Merchant</th><th (click)="sortBy('channel')">Channel</th><th (click)="sortBy('fraudScore')">Score</th><th (click)="sortBy('status')">Status</th><th>Actions</th></tr></thead>
            <tbody>
              @for (item of paginated(); track $index) {
                <tr (click)="viewItem(item)" [class.selected]="selectedItem?.id === item.id">
                  <td>{{ item.id }}</td><td>{{ item.customerName }}</td><td>{{ item.type }}</td><td class="mono">{{ item.amount | number }}</td><td>{{ item.merchant }}</td><td>{{ item.channel }}</td><td class="mono">{{ item.fraudScore | number }}</td><td><span class="status-pill">{{ item.status }}</span></td>
                  <td class="actions-cell">
                    <button class="icon-btn" title="View" (click)="viewItem(item); $event.stopPropagation()"><i class="pi pi-eye"></i></button>
                    <button class="icon-btn" title="Edit" (click)="editItem(item); $event.stopPropagation()"><i class="pi pi-pencil"></i></button>
                    <button class="icon-btn danger" title="Delete" (click)="deleteItem(item); $event.stopPropagation()"><i class="pi pi-trash"></i></button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
          <div class="pagination">
            <button [disabled]="page() === 1" (click)="page.set(page() - 1)"><i class="pi pi-chevron-left"></i></button>
            <span>Page {{ page() }} of {{ totalPages() }}</span>
            <button [disabled]="page() >= totalPages()" (click)="page.set(page() + 1)"><i class="pi pi-chevron-right"></i></button>
          </div>
        </div>
      }

      @if (activeTab() === 'scenarios') {
        <div class="data-table"><table><thead><tr><th>Scenario</th><th>Description</th><th>Threshold</th><th>Hit Rate</th><th>Status</th><th>Actions</th></tr></thead><tbody><tr><td><strong>Velocity Check</strong></td><td>Multiple txns in short window</td><td>&gt;5 txn/10min</td><td>5.7%</td><td><span class="status-pill" style="background:#f0fdf4;color:#22c55e">ACTIVE</span></td><td class="actions-cell"><button class="icon-btn" (click)="interact.info('Editing velocity check')"><i class="pi pi-pencil"></i></button><button class="icon-btn" (click)="interact.warn('Scenario paused')"><i class="pi pi-pause"></i></button></td></tr><tr><td><strong>Amount Anomaly</strong></td><td>Txn exceeds 3x average</td><td>3x avg</td><td>8.5%</td><td><span class="status-pill" style="background:#f0fdf4;color:#22c55e">ACTIVE</span></td><td class="actions-cell"><button class="icon-btn" (click)="interact.info('Editing amount anomaly')"><i class="pi pi-pencil"></i></button><button class="icon-btn" (click)="interact.warn('Scenario paused')"><i class="pi pi-pause"></i></button></td></tr><tr><td><strong>Cross-Border</strong></td><td>Unusual cross-border patterns</td><td>High-risk countries</td><td>12.3%</td><td><span class="status-pill" style="background:#f0fdf4;color:#22c55e">ACTIVE</span></td><td class="actions-cell"><button class="icon-btn" (click)="interact.info('Editing cross-border')"><i class="pi pi-pencil"></i></button><button class="icon-btn" (click)="interact.warn('Scenario paused')"><i class="pi pi-pause"></i></button></td></tr><tr><td><strong>Dormant Account</strong></td><td>Activity on 6+ month dormant</td><td>180 days</td><td>2.1%</td><td><span class="status-pill" style="background:#f0fdf4;color:#22c55e">ACTIVE</span></td><td class="actions-cell"><button class="icon-btn" (click)="interact.info('Editing dormant check')"><i class="pi pi-pencil"></i></button><button class="icon-btn" (click)="interact.warn('Scenario paused')"><i class="pi pi-pause"></i></button></td></tr><tr><td><strong>Round Structuring</strong></td><td>Round amount patterns</td><td>Pattern match</td><td>-</td><td><span class="status-pill">DRAFT</span></td><td class="actions-cell"><button class="icon-btn" (click)="interact.info('Editing round structuring')"><i class="pi pi-pencil"></i></button><button class="icon-btn" (click)="interact.success('Scenario activated')"><i class="pi pi-play"></i></button></td></tr></tbody></table></div>
      }

      @if (activeTab() === 'network') {
        <div style="background:#fff;border-radius:16px;border:1px solid #e2e8f0;padding:24px;"><div style="display:flex;justify-content:space-between;margin-bottom:16px;"><h3 style="font-size:18px;font-weight:700;margin:0;">Network Graph</h3><button class="btn-primary" (click)="interact.info('Launching graph explorer')"><i class="pi pi-external-link"></i> Full Screen</button></div><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:16px;"><div class="kpi-card"><div class="kpi-icon red"><i class="pi pi-share-alt"></i></div><div><span class="kpi-val">3</span><span class="kpi-lbl">Suspicious Clusters</span></div></div><div class="kpi-card"><div class="kpi-icon orange"><i class="pi pi-sitemap"></i></div><div><span class="kpi-val">12</span><span class="kpi-lbl">High-Connectivity Nodes</span></div></div><div class="kpi-card"><div class="kpi-icon blue"><i class="pi pi-replay"></i></div><div><span class="kpi-val">2</span><span class="kpi-lbl">Circular Flows</span></div></div></div><div class="data-table"><table><thead><tr><th>Cluster</th><th>Entities</th><th>Txns</th><th>Volume</th><th>Risk</th><th>Pattern</th><th>Actions</th></tr></thead><tbody><tr><td class="mono">CLU-001</td><td>8</td><td>45</td><td class="mono">$1,234,567</td><td><span style="color:#ef4444;font-weight:700">92</span></td><td>Circular flow</td><td class="actions-cell"><button class="icon-btn" (click)="interact.info('Investigating CLU-001')"><i class="pi pi-search"></i></button></td></tr><tr><td class="mono">CLU-002</td><td>5</td><td>28</td><td class="mono">$567,890</td><td><span style="color:#f59e0b;font-weight:700">74</span></td><td>Hub-spoke</td><td class="actions-cell"><button class="icon-btn" (click)="interact.info('Investigating CLU-002')"><i class="pi pi-search"></i></button></td></tr><tr><td class="mono">CLU-003</td><td>12</td><td>67</td><td class="mono">$2,345,678</td><td><span style="color:#ef4444;font-weight:700">88</span></td><td>Layering</td><td class="actions-cell"><button class="icon-btn" (click)="interact.info('Investigating CLU-003')"><i class="pi pi-search"></i></button></td></tr></tbody></table></div></div>
      }

      
      @if(activeTab()==='behavior'){
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-bottom:16px">
          <div class="kpi-card" style="flex-direction:column;align-items:flex-start;gap:4px"><span style="font-size:11px;color:#64748b;text-transform:uppercase;font-weight:600">Anomaly Score</span><span style="font-size:28px;font-weight:800;color:#ef4444">87.5</span><span style="font-size:11px;color:#ef4444"><i class="pi pi-arrow-up" style="font-size:10px"></i> +12.3 from baseline</span></div>
          <div class="kpi-card" style="flex-direction:column;align-items:flex-start;gap:4px"><span style="font-size:11px;color:#64748b;text-transform:uppercase;font-weight:600">Flagged Customers</span><span style="font-size:28px;font-weight:800;color:#f59e0b">156</span><span style="font-size:11px;color:#64748b">Last 24 hours</span></div>
          <div class="kpi-card" style="flex-direction:column;align-items:flex-start;gap:4px"><span style="font-size:11px;color:#64748b;text-transform:uppercase;font-weight:600">Peer Groups</span><span style="font-size:28px;font-weight:800;color:#3b82f6">24</span><span style="font-size:11px;color:#64748b">Active cohorts</span></div>
        </div>
        <h3 style="font-size:16px;font-weight:700;margin:0 0 12px">Customer Behavior Profiles</h3>
        <div class="data-table"><table><thead><tr><th>Customer</th><th>Segment</th><th>Avg Txn</th><th>Current</th><th>Deviation</th><th>Anomaly Score</th><th>Status</th></tr></thead><tbody>
          <tr><td><strong>John Smith</strong></td><td>Retail-High</td><td>$450</td><td>$12,500</td><td style="color:#ef4444;font-weight:700">+2,678%</td><td><span style="font-weight:700;color:#ef4444">92</span></td><td><span class="status-pill s-failed">ANOMALY</span></td></tr>
          <tr><td><strong>Alice Johnson</strong></td><td>Corporate</td><td>$15K</td><td>$89,000</td><td style="color:#f59e0b;font-weight:700">+493%</td><td><span style="font-weight:700;color:#f59e0b">71</span></td><td><span class="status-pill s-review">ELEVATED</span></td></tr>
          <tr><td><strong>Bob Wilson</strong></td><td>Retail-Med</td><td>$200</td><td>$3,200</td><td style="color:#f59e0b;font-weight:700">+1,500%</td><td><span style="font-weight:700;color:#f59e0b">68</span></td><td><span class="status-pill s-review">ELEVATED</span></td></tr>
          <tr><td><strong>Maria Garcia</strong></td><td>Retail-Low</td><td>$80</td><td>$75</td><td style="color:#22c55e">-6%</td><td><span style="color:#22c55e">12</span></td><td><span class="status-pill s-active">NORMAL</span></td></tr>
        </tbody></table></div>
      }

      @if(activeTab()==='patterns'){
        <h3 style="font-size:16px;font-weight:700;margin:0 0 16px">Detected Patterns</h3>
        <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:12px">
          <div class="kpi-card" style="flex-direction:column;align-items:flex-start;gap:8px;border-left:3px solid #ef4444"><div style="display:flex;justify-content:space-between;width:100%"><strong style="font-size:14px">Structuring</strong><span class="priority-tag p-high">HIGH RISK</span></div><p style="font-size:12px;color:#64748b;margin:0">Multiple transactions just below reporting threshold ($10K) to same beneficiary. 3 customers flagged.</p><div style="display:flex;gap:8px;margin-top:4px"><button class="btn-outline" style="padding:4px 12px;font-size:11px" (click)="interact.info('Viewing details')"><i class="pi pi-eye"></i> View</button><button class="btn-outline" style="padding:4px 12px;font-size:11px" (click)="interact.success('Alert created')"><i class="pi pi-bell"></i> Alert</button></div></div>
          <div class="kpi-card" style="flex-direction:column;align-items:flex-start;gap:8px;border-left:3px solid #f59e0b"><div style="display:flex;justify-content:space-between;width:100%"><strong style="font-size:14px">Round Tripping</strong><span class="priority-tag p-medium">MEDIUM</span></div><p style="font-size:12px;color:#64748b;margin:0">Circular fund flows between related accounts. Pattern detected across 2 entities.</p><div style="display:flex;gap:8px;margin-top:4px"><button class="btn-outline" style="padding:4px 12px;font-size:11px" (click)="interact.info('Viewing')"><i class="pi pi-eye"></i> View</button></div></div>
          <div class="kpi-card" style="flex-direction:column;align-items:flex-start;gap:8px;border-left:3px solid #f59e0b"><div style="display:flex;justify-content:space-between;width:100%"><strong style="font-size:14px">Layering</strong><span class="priority-tag p-medium">MEDIUM</span></div><p style="font-size:12px;color:#64748b;margin:0">Complex multi-hop transfers through shell companies. 5 intermediate accounts involved.</p><div style="display:flex;gap:8px;margin-top:4px"><button class="btn-outline" style="padding:4px 12px;font-size:11px" (click)="interact.info('Viewing')"><i class="pi pi-eye"></i> View</button></div></div>
          <div class="kpi-card" style="flex-direction:column;align-items:flex-start;gap:8px;border-left:3px solid #3b82f6"><div style="display:flex;justify-content:space-between;width:100%"><strong style="font-size:14px">Velocity Spike</strong><span class="type-tag">INFO</span></div><p style="font-size:12px;color:#64748b;margin:0">Unusual increase in transaction frequency. Month-over-month +340% for 8 customers.</p><div style="display:flex;gap:8px;margin-top:4px"><button class="btn-outline" style="padding:4px 12px;font-size:11px" (click)="interact.info('Viewing')"><i class="pi pi-eye"></i> View</button></div></div>
        </div>
      }

      @if (showDetail()) {
        <div class="overlay" (click)="showDetail.set(false)">
          <div class="side-panel" (click)="$event.stopPropagation()">
            <div class="panel-header"><div><span class="panel-id">{{ selectedItem?.id }}</span><h2>{{ editMode() ? 'Edit' : 'View' }} Record</h2></div><button class="close-btn" (click)="showDetail.set(false)"><i class="pi pi-times"></i></button></div>
            <div class="panel-tabs"><button class="panel-tab" [class.active]="detailTab()==='info'" (click)="detailTab.set('info')">Transaction</button><button class="panel-tab" [class.active]="detailTab()==='risk'" (click)="detailTab.set('risk')">Risk Analysis</button><button class="panel-tab" [class.active]="detailTab()==='related'" (click)="detailTab.set('related')">Related Txns</button><button class="panel-tab" [class.active]="detailTab()==='trail'" (click)="detailTab.set('trail')">Audit Trail</button></div>
            <div class="panel-body">
              @if (!editMode()) {
                <div class="detail-grid">
                  <div class="detail-field"><label>TXN ID</label><span>{{ selectedItem?.id }}</span></div>
                  <div class="detail-field"><label>Customer</label><span>{{ selectedItem?.customerName }}</span></div>
                  <div class="detail-field"><label>Type</label><span>{{ selectedItem?.type }}</span></div>
                  <div class="detail-field"><label>Amount</label><span>{{ selectedItem?.amount }}</span></div>
                  <div class="detail-field"><label>Merchant</label><span>{{ selectedItem?.merchant }}</span></div>
                  <div class="detail-field"><label>Channel</label><span>{{ selectedItem?.channel }}</span></div>
                  <div class="detail-field"><label>Location</label><span>{{ selectedItem?.location }}</span></div>
                  <div class="detail-field"><label>Score</label><span>{{ selectedItem?.fraudScore }}</span></div>
                  <div class="detail-field"><label>Status</label><span>{{ selectedItem?.status }}</span></div>
                </div>
                <div class="panel-actions"><button class="btn-primary" (click)="editMode.set(true)"><i class="pi pi-pencil"></i> Edit</button><button class="btn-outline" (click)="showDetail.set(false)">Close</button></div>
              }
              @if (editMode()) {
                <div class="form-grid">
                  <div class="field"><label>Customer</label><input type="text" [(ngModel)]="newItem.customerName" placeholder="Enter customer" /></div>
                <div class="field"><label>Type</label><select [(ngModel)]="newItem.type"><option value="">Select...</option><option value="PURCHASE">PURCHASE</option><option value="TRANSFER">TRANSFER</option><option value="WITHDRAWAL">WITHDRAWAL</option></select></div>
                <div class="field"><label>Amount</label><input type="number" [(ngModel)]="newItem.amount" placeholder="Enter amount" /></div>
                <div class="field"><label>Merchant</label><input type="text" [(ngModel)]="newItem.merchant" placeholder="Enter merchant" /></div>
                <div class="field"><label>Channel</label><select [(ngModel)]="newItem.channel"><option value="">Select...</option><option value="ATM">ATM</option><option value="POS">POS</option><option value="ONLINE">ONLINE</option><option value="MOBILE">MOBILE</option></select></div>
                <div class="field"><label>Location</label><input type="text" [(ngModel)]="newItem.location" placeholder="Enter location" /></div>
                </div>
                <div class="panel-actions"><button class="btn-primary" (click)="saveEdit()"><i class="pi pi-check"></i> Save</button><button class="btn-outline" (click)="editMode.set(false)">Cancel</button></div>
              }
            </div>
          </div>
        </div>
      }

      @if (showCreate()) {
        <div class="overlay" (click)="showCreate.set(false)">
          <div class="side-panel" (click)="$event.stopPropagation()">
            <div class="panel-header"><h2>Create New</h2><button class="close-btn" (click)="showCreate.set(false)"><i class="pi pi-times"></i></button></div>
            <div class="panel-tabs"><button class="panel-tab" [class.active]="detailTab()==='info'" (click)="detailTab.set('info')">Transaction</button><button class="panel-tab" [class.active]="detailTab()==='risk'" (click)="detailTab.set('risk')">Risk Analysis</button><button class="panel-tab" [class.active]="detailTab()==='related'" (click)="detailTab.set('related')">Related Txns</button><button class="panel-tab" [class.active]="detailTab()==='trail'" (click)="detailTab.set('trail')">Audit Trail</button></div>
            <div class="panel-body">
              <div class="form-grid">
                <div class="field"><label>Customer</label><input type="text" [(ngModel)]="newItem.customerName" placeholder="Enter customer" /></div>
                <div class="field"><label>Type</label><select [(ngModel)]="newItem.type"><option value="">Select...</option><option value="PURCHASE">PURCHASE</option><option value="TRANSFER">TRANSFER</option><option value="WITHDRAWAL">WITHDRAWAL</option></select></div>
                <div class="field"><label>Amount</label><input type="number" [(ngModel)]="newItem.amount" placeholder="Enter amount" /></div>
                <div class="field"><label>Merchant</label><input type="text" [(ngModel)]="newItem.merchant" placeholder="Enter merchant" /></div>
                <div class="field"><label>Channel</label><select [(ngModel)]="newItem.channel"><option value="">Select...</option><option value="ATM">ATM</option><option value="POS">POS</option><option value="ONLINE">ONLINE</option><option value="MOBILE">MOBILE</option></select></div>
                <div class="field"><label>Location</label><input type="text" [(ngModel)]="newItem.location" placeholder="Enter location" /></div>
              </div>
              <div class="panel-actions"><button class="btn-outline" (click)="showCreate.set(false)">Cancel</button><button class="btn-primary" (click)="createItem()"><i class="pi pi-plus"></i> Create</button></div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .page { max-width: 1600px; margin: 0 auto; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; flex-wrap: wrap; gap: 12px; }
    .page-header h1 { font-size: 28px; font-weight: 800; color: #0f172a; margin: 0; }
    .page-header p { font-size: 14px; color: #64748b; margin: 4px 0 0; }
    .page-actions { display: flex; gap: 10px; }
    .btn-outline, .btn-primary { padding: 10px 20px; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 6px; border: none; transition: all 0.2s; }
    .btn-outline { background: #fff; border: 1px solid #e2e8f0; color: #475569; }
    .btn-outline:hover { background: #f8fafc; }
    .btn-primary { background: linear-gradient(135deg, #1e3a8a, #2563eb); color: #fff; }
    .btn-primary:hover { box-shadow: 0 4px 12px rgba(37,99,235,0.3); }
    .hero-section { position: relative; border-radius: 16px; overflow: hidden; height: 140px; margin-bottom: 20px; }
    .hero-img { width: 100%; height: 100%; object-fit: cover; }
    .hero-ov { position: absolute; inset: 0; background: linear-gradient(135deg, rgba(15,23,42,0.85), rgba(30,58,138,0.7)); display: flex; flex-direction: column; justify-content: center; padding: 0 32px; }
    .hero-ov h2 { font-size: 24px; font-weight: 800; color: #fff; margin: 0 0 4px; }
    .hero-ov p { font-size: 14px; color: rgba(255,255,255,0.7); margin: 0; }
    .kpi-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 20px; }
    .kpi-card { display: flex; align-items: center; gap: 14px; padding: 18px; background: #fff; border-radius: 14px; border: 1px solid #e2e8f0; }
    .kpi-icon { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 18px; }
    .kpi-icon.blue { background: #eff6ff; color: #3b82f6; } .kpi-icon.red { background: #fef2f2; color: #ef4444; } .kpi-icon.green { background: #f0fdf4; color: #22c55e; } .kpi-icon.orange { background: #fffbeb; color: #f59e0b; }
    .kpi-val { font-size: 22px; font-weight: 800; color: #0f172a; display: block; }
    .kpi-lbl { font-size: 12px; color: #64748b; }
    .tabs { display: flex; gap: 4px; margin-bottom: 20px; background: #fff; border-radius: 12px; padding: 4px; border: 1px solid #e2e8f0; }
    .tab { padding: 10px 20px; border-radius: 8px; border: none; background: none; font-size: 14px; font-weight: 500; color: #64748b; cursor: pointer; transition: all 0.2s; }
    .tab.active { background: #1e3a8a; color: #fff; } .tab:hover:not(.active) { background: #f1f5f9; }
    .filter-bar { display: flex; gap: 10px; margin-bottom: 14px; align-items: center; flex-wrap: wrap; }
    .search-input { padding: 10px 16px; border: 1px solid #e2e8f0; border-radius: 10px; font-size: 14px; width: 260px; outline: none; }
    .search-input:focus { border-color: #2563eb; }
    .filter-select { padding: 10px 14px; border: 1px solid #e2e8f0; border-radius: 10px; font-size: 13px; background: #fff; cursor: pointer; }
    .result-count { font-size: 13px; color: #64748b; margin-left: auto; }
    .data-table { background: #fff; border-radius: 14px; border: 1px solid #e2e8f0; overflow: auto; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    thead th { text-align: left; padding: 12px; background: #f8fafc; color: #64748b; font-size: 11px; font-weight: 600; text-transform: uppercase; border-bottom: 2px solid #e2e8f0; white-space: nowrap; cursor: pointer; }
    th:hover { color: #2563eb; }
    tbody td { padding: 10px 12px; border-bottom: 1px solid #f1f5f9; color: #334155; white-space: nowrap; }
    tbody tr { cursor: pointer; transition: background 0.15s; } tbody tr:hover { background: #f8fafc; } tbody tr.selected { background: #eff6ff; }
    .mono { font-family: monospace; font-size: 12px; }
    .status-pill { font-size: 11px; padding: 3px 10px; border-radius: 20px; background: #f1f5f9; color: #475569; font-weight: 600; }
    .priority-tag { padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; }
    .p-high { background: #fef2f2; color: #ef4444; } .p-medium { background: #fffbeb; color: #f59e0b; } .p-low { background: #f0fdf4; color: #22c55e; }
    .level-tag { padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; }
    .lvl-critical,.lvl-high { background: #fef2f2; color: #ef4444; } .lvl-medium { background: #fffbeb; color: #f59e0b; } .lvl-low { background: #f0fdf4; color: #22c55e; }
    .actions-cell { display: flex; gap: 4px; }
    .icon-btn { width: 30px; height: 30px; border-radius: 6px; border: 1px solid #e2e8f0; background: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center; }
    .icon-btn:hover { background: #f1f5f9; } .icon-btn.danger:hover { background: #fef2f2; border-color: #fecaca; }
    .icon-btn i { font-size: 12px; color: #64748b; }
    .pagination { display: flex; align-items: center; justify-content: center; gap: 12px; padding: 14px; }
    .pagination button { padding: 8px 14px; border: 1px solid #e2e8f0; border-radius: 8px; background: #fff; cursor: pointer; }
    .pagination button:disabled { opacity: 0.4; cursor: default; }
    .pagination span { font-size: 13px; color: #64748b; }
    .overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 200; display: flex; justify-content: flex-end; }
    .side-panel { width: 680px; max-width: 92vw; background: #fff; height: 100vh; overflow-y: auto; box-shadow: -10px 0 40px rgba(0,0,0,0.15); animation: slideIn 0.3s ease; }
    @keyframes slideIn { from { transform: translateX(100%); } }
    .panel-header { display: flex; justify-content: space-between; align-items: flex-start; padding: 24px; border-bottom: 1px solid #e2e8f0; }
    .panel-id { font-size: 12px; font-family: monospace; color: #64748b; }
    .panel-header h2 { font-size: 20px; font-weight: 700; color: #0f172a; margin: 4px 0 0; }
    .close-btn { background: #f1f5f9; border: none; width: 36px; height: 36px; border-radius: 10px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
    .close-btn:hover { background: #e2e8f0; }
    .panel-body { padding: 24px; }
    .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; }
    .detail-field label { font-size: 11px; font-weight: 600; color: #94a3b8; text-transform: uppercase; display: block; margin-bottom: 4px; }
    .detail-field span { font-size: 14px; color: #1e293b; font-weight: 500; }
    .panel-actions { display: flex; gap: 10px; margin-top: 20px; padding-top: 16px; border-top: 1px solid #f1f5f9; }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .field { display: flex; flex-direction: column; gap: 6px; }
    .field.full { grid-column: span 2; }
    .field label { font-size: 13px; font-weight: 600; color: #374151; }
    .field input, .field select, .field textarea { padding: 10px 14px; border: 1px solid #e2e8f0; border-radius: 10px; font-size: 14px; outline: none; font-family: inherit; }
    .field input:focus, .field select:focus, .field textarea:focus { border-color: #2563eb; }
    @media (max-width: 1024px) { .kpi-row { grid-template-columns: repeat(2, 1fr); } .detail-grid,.form-grid { grid-template-columns: 1fr; } .field.full { grid-column: span 1; } }
`]
})
export class TransactionMonitoringComponent implements OnInit {
  activeTab = signal('live');
  showDetail = signal(false);
  detailTab = signal('info');
  showCreate = signal(false);
  editMode = signal(false);
  page = signal(1);
  pageSize = 12;
  searchTerm = '';
  sortField = '';
  sortDir: 'asc'|'desc' = 'asc';
  filters: any = { channel: '', status: '' };
  selectedItem: any = null;
  newItem: any = { customerName: '', type: '', amount: '', merchant: '', channel: '', location: '' };

  allData: any[] = [];
  filtered: any[] = [];

  constructor(public mockData: MockDataService, public interact: InteractionService) {}

  ngOnInit() { this.allData = this.mockData.getTransactions(); this.filtered = [...this.allData]; }

  paginated = computed(() => { const s = (this.page() - 1) * this.pageSize; return this.filtered.slice(s, s + this.pageSize); });
  totalPages = computed(() => Math.ceil(this.filtered.length / this.pageSize) || 1);

  applyFilters() {
    let r = [...this.allData];
    if (this.searchTerm) { const q = this.searchTerm.toLowerCase(); r = r.filter(item => ['id','customerName','merchant','location'].some((f: string) => String((item as any)[f] || '').toLowerCase().includes(q))); }
    Object.entries(this.filters).forEach(([k, v]) => { if (v) r = r.filter(i => (i as any)[k] === v); });
    if (this.sortField) { r.sort((a: any, b: any) => { const va = a[this.sortField], vb = b[this.sortField]; return this.sortDir === 'asc' ? (va < vb ? -1 : 1) : (va > vb ? -1 : 1); }); }
    this.filtered = r;
    this.page.set(1);
  }

  sortBy(f: string) { if (this.sortField === f) this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc'; else { this.sortField = f; this.sortDir = 'asc'; } this.applyFilters(); }

  viewItem(item: any) { this.selectedItem = { ...item }; this.editMode.set(false); this.detailTab.set('info'); this.showDetail.set(true); }
  editItem(item: any) { this.selectedItem = { ...item }; this.newItem = { ...item }; this.editMode.set(true); this.detailTab.set('info'); this.showDetail.set(true); }

  saveEdit() {
    const idx = this.allData.findIndex(x => x.id === this.selectedItem.id);
    if (idx >= 0) { Object.assign(this.allData[idx], this.newItem); this.applyFilters(); this.interact.success('Updated successfully'); this.showDetail.set(false); }
  }

  deleteItem(item: any) { if (confirm('Delete ' + item.id + '?')) { this.allData = this.allData.filter(x => x.id !== item.id); this.applyFilters(); this.interact.success('Deleted successfully'); } }

  createItem() {
    const id = 'TRA-' + String(Date.now()).slice(-6);
    this.allData.unshift({ ...this.newItem, id, createdAt: new Date(), status: 'NEW' });
    this.applyFilters();
    this.newItem = { customerName: '', type: '', amount: '', merchant: '', channel: '', location: '' };
    this.showCreate.set(false);
    this.interact.success('Created: ' + id);
  }

  exportData() {
    const cols = ['id', 'customerName', 'type', 'amount', 'merchant', 'channel', 'fraudScore', 'status'];
    this.interact.exportCSV(this.filtered, 'transaction-monitoring', cols);
  }
}
