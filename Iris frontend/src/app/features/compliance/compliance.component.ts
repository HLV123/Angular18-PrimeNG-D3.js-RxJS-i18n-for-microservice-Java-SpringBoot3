import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MockDataService } from '../../core/services/mock-data.service';
import { InteractionService } from '../../core/services/interaction.service';

@Component({
  selector: 'app-compliance',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="page">
      <div class="page-header">
        <div><h1>Compliance & Audit</h1><p>Policy management, audit tracking & regulatory reporting</p></div>
        <div class="page-actions">
          <button class="btn-outline" (click)="exportData()"><i class="pi pi-download"></i> Export</button>
          <button class="btn-primary" (click)="showCreate.set(true)"><i class="pi pi-plus"></i> Create New</button>
        </div>
      </div>
      <div class="hero-section"><img src="assets/images/compliance-bg.png" class="hero-img" /><div class="hero-ov"><h2>Compliance & Audit</h2><p>Policy management, audit tracking & regulatory reporting</p></div></div>
      <div class="kpi-row">
        <div class="kpi-card"><div class="kpi-icon green"><i class="pi pi-check-circle"></i></div><div><span class="kpi-val">87%</span><span class="kpi-lbl">Score</span></div></div>
        <div class="kpi-card"><div class="kpi-icon red"><i class="pi pi-exclamation-triangle"></i></div><div><span class="kpi-val">12</span><span class="kpi-lbl">Findings</span></div></div>
        <div class="kpi-card"><div class="kpi-icon blue"><i class="pi pi-file"></i></div><div><span class="kpi-val">5</span><span class="kpi-lbl">Policies</span></div></div>
        <div class="kpi-card"><div class="kpi-icon orange"><i class="pi pi-users"></i></div><div><span class="kpi-val">92%</span><span class="kpi-lbl">Training</span></div></div>
      </div>
      <div class="tabs">
        <button class="tab" [class.active]="activeTab() === 'policies'" (click)="activeTab.set('policies')">Policies</button>
        <button class="tab" [class.active]="activeTab() === 'audits'" (click)="activeTab.set('audits')">Audits</button>
        <button class="tab" [class.active]="activeTab() === 'training'" (click)="activeTab.set('training')">Training</button>
      </div>

      @if (activeTab() === 'policies') {
        <div class="filter-bar">
          <input type="text" placeholder="Search..." class="search-input" [(ngModel)]="searchTerm" (input)="applyFilters()" />
          <select [(ngModel)]="filters['category']" (change)="applyFilters()" class="filter-select"><option value="">All Categories</option><option value="AML">AML</option><option value="FRAUD">FRAUD</option><option value="DATA_PRIVACY">DATA_PRIVACY</option><option value="COMPLIANCE">COMPLIANCE</option></select>
          <select [(ngModel)]="filters['status']" (change)="applyFilters()" class="filter-select"><option value="">All Status</option><option value="ACTIVE">ACTIVE</option><option value="DRAFT">DRAFT</option><option value="UNDER_REVIEW">UNDER_REVIEW</option></select>
          
          <span class="result-count">{{ filtered.length }} records</span>
        </div>
        <div class="data-table">
          <table>
            <thead><tr><th (click)="sortBy('id')">ID</th><th (click)="sortBy('name')">Name</th><th (click)="sortBy('category')">Category</th><th (click)="sortBy('version')">Version</th><th (click)="sortBy('status')">Status</th><th (click)="sortBy('owner')">Owner</th><th>Actions</th></tr></thead>
            <tbody>
              @for (item of paginated(); track $index) {
                <tr (click)="viewItem(item)" [class.selected]="selectedItem?.id === item.id">
                  <td>{{ item.id }}</td><td>{{ item.name }}</td><td>{{ item.category }}</td><td>{{ item.version }}</td><td><span class="status-pill">{{ item.status }}</span></td><td>{{ item.owner }}</td>
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

      @if (activeTab() === 'audits') {
        <div class="data-table"><table><thead><tr><th>Audit</th><th>Framework</th><th>Scope</th><th>Lead</th><th>Status</th><th>Progress</th><th>Due</th><th>Actions</th></tr></thead><tbody><tr><td><strong>Q1 SOX</strong></td><td>SOX</td><td>Financial Controls</td><td>Đỗ Kiểm Toán</td><td><span class="status-pill" style="background:#fffbeb;color:#f59e0b">IN PROGRESS</span></td><td><div style="display:flex;align-items:center;gap:6px"><div style="width:80px;height:6px;background:#f1f5f9;border-radius:3px"><div style="height:100%;width:65%;background:#f59e0b;border-radius:3px"></div></div><span style="font-size:11px">65%</span></div></td><td>Mar 31</td><td class="actions-cell"><button class="icon-btn" (click)="interact.info('Viewing SOX audit')"><i class="pi pi-eye"></i></button></td></tr><tr><td><strong>PCI DSS</strong></td><td>PCI DSS</td><td>Payment Security</td><td>IT Security</td><td><span class="status-pill" style="background:#fffbeb;color:#f59e0b">IN PROGRESS</span></td><td><div style="display:flex;align-items:center;gap:6px"><div style="width:80px;height:6px;background:#f1f5f9;border-radius:3px"><div style="height:100%;width:40%;background:#f59e0b;border-radius:3px"></div></div><span style="font-size:11px">40%</span></div></td><td>Feb 28</td><td class="actions-cell"><button class="icon-btn" (click)="interact.info('Viewing PCI audit')"><i class="pi pi-eye"></i></button></td></tr><tr><td><strong>Q4 AML Review</strong></td><td>AML/KYC</td><td>AML Controls</td><td>Hoàng Minh AML</td><td><span class="status-pill" style="background:#f0fdf4;color:#22c55e">COMPLETED</span></td><td><div style="display:flex;align-items:center;gap:6px"><div style="width:80px;height:6px;background:#f1f5f9;border-radius:3px"><div style="height:100%;width:100%;background:#22c55e;border-radius:3px"></div></div><span style="font-size:11px">100%</span></div></td><td>Jan 15</td><td class="actions-cell"><button class="icon-btn" (click)="interact.info('Viewing AML audit')"><i class="pi pi-eye"></i></button></td></tr></tbody></table></div>
      }

      @if (activeTab() === 'training') {
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:16px"><div class="kpi-card" style="flex-direction:column;align-items:flex-start;gap:6px"><h4 style="font-size:14px;font-weight:700;margin:0">AML/KYC</h4><p style="font-size:12px;color:#64748b;margin:0">Due: Mar 31</p><div style="width:100%;height:8px;background:#f1f5f9;border-radius:4px"><div style="height:100%;width:92%;background:#22c55e;border-radius:4px"></div></div><span style="font-size:12px;font-weight:600;color:#22c55e">92%</span></div><div class="kpi-card" style="flex-direction:column;align-items:flex-start;gap:6px"><h4 style="font-size:14px;font-weight:700;margin:0">GDPR Privacy</h4><p style="font-size:12px;color:#64748b;margin:0">Due: Feb 28</p><div style="width:100%;height:8px;background:#f1f5f9;border-radius:4px"><div style="height:100%;width:78%;background:#f59e0b;border-radius:4px"></div></div><span style="font-size:12px;font-weight:600;color:#f59e0b">78%</span></div><div class="kpi-card" style="flex-direction:column;align-items:flex-start;gap:6px"><h4 style="font-size:14px;font-weight:700;margin:0">Fraud Awareness</h4><p style="font-size:12px;color:#64748b;margin:0">Due: Apr 15</p><div style="width:100%;height:8px;background:#f1f5f9;border-radius:4px"><div style="height:100%;width:85%;background:#22c55e;border-radius:4px"></div></div><span style="font-size:12px;font-weight:600;color:#22c55e">85%</span></div></div>
        <div class="data-table"><table><thead><tr><th>Department</th><th>Staff</th><th>Done</th><th>In Progress</th><th>Not Started</th><th>Rate</th></tr></thead><tbody><tr><td>Finance</td><td>45</td><td>42</td><td>2</td><td>1</td><td><span style="color:#22c55e;font-weight:700">93%</span></td></tr><tr><td>Operations</td><td>68</td><td>55</td><td>8</td><td>5</td><td><span style="color:#f59e0b;font-weight:700">81%</span></td></tr><tr><td>IT</td><td>32</td><td>30</td><td>2</td><td>0</td><td><span style="color:#22c55e;font-weight:700">94%</span></td></tr><tr><td>Sales</td><td>55</td><td>48</td><td>4</td><td>3</td><td><span style="color:#22c55e;font-weight:700">87%</span></td></tr></tbody></table></div>
      }

      
      @if(activeTab()==='controls'){
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:16px">
          <div class="kpi-card" style="flex-direction:column;align-items:center;gap:4px"><span style="font-size:24px;font-weight:800;color:#22c55e">87%</span><span style="font-size:12px;color:#64748b">Overall Compliance</span></div>
          <div class="kpi-card" style="flex-direction:column;align-items:center;gap:4px"><span style="font-size:24px;font-weight:800;color:#3b82f6">142</span><span style="font-size:12px;color:#64748b">Total Controls</span></div>
          <div class="kpi-card" style="flex-direction:column;align-items:center;gap:4px"><span style="font-size:24px;font-weight:800;color:#22c55e">118</span><span style="font-size:12px;color:#64748b">Effective</span></div>
          <div class="kpi-card" style="flex-direction:column;align-items:center;gap:4px"><span style="font-size:24px;font-weight:800;color:#ef4444">8</span><span style="font-size:12px;color:#64748b">Failed</span></div>
        </div>
        <div class="data-table"><table><thead><tr><th>Control</th><th>Framework</th><th>Category</th><th>Owner</th><th>Effectiveness</th><th>Last Test</th><th>Status</th></tr></thead><tbody>
          <tr><td><strong>SOX-IT-001</strong></td><td>SOX</td><td>Access Control</td><td>IT Security</td><td><span style="color:#22c55e;font-weight:700">95%</span></td><td>Feb 10</td><td><span class="status-pill s-active">PASS</span></td></tr>
          <tr><td><strong>SOX-IT-002</strong></td><td>SOX</td><td>Change Mgmt</td><td>IT Ops</td><td><span style="color:#22c55e;font-weight:700">88%</span></td><td>Feb 8</td><td><span class="status-pill s-active">PASS</span></td></tr>
          <tr><td><strong>AML-001</strong></td><td>BSA/AML</td><td>CDD/EDD</td><td>Compliance</td><td><span style="color:#f59e0b;font-weight:700">72%</span></td><td>Feb 5</td><td><span class="status-pill s-review">REMEDIATION</span></td></tr>
          <tr><td><strong>GDPR-003</strong></td><td>GDPR</td><td>Data Privacy</td><td>DPO</td><td><span style="color:#ef4444;font-weight:700">45%</span></td><td>Jan 28</td><td><span class="status-pill s-failed">FAIL</span></td></tr>
          <tr><td><strong>PCI-DSS-01</strong></td><td>PCI-DSS</td><td>Encryption</td><td>InfoSec</td><td><span style="color:#22c55e;font-weight:700">98%</span></td><td>Feb 12</td><td><span class="status-pill s-active">PASS</span></td></tr>
        </tbody></table></div>
      }

      @if(activeTab()==='violations'){
        <div style="display:flex;justify-content:space-between;margin-bottom:12px"><h3 style="font-size:16px;font-weight:700;margin:0">Compliance Violations</h3><button class="btn-primary btn-sm" (click)="interact.info('Logging violation...')"><i class="pi pi-plus"></i> Log Violation</button></div>
        <div class="data-table"><table><thead><tr><th>ID</th><th>Violation</th><th>Regulation</th><th>Severity</th><th>Detected</th><th>Remediation</th><th>Status</th></tr></thead><tbody>
          <tr><td class="mono">VIO-001</td><td><strong>GDPR Consent Gap</strong></td><td>GDPR Art. 7</td><td><span class="priority-tag p-high">HIGH</span></td><td>Feb 10</td><td>Due Mar 10</td><td><span class="status-pill s-review">IN PROGRESS</span></td></tr>
          <tr><td class="mono">VIO-002</td><td><strong>Late SAR Filing</strong></td><td>BSA/AML</td><td><span class="priority-tag p-medium">MEDIUM</span></td><td>Feb 5</td><td>Feb 15</td><td><span class="status-pill s-active">RESOLVED</span></td></tr>
          <tr><td class="mono">VIO-003</td><td><strong>Missing KYC Update</strong></td><td>CDD Rule</td><td><span class="priority-tag p-medium">MEDIUM</span></td><td>Jan 28</td><td>Due Feb 28</td><td><span class="status-pill s-review">IN PROGRESS</span></td></tr>
          <tr><td class="mono">VIO-004</td><td><strong>Inadequate Logging</strong></td><td>SOX 404</td><td><span class="priority-tag p-high">HIGH</span></td><td>Feb 12</td><td>Due Mar 12</td><td><span class="status-pill s-draft">OPEN</span></td></tr>
        </tbody></table></div>
      }

      @if(activeTab()==='regulatory'){
        <h3 style="font-size:16px;font-weight:700;margin:0 0 12px">Regulatory Reporting Calendar</h3>
        <div class="data-table"><table><thead><tr><th>Report</th><th>Regulator</th><th>Frequency</th><th>Next Due</th><th>Status</th><th>Actions</th></tr></thead><tbody>
          <tr><td><strong>CTR Filing</strong></td><td>FinCEN</td><td>As needed</td><td>Ongoing</td><td><span class="status-pill s-active">CURRENT</span></td><td><button class="btn-outline" style="padding:4px 12px;font-size:11px" (click)="interact.info('Opening...')"><i class="pi pi-file"></i> File</button></td></tr>
          <tr><td><strong>SAR Reports</strong></td><td>FinCEN</td><td>As needed</td><td>5 pending</td><td><span class="status-pill s-review">PENDING</span></td><td><button class="btn-outline" style="padding:4px 12px;font-size:11px" (click)="interact.info('Opening...')"><i class="pi pi-file"></i> File</button></td></tr>
          <tr><td><strong>GDPR Annual Report</strong></td><td>DPA</td><td>Annual</td><td>Mar 31</td><td><span class="status-pill s-review">PREPARING</span></td><td><button class="btn-outline" style="padding:4px 12px;font-size:11px" (click)="interact.info('Opening...')"><i class="pi pi-file"></i> Draft</button></td></tr>
          <tr><td><strong>Basel III Disclosure</strong></td><td>Central Bank</td><td>Quarterly</td><td>Apr 15</td><td><span class="status-pill s-draft">NOT STARTED</span></td><td><button class="btn-outline" style="padding:4px 12px;font-size:11px" (click)="interact.info('Opening...')"><i class="pi pi-file"></i> Start</button></td></tr>
        </tbody></table></div>
      }

      @if (showDetail()) {
        <div class="overlay" (click)="showDetail.set(false)">
          <div class="side-panel" (click)="$event.stopPropagation()">
            <div class="panel-header"><div><span class="panel-id">{{ selectedItem?.id }}</span><h2>{{ editMode() ? 'Edit' : 'View' }} Record</h2></div><button class="close-btn" (click)="showDetail.set(false)"><i class="pi pi-times"></i></button></div>
            <div class="panel-tabs"><button class="panel-tab" [class.active]="detailTab()==='info'" (click)="detailTab.set('info')">Details</button><button class="panel-tab" [class.active]="detailTab()==='scope'" (click)="detailTab.set('scope')">Scope</button><button class="panel-tab" [class.active]="detailTab()==='findings'" (click)="detailTab.set('findings')">Findings</button><button class="panel-tab" [class.active]="detailTab()==='evidence'" (click)="detailTab.set('evidence')">Evidence</button></div>
            <div class="panel-body">
              @if (!editMode()) {
                <div class="detail-grid">
                  <div class="detail-field"><label>ID</label><span>{{ selectedItem?.id }}</span></div>
                  <div class="detail-field"><label>Name</label><span>{{ selectedItem?.name }}</span></div>
                  <div class="detail-field"><label>Category</label><span>{{ selectedItem?.category }}</span></div>
                  <div class="detail-field"><label>Version</label><span>{{ selectedItem?.version }}</span></div>
                  <div class="detail-field"><label>Status</label><span>{{ selectedItem?.status }}</span></div>
                  <div class="detail-field"><label>Owner</label><span>{{ selectedItem?.owner }}</span></div>
                  <div class="detail-field"><label>Effective</label><span>{{ selectedItem?.effectiveDate }}</span></div>
                  <div class="detail-field"><label>Next Review</label><span>{{ selectedItem?.nextReviewDate }}</span></div>
                </div>
                <div class="panel-actions"><button class="btn-primary" (click)="editMode.set(true)"><i class="pi pi-pencil"></i> Edit</button><button class="btn-outline" (click)="showDetail.set(false)">Close</button></div>
              }
              @if (editMode()) {
                <div class="form-grid">
                  <div class="field full"><label>Name</label><input type="text" [(ngModel)]="newItem.name" placeholder="Enter name" /></div>
                <div class="field"><label>Category</label><select [(ngModel)]="newItem.category"><option value="">Select...</option><option value="AML">AML</option><option value="FRAUD">FRAUD</option><option value="DATA_PRIVACY">DATA_PRIVACY</option><option value="COMPLIANCE">COMPLIANCE</option></select></div>
                <div class="field"><label>Version</label><input type="text" [(ngModel)]="newItem.version" placeholder="Enter version" /></div>
                <div class="field"><label>Owner</label><input type="text" [(ngModel)]="newItem.owner" placeholder="Enter owner" /></div>
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
            <div class="panel-tabs"><button class="panel-tab" [class.active]="detailTab()==='info'" (click)="detailTab.set('info')">Details</button><button class="panel-tab" [class.active]="detailTab()==='scope'" (click)="detailTab.set('scope')">Scope</button><button class="panel-tab" [class.active]="detailTab()==='findings'" (click)="detailTab.set('findings')">Findings</button><button class="panel-tab" [class.active]="detailTab()==='evidence'" (click)="detailTab.set('evidence')">Evidence</button></div>
            <div class="panel-body">
              <div class="form-grid">
                <div class="field full"><label>Name</label><input type="text" [(ngModel)]="newItem.name" placeholder="Enter name" /></div>
                <div class="field"><label>Category</label><select [(ngModel)]="newItem.category"><option value="">Select...</option><option value="AML">AML</option><option value="FRAUD">FRAUD</option><option value="DATA_PRIVACY">DATA_PRIVACY</option><option value="COMPLIANCE">COMPLIANCE</option></select></div>
                <div class="field"><label>Version</label><input type="text" [(ngModel)]="newItem.version" placeholder="Enter version" /></div>
                <div class="field"><label>Owner</label><input type="text" [(ngModel)]="newItem.owner" placeholder="Enter owner" /></div>
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
export class ComplianceComponent implements OnInit {
  activeTab = signal('policies');
  showDetail = signal(false);
  detailTab = signal('info');
  showCreate = signal(false);
  editMode = signal(false);
  page = signal(1);
  pageSize = 12;
  searchTerm = '';
  sortField = '';
  sortDir: 'asc'|'desc' = 'asc';
  filters: any = { category: '', status: '' };
  selectedItem: any = null;
  newItem: any = { name: '', category: '', version: '', owner: '' };

  allData: any[] = [];
  filtered: any[] = [];

  constructor(public mockData: MockDataService, public interact: InteractionService) {}

  ngOnInit() { this.allData = this.mockData.getPolicies(); this.filtered = [...this.allData]; }

  paginated = computed(() => { const s = (this.page() - 1) * this.pageSize; return this.filtered.slice(s, s + this.pageSize); });
  totalPages = computed(() => Math.ceil(this.filtered.length / this.pageSize) || 1);

  applyFilters() {
    let r = [...this.allData];
    if (this.searchTerm) { const q = this.searchTerm.toLowerCase(); r = r.filter(item => ['id','name','category','owner'].some((f: string) => String((item as any)[f] || '').toLowerCase().includes(q))); }
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
    const id = 'COM-' + String(Date.now()).slice(-6);
    this.allData.unshift({ ...this.newItem, id, createdAt: new Date(), status: 'NEW' });
    this.applyFilters();
    this.newItem = { name: '', category: '', version: '', owner: '' };
    this.showCreate.set(false);
    this.interact.success('Created: ' + id);
  }

  exportData() {
    const cols = ['id', 'name', 'category', 'version', 'status', 'owner'];
    this.interact.exportCSV(this.filtered, 'compliance', cols);
  }
}
