import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MockDataService } from '../../core/services/mock-data.service';
import { InteractionService } from '../../core/services/interaction.service';

@Component({
  selector: 'app-case-management',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="page">
      <div class="page-header">
        <div><h1>Case Management</h1><p>Investigation case workspace & task management</p></div>
        <div class="page-actions">
          <button class="btn-outline" (click)="exportData()"><i class="pi pi-download"></i> Export</button>
          <button class="btn-primary" (click)="showCreate.set(true)"><i class="pi pi-plus"></i> Create New</button>
        </div>
      </div>
      <div class="hero-section"><img src="assets/images/case-management-bg.png" class="hero-img" /><div class="hero-ov"><h2>Case Management</h2><p>Investigation case workspace & task management</p></div></div>
      <div class="kpi-row">
        <div class="kpi-card"><div class="kpi-icon blue"><i class="pi pi-briefcase"></i></div><div><span class="kpi-val">28</span><span class="kpi-lbl">Open</span></div></div>
        <div class="kpi-card"><div class="kpi-icon orange"><i class="pi pi-search"></i></div><div><span class="kpi-val">15</span><span class="kpi-lbl">Investigating</span></div></div>
        <div class="kpi-card"><div class="kpi-icon red"><i class="pi pi-clock"></i></div><div><span class="kpi-val">4.2d</span><span class="kpi-lbl">Avg Time</span></div></div>
        <div class="kpi-card"><div class="kpi-icon green"><i class="pi pi-check"></i></div><div><span class="kpi-val">92%</span><span class="kpi-lbl">SLA</span></div></div>
      </div>
      <div class="tabs">
        <button class="tab" [class.active]="activeTab() === 'cases'" (click)="activeTab.set('cases')">Cases</button>
        <button class="tab" [class.active]="activeTab() === 'tasks'" (click)="activeTab.set('tasks')">Tasks</button>
        <button class="tab" [class.active]="activeTab() === 'reports'" (click)="activeTab.set('reports')">Reports</button>
      </div>

      @if (activeTab() === 'cases') {
        <div class="filter-bar">
          <input type="text" placeholder="Search..." class="search-input" [(ngModel)]="searchTerm" (input)="applyFilters()" />
          <select [(ngModel)]="filters['type']" (change)="applyFilters()" class="filter-select"><option value="">All Types</option><option value="FRAUD">FRAUD</option><option value="AML">AML</option><option value="COMPLIANCE">COMPLIANCE</option></select>
          <select [(ngModel)]="filters['priority']" (change)="applyFilters()" class="filter-select"><option value="">All Priority</option><option value="HIGH">HIGH</option><option value="MEDIUM">MEDIUM</option><option value="LOW">LOW</option></select>
          <select [(ngModel)]="filters['status']" (change)="applyFilters()" class="filter-select"><option value="">All Status</option><option value="OPEN">OPEN</option><option value="IN_PROGRESS">IN_PROGRESS</option><option value="RESOLVED">RESOLVED</option><option value="CLOSED">CLOSED</option></select>
          
          <span class="result-count">{{ filtered.length }} records</span>
        </div>
        <div class="data-table">
          <table>
            <thead><tr><th (click)="sortBy('id')">Case ID</th><th (click)="sortBy('title')">Title</th><th (click)="sortBy('type')">Type</th><th (click)="sortBy('customerName')">Customer</th><th (click)="sortBy('fraudAmount')">Amount</th><th (click)="sortBy('priority')">Priority</th><th (click)="sortBy('status')">Status</th><th (click)="sortBy('assignedToName')">Assigned</th><th>Actions</th></tr></thead>
            <tbody>
              @for (item of paginated(); track $index) {
                <tr (click)="viewItem(item)" [class.selected]="selectedItem?.id === item.id">
                  <td>{{ item.id }}</td><td>{{ item.title }}</td><td>{{ item.type }}</td><td>{{ item.customerName }}</td><td class="mono">{{ item.fraudAmount | number }}</td><td><span class="priority-tag" [class]="'p-' + (item.priority || '').toLowerCase()">{{ item.priority }}</span></td><td><span class="status-pill">{{ item.status }}</span></td><td>{{ item.assignedToName }}</td>
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

      @if (activeTab() === 'tasks') {
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:16px;"><div class="kpi-card" style="border-left:4px solid #ef4444"><div class="kpi-icon red"><i class="pi pi-clock"></i></div><div><span class="kpi-val">3</span><span class="kpi-lbl">Overdue</span></div></div><div class="kpi-card" style="border-left:4px solid #f59e0b"><div class="kpi-icon orange"><i class="pi pi-calendar"></i></div><div><span class="kpi-val">5</span><span class="kpi-lbl">Due Today</span></div></div><div class="kpi-card" style="border-left:4px solid #22c55e"><div class="kpi-icon green"><i class="pi pi-check-circle"></i></div><div><span class="kpi-val">12</span><span class="kpi-lbl">Done This Week</span></div></div></div>
        <div class="data-table"><table><thead><tr><th>Task</th><th>Case</th><th>Priority</th><th>Due</th><th>Status</th><th>Actions</th></tr></thead><tbody><tr><td>Review transaction records</td><td class="mono">CAS-FRD-035</td><td><span class="priority-tag p-high">HIGH</span></td><td>Feb 16</td><td><span class="status-pill">IN_PROGRESS</span></td><td><button class="btn-primary" style="padding:6px 14px;font-size:12px" (click)="interact.success('Task completed!')">Complete</button></td></tr><tr><td>Interview customer</td><td class="mono">CAS-AML-028</td><td><span class="priority-tag p-medium">MEDIUM</span></td><td>Feb 18</td><td><span class="status-pill">PENDING</span></td><td><button class="btn-outline" style="padding:6px 14px;font-size:12px" (click)="interact.info('Task started')">Start</button></td></tr><tr><td>Prepare SAR filing</td><td class="mono">CAS-AML-030</td><td><span class="priority-tag p-high">HIGH</span></td><td style="color:#ef4444">Feb 15</td><td><span class="status-pill" style="background:#fef2f2;color:#ef4444">OVERDUE</span></td><td><button class="btn-primary" style="padding:6px 14px;font-size:12px;background:#ef4444" (click)="interact.warn('Task escalated!')">Urgent</button></td></tr><tr><td>Update risk assessment</td><td class="mono">CAS-RSK-015</td><td><span class="priority-tag p-low">LOW</span></td><td>Feb 20</td><td><span class="status-pill">PENDING</span></td><td><button class="btn-outline" style="padding:6px 14px;font-size:12px" (click)="interact.info('Task started')">Start</button></td></tr><tr><td>Collect evidence docs</td><td class="mono">CAS-FRD-032</td><td><span class="priority-tag p-medium">MEDIUM</span></td><td>Feb 17</td><td><span class="status-pill">IN_PROGRESS</span></td><td><button class="btn-primary" style="padding:6px 14px;font-size:12px" (click)="interact.success('Task completed!')">Complete</button></td></tr></tbody></table></div>
      }

      @if (activeTab() === 'reports') {
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;"><div class="kpi-card" style="flex-direction:column;align-items:flex-start;gap:8px"><h4 style="font-size:14px;font-weight:700;margin:0"><i class="pi pi-chart-bar" style="color:#3b82f6;margin-right:6px"></i>Case Volume</h4><p style="font-size:12px;color:#64748b;margin:0">Monthly breakdown</p><button class="btn-primary" style="padding:6px 14px;font-size:12px;margin-top:4px" (click)="interact.success('Report generated!')">Generate</button></div><div class="kpi-card" style="flex-direction:column;align-items:flex-start;gap:8px"><h4 style="font-size:14px;font-weight:700;margin:0"><i class="pi pi-clock" style="color:#f59e0b;margin-right:6px"></i>Resolution Time</h4><p style="font-size:12px;color:#64748b;margin:0">Avg by priority</p><button class="btn-primary" style="padding:6px 14px;font-size:12px;margin-top:4px" (click)="interact.success('Report generated!')">Generate</button></div><div class="kpi-card" style="flex-direction:column;align-items:flex-start;gap:8px"><h4 style="font-size:14px;font-weight:700;margin:0"><i class="pi pi-check-circle" style="color:#22c55e;margin-right:6px"></i>SLA Compliance</h4><p style="font-size:12px;color:#64748b;margin:0">Adherence metrics</p><button class="btn-primary" style="padding:6px 14px;font-size:12px;margin-top:4px" (click)="interact.success('Report generated!')">Generate</button></div><div class="kpi-card" style="flex-direction:column;align-items:flex-start;gap:8px"><h4 style="font-size:14px;font-weight:700;margin:0"><i class="pi pi-users" style="color:#8b5cf6;margin-right:6px"></i>Team Performance</h4><p style="font-size:12px;color:#64748b;margin:0">Workload & completion</p><button class="btn-primary" style="padding:6px 14px;font-size:12px;margin-top:4px" (click)="interact.success('Report generated!')">Generate</button></div><div class="kpi-card" style="flex-direction:column;align-items:flex-start;gap:8px"><h4 style="font-size:14px;font-weight:700;margin:0"><i class="pi pi-dollar" style="color:#ef4444;margin-right:6px"></i>Financial Impact</h4><p style="font-size:12px;color:#64748b;margin:0">Loss prevention</p><button class="btn-primary" style="padding:6px 14px;font-size:12px;margin-top:4px" (click)="interact.success('Report generated!')">Generate</button></div><div class="kpi-card" style="flex-direction:column;align-items:flex-start;gap:8px"><h4 style="font-size:14px;font-weight:700;margin:0"><i class="pi pi-calendar" style="color:#06b6d4;margin-right:6px"></i>Monthly Summary</h4><p style="font-size:12px;color:#64748b;margin:0">Executive summary</p><button class="btn-primary" style="padding:6px 14px;font-size:12px;margin-top:4px" (click)="interact.success('Report generated!')">Generate</button></div></div>
      }

      @if (showDetail()) {
        <div class="overlay" (click)="showDetail.set(false)">
          <div class="side-panel" (click)="$event.stopPropagation()">
            <div class="panel-header"><div><span class="panel-id">{{ selectedItem?.id }}</span><h2>{{ editMode() ? 'Edit' : 'View' }} Record</h2></div><button class="close-btn" (click)="showDetail.set(false)"><i class="pi pi-times"></i></button></div>
            <div class="panel-body">
              <div class="panel-tabs">
                <button class="panel-tab" [class.active]="detailTab()==='info'" (click)="detailTab.set('info')">Overview</button>
                <button class="panel-tab" [class.active]="detailTab()==='evidence'" (click)="detailTab.set('evidence')">Evidence</button>
                <button class="panel-tab" [class.active]="detailTab()==='investigation'" (click)="detailTab.set('investigation')">Investigation</button>
                <button class="panel-tab" [class.active]="detailTab()==='transactions'" (click)="detailTab.set('transactions')">Transactions</button>
                <button class="panel-tab" [class.active]="detailTab()==='comms'" (click)="detailTab.set('comms')">Communications</button>
                <button class="panel-tab" [class.active]="detailTab()==='financial'" (click)="detailTab.set('financial')">Financial</button>
                <button class="panel-tab" [class.active]="detailTab()==='collab'" (click)="detailTab.set('collab')">Collaboration</button>
              </div>
              @if (!editMode()) {
                <div class="detail-grid">
                  <div class="detail-field"><label>Case ID</label><span>{{ selectedItem?.id }}</span></div>
                  <div class="detail-field"><label>Title</label><span>{{ selectedItem?.title }}</span></div>
                  <div class="detail-field"><label>Type</label><span>{{ selectedItem?.type }}</span></div>
                  <div class="detail-field"><label>Customer</label><span>{{ selectedItem?.customerName }}</span></div>
                  <div class="detail-field"><label>Amount</label><span>{{ selectedItem?.fraudAmount }}</span></div>
                  <div class="detail-field"><label>Priority</label><span>{{ selectedItem?.priority }}</span></div>
                  <div class="detail-field"><label>Status</label><span>{{ selectedItem?.status }}</span></div>
                  <div class="detail-field"><label>Assigned To</label><span>{{ selectedItem?.assignedToName }}</span></div>
                </div>
                <div class="panel-actions"><button class="btn-primary" (click)="editMode.set(true)"><i class="pi pi-pencil"></i> Edit</button><button class="btn-outline" (click)="showDetail.set(false)">Close</button></div>
              }
              @if (editMode()) {
                <div class="form-grid">
                  <div class="field full"><label>Title</label><input type="text" [(ngModel)]="newItem.title" placeholder="Enter title" /></div>
                <div class="field"><label>Type</label><select [(ngModel)]="newItem.type"><option value="">Select...</option><option value="FRAUD">FRAUD</option><option value="AML">AML</option><option value="COMPLIANCE">COMPLIANCE</option></select></div>
                <div class="field"><label>Customer</label><input type="text" [(ngModel)]="newItem.customerName" placeholder="Enter customer" /></div>
                <div class="field"><label>Amount</label><input type="number" [(ngModel)]="newItem.fraudAmount" placeholder="Enter amount" /></div>
                <div class="field"><label>Priority</label><select [(ngModel)]="newItem.priority"><option value="">Select...</option><option value="HIGH">HIGH</option><option value="MEDIUM">MEDIUM</option><option value="LOW">LOW</option></select></div>
                <div class="field full"><label>Description</label><textarea rows="3" [(ngModel)]="newItem.description" placeholder="Enter description..."></textarea></div>
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
            <div class="panel-body">
              <div class="form-grid">
                <div class="field full"><label>Title</label><input type="text" [(ngModel)]="newItem.title" placeholder="Enter title" /></div>
                <div class="field"><label>Type</label><select [(ngModel)]="newItem.type"><option value="">Select...</option><option value="FRAUD">FRAUD</option><option value="AML">AML</option><option value="COMPLIANCE">COMPLIANCE</option></select></div>
                <div class="field"><label>Customer</label><input type="text" [(ngModel)]="newItem.customerName" placeholder="Enter customer" /></div>
                <div class="field"><label>Amount</label><input type="number" [(ngModel)]="newItem.fraudAmount" placeholder="Enter amount" /></div>
                <div class="field"><label>Priority</label><select [(ngModel)]="newItem.priority"><option value="">Select...</option><option value="HIGH">HIGH</option><option value="MEDIUM">MEDIUM</option><option value="LOW">LOW</option></select></div>
                <div class="field full"><label>Description</label><textarea rows="3" [(ngModel)]="newItem.description" placeholder="Enter description..."></textarea></div>
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
export class CaseManagementComponent implements OnInit {
  activeTab = signal('cases');
  showDetail = signal(false);
  showCreate = signal(false);
  detailTab = signal('info');
  editMode = signal(false);
  page = signal(1);
  pageSize = 12;
  searchTerm = '';
  sortField = '';
  sortDir: 'asc'|'desc' = 'asc';
  filters: any = { type: '', priority: '', status: '' };
  selectedItem: any = null;
  newItem: any = { title: '', type: '', customerName: '', fraudAmount: '', priority: '', description: '' };

  allData: any[] = [];
  filtered: any[] = [];

  constructor(public mockData: MockDataService, public interact: InteractionService) {}

  ngOnInit() { this.allData = this.mockData.getCases(); this.filtered = [...this.allData]; }

  paginated = computed(() => { const s = (this.page() - 1) * this.pageSize; return this.filtered.slice(s, s + this.pageSize); });
  totalPages = computed(() => Math.ceil(this.filtered.length / this.pageSize) || 1);

  applyFilters() {
    let r = [...this.allData];
    if (this.searchTerm) { const q = this.searchTerm.toLowerCase(); r = r.filter(item => ['id','title','customerName'].some((f: string) => String((item as any)[f] || '').toLowerCase().includes(q))); }
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
    const id = 'CAS-' + String(Date.now()).slice(-6);
    this.allData.unshift({ ...this.newItem, id, createdAt: new Date(), status: 'NEW' });
    this.applyFilters();
    this.newItem = { title: '', type: '', customerName: '', fraudAmount: '', priority: '', description: '' };
    this.showCreate.set(false);
    this.interact.success('Created: ' + id);
  }

  exportData() {
    const cols = ['id', 'title', 'type', 'customerName', 'fraudAmount', 'priority', 'status', 'assignedToName'];
    this.interact.exportCSV(this.filtered, 'case-management', cols);
  }
}
