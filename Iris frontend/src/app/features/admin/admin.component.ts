import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MockDataService } from '../../core/services/mock-data.service';
import { InteractionService } from '../../core/services/interaction.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="page">
      <div class="page-header">
        <div><h1>Administration</h1><p>System configuration, users, roles & monitoring</p></div>
        <div class="page-actions">
          <button class="btn-outline" (click)="exportData()"><i class="pi pi-download"></i> Export</button>
          <button class="btn-primary" (click)="showCreate.set(true)"><i class="pi pi-plus"></i> Create New</button>
        </div>
      </div>
      <div class="hero-section"><img src="assets/images/hero-banner.png" class="hero-img" /><div class="hero-ov"><h2>Administration</h2><p>System configuration, users, roles & monitoring</p></div></div>
      <div class="kpi-row">
        <div class="kpi-card"><div class="kpi-icon blue"><i class="pi pi-users"></i></div><div><span class="kpi-val">8</span><span class="kpi-lbl">Users</span></div></div>
        <div class="kpi-card"><div class="kpi-icon green"><i class="pi pi-id-card"></i></div><div><span class="kpi-val">8</span><span class="kpi-lbl">Roles</span></div></div>
        <div class="kpi-card"><div class="kpi-icon orange"><i class="pi pi-server"></i></div><div><span class="kpi-val">9</span><span class="kpi-lbl">Services</span></div></div>
        <div class="kpi-card"><div class="kpi-icon green"><i class="pi pi-check-circle"></i></div><div><span class="kpi-val">99.9%</span><span class="kpi-lbl">Uptime</span></div></div>
      </div>
      <div class="tabs">
        <button class="tab" [class.active]="activeTab() === 'users'" (click)="activeTab.set('users')">Users</button>
        <button class="tab" [class.active]="activeTab() === 'roles'" (click)="activeTab.set('roles')">Roles</button>
        <button class="tab" [class.active]="activeTab() === 'system'" (click)="activeTab.set('system')">System</button>
        <button class="tab" [class.active]="activeTab() === 'audit'" (click)="activeTab.set('audit')">Audit Logs</button>
      </div>

      @if (activeTab() === 'users') {
        <div class="filter-bar">
          <input type="text" placeholder="Search..." class="search-input" [(ngModel)]="searchTerm" (input)="applyFilters()" />
          <select [(ngModel)]="filters['status']" (change)="applyFilters()" class="filter-select"><option value="">All Status</option><option value="ACTIVE">ACTIVE</option><option value="INACTIVE">INACTIVE</option></select>
          <select [(ngModel)]="filters['department']" (change)="applyFilters()" class="filter-select"><option value="">All Depts</option><option value="Risk Management">Risk Management</option><option value="Fraud Prevention">Fraud Prevention</option><option value="AML">AML</option><option value="Compliance">Compliance</option><option value="IT">IT</option></select>
          
          <span class="result-count">{{ filtered.length }} records</span>
        </div>
        <div class="data-table">
          <table>
            <thead><tr><th (click)="sortBy('id')">ID</th><th (click)="sortBy('fullName')">Name</th><th (click)="sortBy('username')">Username</th><th (click)="sortBy('email')">Email</th><th (click)="sortBy('department')">Dept</th><th (click)="sortBy('role')">Role</th><th (click)="sortBy('status')">Status</th><th>Actions</th></tr></thead>
            <tbody>
              @for (item of paginated(); track $index) {
                <tr (click)="viewItem(item)" [class.selected]="selectedItem?.id === item.id">
                  <td>{{ item.id }}</td><td>{{ item.fullName }}</td><td>{{ item.username }}</td><td>{{ item.email }}</td><td>{{ item.department }}</td><td>{{ item.role }}</td><td><span class="status-pill">{{ item.status }}</span></td>
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

      @if (activeTab() === 'roles') {
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px">@for(r of roles;track $index){<div class="kpi-card" style="flex-direction:column;align-items:flex-start;gap:6px"><h4 style="font-size:14px;font-weight:700;margin:0">{{ r.name }}</h4><p style="font-size:12px;color:#64748b;margin:0">{{ r.desc }}</p><button class="btn-outline" style="padding:6px 14px;font-size:12px;margin-top:4px" (click)="interact.info('Editing ' + r.name + ' permissions')">Edit Permissions</button></div>}</div>
      }

      @if (activeTab() === 'system') {
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px">@for(svc of systemHealth;track $index){<div class="kpi-card" style="flex-direction:column;align-items:flex-start;gap:8px"><div style="display:flex;justify-content:space-between;width:100%;align-items:center"><strong style="font-size:14px">{{ svc.service }}</strong><div style="width:10px;height:10px;border-radius:50%" [style.background]="svc.status==='UP'?'#22c55e':'#f59e0b'" [style.box-shadow]="svc.status==='UP'?'0 0 6px rgba(34,197,94,0.4)':'none'"></div></div><div style="width:100%;font-size:12px;color:#64748b"><div style="display:flex;justify-content:space-between"><span>CPU</span><span style="font-weight:600;color:#1e293b">{{ svc.cpu }}%</span></div><div style="height:5px;background:#f1f5f9;border-radius:3px;margin:3px 0 6px"><div [style.width.%]="svc.cpu" style="height:100%;border-radius:3px" [style.background]="svc.cpu>80?'#ef4444':svc.cpu>60?'#f59e0b':'#22c55e'"></div></div><div style="display:flex;justify-content:space-between"><span>Memory</span><span style="font-weight:600;color:#1e293b">{{ svc.memory }}%</span></div><div style="height:5px;background:#f1f5f9;border-radius:3px;margin:3px 0 6px"><div [style.width.%]="svc.memory" style="height:100%;border-radius:3px" [style.background]="svc.memory>80?'#ef4444':svc.memory>60?'#f59e0b':'#22c55e'"></div></div><div style="display:flex;justify-content:space-between"><span>Response</span><span style="font-weight:600;color:#1e293b">{{ svc.responseTime }}ms</span></div></div></div>}</div>
      }

      @if (activeTab() === 'audit') {
        <div class="filter-bar"><input type="text" placeholder="Search logs..." class="search-input" [(ngModel)]="auditSearch" (input)="filterAuditLogs()" /><select [(ngModel)]="auditActionFilter" (change)="filterAuditLogs()" class="filter-select"><option value="">All Actions</option><option>LOGIN</option><option>UPDATE</option><option>CREATE</option></select><span class="result-count">{{ filteredAuditLogs.length }} entries</span></div>
        <div class="data-table"><table><thead><tr><th>Time</th><th>User</th><th>Action</th><th>Resource</th><th>Details</th><th>IP</th><th>Status</th></tr></thead><tbody>@for(log of filteredAuditLogs;track $index){<tr><td>{{ log.timestamp | date:'short' }}</td><td>{{ log.username }}</td><td><span class="status-pill">{{ log.action }}</span></td><td>{{ log.resource }}</td><td>{{ log.details }}</td><td class="mono">{{ log.ipAddress }}</td><td><span class="status-pill" [style.background]="log.status==='SUCCESS'?'#f0fdf4':'#fef2f2'" [style.color]="log.status==='SUCCESS'?'#22c55e':'#ef4444'">{{ log.status }}</span></td></tr>}</tbody></table></div>
      }

      
      @if(activeTab()==='org'){
        <h3 style="font-size:16px;font-weight:700;margin:0 0 12px">Organization Hierarchy</h3>
        <div style="display:flex;flex-direction:column;gap:4px;padding-left:0">
          <div style="padding:12px 16px;background:#1e3a8a;color:#fff;border-radius:10px;font-weight:700;font-size:14px"><i class="pi pi-building" style="margin-right:6px"></i> IRIS Financial Group</div>
          <div style="padding-left:32px;display:flex;flex-direction:column;gap:4px">
            <div style="padding:10px 16px;background:#fff;border:1px solid #e2e8f0;border-radius:8px;cursor:pointer;display:flex;justify-content:space-between;align-items:center" (click)="interact.info('Viewing department')"><span><i class="pi pi-sitemap" style="margin-right:6px;color:#3b82f6"></i><strong>Risk Management</strong> <span style="font-size:11px;color:#64748b">(12 members)</span></span><i class="pi pi-chevron-right" style="color:#94a3b8;font-size:10px"></i></div>
            <div style="padding:10px 16px;background:#fff;border:1px solid #e2e8f0;border-radius:8px;cursor:pointer;display:flex;justify-content:space-between;align-items:center" (click)="interact.info('Viewing department')"><span><i class="pi pi-sitemap" style="margin-right:6px;color:#ef4444"></i><strong>Fraud Prevention</strong> <span style="font-size:11px;color:#64748b">(8 members)</span></span><i class="pi pi-chevron-right" style="color:#94a3b8;font-size:10px"></i></div>
            <div style="padding:10px 16px;background:#fff;border:1px solid #e2e8f0;border-radius:8px;cursor:pointer;display:flex;justify-content:space-between;align-items:center" (click)="interact.info('Viewing department')"><span><i class="pi pi-sitemap" style="margin-right:6px;color:#22c55e"></i><strong>Compliance & AML</strong> <span style="font-size:11px;color:#64748b">(15 members)</span></span><i class="pi pi-chevron-right" style="color:#94a3b8;font-size:10px"></i></div>
            <div style="padding:10px 16px;background:#fff;border:1px solid #e2e8f0;border-radius:8px;cursor:pointer;display:flex;justify-content:space-between;align-items:center" (click)="interact.info('Viewing department')"><span><i class="pi pi-sitemap" style="margin-right:6px;color:#f59e0b"></i><strong>IT Security</strong> <span style="font-size:11px;color:#64748b">(10 members)</span></span><i class="pi pi-chevron-right" style="color:#94a3b8;font-size:10px"></i></div>
            <div style="padding:10px 16px;background:#fff;border:1px solid #e2e8f0;border-radius:8px;cursor:pointer;display:flex;justify-content:space-between;align-items:center" (click)="interact.info('Viewing department')"><span><i class="pi pi-sitemap" style="margin-right:6px;color:#8b5cf6"></i><strong>Data Science</strong> <span style="font-size:11px;color:#64748b">(6 members)</span></span><i class="pi pi-chevron-right" style="color:#94a3b8;font-size:10px"></i></div>
          </div>
        </div>
      }

      @if(activeTab()==='workflow'){
        <div style="display:flex;justify-content:space-between;margin-bottom:12px"><h3 style="font-size:16px;font-weight:700;margin:0">Workflow Definitions</h3><button class="btn-primary btn-sm" (click)="interact.info('Creating workflow...')"><i class="pi pi-plus"></i> New Workflow</button></div>
        <div class="data-table"><table><thead><tr><th>Workflow</th><th>Module</th><th>Steps</th><th>Avg Duration</th><th>Active Instances</th><th>Status</th><th>Actions</th></tr></thead><tbody>
          <tr><td><strong>Risk Assessment Approval</strong></td><td>Risk</td><td>4 steps</td><td>3.2 days</td><td>5</td><td><span class="status-pill s-active">ACTIVE</span></td><td class="actions-cell"><button class="icon-btn" (click)="interact.info('Editing...')"><i class="pi pi-pencil"></i></button></td></tr>
          <tr><td><strong>SAR Filing Process</strong></td><td>AML</td><td>6 steps</td><td>5.1 days</td><td>3</td><td><span class="status-pill s-active">ACTIVE</span></td><td class="actions-cell"><button class="icon-btn" (click)="interact.info('Editing...')"><i class="pi pi-pencil"></i></button></td></tr>
          <tr><td><strong>Fraud Investigation</strong></td><td>Fraud</td><td>5 steps</td><td>2.8 days</td><td>12</td><td><span class="status-pill s-active">ACTIVE</span></td><td class="actions-cell"><button class="icon-btn" (click)="interact.info('Editing...')"><i class="pi pi-pencil"></i></button></td></tr>
          <tr><td><strong>Model Deployment</strong></td><td>Model</td><td>7 steps</td><td>14 days</td><td>1</td><td><span class="status-pill s-active">ACTIVE</span></td><td class="actions-cell"><button class="icon-btn" (click)="interact.info('Editing...')"><i class="pi pi-pencil"></i></button></td></tr>
          <tr><td><strong>Policy Review</strong></td><td>Compliance</td><td>3 steps</td><td>7 days</td><td>2</td><td><span class="status-pill s-draft">DRAFT</span></td><td class="actions-cell"><button class="icon-btn" (click)="interact.info('Editing...')"><i class="pi pi-pencil"></i></button></td></tr>
        </tbody></table></div>
      }

      @if(activeTab()==='refdata'){
        <h3 style="font-size:16px;font-weight:700;margin:0 0 12px">Reference Data Management</h3>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px">
          <div class="kpi-card" style="flex-direction:column;align-items:flex-start;gap:8px;cursor:pointer" (click)="interact.info('Opening country codes...')"><div style="display:flex;align-items:center;gap:8px"><i class="pi pi-globe" style="color:#3b82f6"></i><strong style="font-size:14px">Country Codes</strong></div><span style="font-size:12px;color:#64748b">249 entries</span></div>
          <div class="kpi-card" style="flex-direction:column;align-items:flex-start;gap:8px;cursor:pointer" (click)="interact.info('Opening currency codes...')"><div style="display:flex;align-items:center;gap:8px"><i class="pi pi-dollar" style="color:#22c55e"></i><strong style="font-size:14px">Currency Codes</strong></div><span style="font-size:12px;color:#64748b">156 entries</span></div>
          <div class="kpi-card" style="flex-direction:column;align-items:flex-start;gap:8px;cursor:pointer" (click)="interact.info('Opening risk categories...')"><div style="display:flex;align-items:center;gap:8px"><i class="pi pi-exclamation-triangle" style="color:#ef4444"></i><strong style="font-size:14px">Risk Categories</strong></div><span style="font-size:12px;color:#64748b">18 entries</span></div>
          <div class="kpi-card" style="flex-direction:column;align-items:flex-start;gap:8px;cursor:pointer" (click)="interact.info('Opening transaction types...')"><div style="display:flex;align-items:center;gap:8px"><i class="pi pi-credit-card" style="color:#f59e0b"></i><strong style="font-size:14px">Transaction Types</strong></div><span style="font-size:12px;color:#64748b">32 entries</span></div>
          <div class="kpi-card" style="flex-direction:column;align-items:flex-start;gap:8px;cursor:pointer" (click)="interact.info('Opening alert reasons...')"><div style="display:flex;align-items:center;gap:8px"><i class="pi pi-bell" style="color:#8b5cf6"></i><strong style="font-size:14px">Alert Reasons</strong></div><span style="font-size:12px;color:#64748b">45 entries</span></div>
          <div class="kpi-card" style="flex-direction:column;align-items:flex-start;gap:8px;cursor:pointer" (click)="interact.info('Opening high-risk list...')"><div style="display:flex;align-items:center;gap:8px"><i class="pi pi-shield" style="color:#ef4444"></i><strong style="font-size:14px">High-Risk Countries</strong></div><span style="font-size:12px;color:#64748b">28 entries</span></div>
        </div>
      }

      @if (showDetail()) {
        <div class="overlay" (click)="showDetail.set(false)">
          <div class="side-panel" (click)="$event.stopPropagation()">
            <div class="panel-header"><div><span class="panel-id">{{ selectedItem?.id }}</span><h2>{{ editMode() ? 'Edit' : 'View' }} Record</h2></div><button class="close-btn" (click)="showDetail.set(false)"><i class="pi pi-times"></i></button></div>
            <div class="panel-tabs"><button class="panel-tab" [class.active]="detailTab()==='info'" (click)="detailTab.set('info')">Info</button><button class="panel-tab" [class.active]="detailTab()==='perms'" (click)="detailTab.set('perms')">Permissions</button><button class="panel-tab" [class.active]="detailTab()==='sessions'" (click)="detailTab.set('sessions')">Sessions</button><button class="panel-tab" [class.active]="detailTab()==='audit'" (click)="detailTab.set('audit')">Activity</button></div>
            <div class="panel-body">
              @if (!editMode()) {
                <div class="detail-grid">
                  <div class="detail-field"><label>ID</label><span>{{ selectedItem?.id }}</span></div>
                  <div class="detail-field"><label>Full Name</label><span>{{ selectedItem?.fullName }}</span></div>
                  <div class="detail-field"><label>Username</label><span>{{ selectedItem?.username }}</span></div>
                  <div class="detail-field"><label>Email</label><span>{{ selectedItem?.email }}</span></div>
                  <div class="detail-field"><label>Department</label><span>{{ selectedItem?.department }}</span></div>
                  <div class="detail-field"><label>Role</label><span>{{ selectedItem?.role }}</span></div>
                  <div class="detail-field"><label>Status</label><span>{{ selectedItem?.status }}</span></div>
                  <div class="detail-field"><label>Last Login</label><span>{{ selectedItem?.lastLogin }}</span></div>
                </div>
                <div class="panel-actions"><button class="btn-primary" (click)="editMode.set(true)"><i class="pi pi-pencil"></i> Edit</button><button class="btn-outline" (click)="showDetail.set(false)">Close</button></div>
              }
              @if (editMode()) {
                <div class="form-grid">
                  <div class="field full"><label>Full Name</label><input type="text" [(ngModel)]="newItem.fullName" placeholder="Enter full name" /></div>
                <div class="field"><label>Username</label><input type="text" [(ngModel)]="newItem.username" placeholder="Enter username" /></div>
                <div class="field"><label>Email</label><input type="email" [(ngModel)]="newItem.email" placeholder="Enter email" /></div>
                <div class="field"><label>Dept</label><select [(ngModel)]="newItem.department"><option value="">Select...</option><option value="Risk Management">Risk Management</option><option value="Fraud Prevention">Fraud Prevention</option><option value="AML">AML</option><option value="Compliance">Compliance</option><option value="IT">IT</option><option value="Executive">Executive</option></select></div>
                <div class="field"><label>Role</label><select [(ngModel)]="newItem.role"><option value="">Select...</option><option value="SYSTEM_ADMIN">SYSTEM_ADMIN</option><option value="RISK_MANAGER">RISK_MANAGER</option><option value="FRAUD_ANALYST">FRAUD_ANALYST</option><option value="AML_OFFICER">AML_OFFICER</option><option value="COMPLIANCE_OFFICER">COMPLIANCE_OFFICER</option></select></div>
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
            <div class="panel-tabs"><button class="panel-tab" [class.active]="detailTab()==='info'" (click)="detailTab.set('info')">Info</button><button class="panel-tab" [class.active]="detailTab()==='perms'" (click)="detailTab.set('perms')">Permissions</button><button class="panel-tab" [class.active]="detailTab()==='sessions'" (click)="detailTab.set('sessions')">Sessions</button><button class="panel-tab" [class.active]="detailTab()==='audit'" (click)="detailTab.set('audit')">Activity</button></div>
            <div class="panel-body">
              <div class="form-grid">
                <div class="field full"><label>Full Name</label><input type="text" [(ngModel)]="newItem.fullName" placeholder="Enter full name" /></div>
                <div class="field"><label>Username</label><input type="text" [(ngModel)]="newItem.username" placeholder="Enter username" /></div>
                <div class="field"><label>Email</label><input type="email" [(ngModel)]="newItem.email" placeholder="Enter email" /></div>
                <div class="field"><label>Dept</label><select [(ngModel)]="newItem.department"><option value="">Select...</option><option value="Risk Management">Risk Management</option><option value="Fraud Prevention">Fraud Prevention</option><option value="AML">AML</option><option value="Compliance">Compliance</option><option value="IT">IT</option><option value="Executive">Executive</option></select></div>
                <div class="field"><label>Role</label><select [(ngModel)]="newItem.role"><option value="">Select...</option><option value="SYSTEM_ADMIN">SYSTEM_ADMIN</option><option value="RISK_MANAGER">RISK_MANAGER</option><option value="FRAUD_ANALYST">FRAUD_ANALYST</option><option value="AML_OFFICER">AML_OFFICER</option><option value="COMPLIANCE_OFFICER">COMPLIANCE_OFFICER</option></select></div>
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
export class AdminComponent implements OnInit {
  activeTab = signal('users');
  showDetail = signal(false);
  detailTab = signal('info');
  showCreate = signal(false);
  editMode = signal(false);
  page = signal(1);
  pageSize = 12;
  searchTerm = '';
  sortField = '';
  sortDir: 'asc'|'desc' = 'asc';
  filters: any = { status: '', department: '' };
  selectedItem: any = null;
  newItem: any = { fullName: '', username: '', email: '', department: '', role: '' };

  allData: any[] = [];
  systemHealth: any[] = [];
  auditLogs: any[] = [];
  filteredAuditLogs: any[] = [];
  auditSearch = '';
  auditActionFilter = '';
  roles = [
    {name:'SYSTEM_ADMIN',desc:'Full access · 1 user'},
    {name:'RISK_MANAGER',desc:'risk.*, analytics.read · 1 user'},
    {name:'FRAUD_ANALYST',desc:'fraud.*, case.*, alert.* · 1 user'},
    {name:'AML_OFFICER',desc:'aml.*, case.*, sanctions.* · 1 user'},
    {name:'COMPLIANCE_OFFICER',desc:'compliance.*, audit.* · 1 user'},
    {name:'DATA_ANALYST',desc:'analytics.*, model.*, data.* · 1 user'},
    {name:'AUDITOR',desc:'*.read (risk, compliance) · 1 user'},
    {name:'EXECUTIVE',desc:'dashboard.*, reports.read · 1 user'},
  ];
  filtered: any[] = [];

  constructor(public mockData: MockDataService, public interact: InteractionService) {}

  ngOnInit() { this.allData = this.mockData.getUsers(); this.filtered = [...this.allData]; this.systemHealth = this.mockData.getSystemHealth(); this.auditLogs = this.mockData.getAuditLogs(); this.filteredAuditLogs = [...this.auditLogs]; }

  paginated = computed(() => { const s = (this.page() - 1) * this.pageSize; return this.filtered.slice(s, s + this.pageSize); });
  totalPages = computed(() => Math.ceil(this.filtered.length / this.pageSize) || 1);

  applyFilters() {
    let r = [...this.allData];
    if (this.searchTerm) { const q = this.searchTerm.toLowerCase(); r = r.filter(item => ['id','fullName','email','username'].some((f: string) => String((item as any)[f] || '').toLowerCase().includes(q))); }
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
    const id = 'ADM-' + String(Date.now()).slice(-6);
    this.allData.unshift({ ...this.newItem, id, createdAt: new Date(), status: 'NEW' });
    this.applyFilters();
    this.newItem = { fullName: '', username: '', email: '', department: '', role: '' };
    this.showCreate.set(false);
    this.interact.success('Created: ' + id);
  }

  filterAuditLogs() {
    let r = [...this.auditLogs];
    if (this.auditSearch) { const q = this.auditSearch.toLowerCase(); r = r.filter(l => l.username.toLowerCase().includes(q) || l.resource.toLowerCase().includes(q) || l.details.toLowerCase().includes(q)); }
    if (this.auditActionFilter) r = r.filter(l => l.action === this.auditActionFilter);
    this.filteredAuditLogs = r;
  }
  exportData() {
    const cols = ['id', 'fullName', 'username', 'email', 'department', 'role', 'status'];
    this.interact.exportCSV(this.filtered, 'admin', cols);
  }
}
