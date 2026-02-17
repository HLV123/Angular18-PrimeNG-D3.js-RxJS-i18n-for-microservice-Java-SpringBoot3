import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MockDataService } from '../../core/services/mock-data.service';
import { InteractionService } from '../../core/services/interaction.service';

@Component({
  selector: 'app-data-governance',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="page">
      <div class="page-header">
        <div><h1>Data Governance</h1><p>Data catalog, lineage, quality & access control</p></div>
        <div class="page-actions">
          <button class="btn-outline" (click)="exportData()"><i class="pi pi-download"></i> Export</button>
          <button class="btn-primary" (click)="showCreate.set(true)"><i class="pi pi-plus"></i> Create New</button>
        </div>
      </div>
      <div class="hero-section"><img src="assets/images/data-analytics-bg.png" class="hero-img" /><div class="hero-ov"><h2>Data Governance</h2><p>Data catalog, lineage, quality & access control</p></div></div>
      <div class="kpi-row">
        <div class="kpi-card"><div class="kpi-icon blue"><i class="pi pi-database"></i></div><div><span class="kpi-val">8</span><span class="kpi-lbl">Assets</span></div></div>
        <div class="kpi-card"><div class="kpi-icon green"><i class="pi pi-star"></i></div><div><span class="kpi-val">94.5%</span><span class="kpi-lbl">Quality</span></div></div>
        <div class="kpi-card"><div class="kpi-icon red"><i class="pi pi-lock"></i></div><div><span class="kpi-val">23</span><span class="kpi-lbl">PII</span></div></div>
        <div class="kpi-card"><div class="kpi-icon orange"><i class="pi pi-shield"></i></div><div><span class="kpi-val">45</span><span class="kpi-lbl">Policies</span></div></div>
      </div>
      <div class="tabs">
        <button class="tab" [class.active]="activeTab() === 'catalog'" (click)="activeTab.set('catalog')">Catalog</button>
        <button class="tab" [class.active]="activeTab() === 'lineage'" (click)="activeTab.set('lineage')">Lineage</button>
        <button class="tab" [class.active]="activeTab() === 'quality'" (click)="activeTab.set('quality')">Quality</button>
        <button class="tab" [class.active]="activeTab() === 'access'" (click)="activeTab.set('access')">Access</button>
      </div>

      @if (activeTab() === 'catalog') {
        <div class="filter-bar">
          <input type="text" placeholder="Search..." class="search-input" [(ngModel)]="searchTerm" (input)="applyFilters()" />
          <select [(ngModel)]="filters['type']" (change)="applyFilters()" class="filter-select"><option value="">All Types</option><option value="TABLE">TABLE</option><option value="VIEW">VIEW</option><option value="API">API</option><option value="FILE">FILE</option></select>
          <select [(ngModel)]="filters['classification']" (change)="applyFilters()" class="filter-select"><option value="">All Class</option><option value="CONFIDENTIAL">CONFIDENTIAL</option><option value="INTERNAL">INTERNAL</option><option value="PUBLIC">PUBLIC</option></select>
          
          <span class="result-count">{{ filtered.length }} records</span>
        </div>
        <div class="data-table">
          <table>
            <thead><tr><th (click)="sortBy('id')">ID</th><th (click)="sortBy('name')">Name</th><th (click)="sortBy('type')">Type</th><th (click)="sortBy('source')">Source</th><th (click)="sortBy('classification')">Class</th><th (click)="sortBy('qualityScore')">Quality</th><th (click)="sortBy('owner')">Owner</th><th>Actions</th></tr></thead>
            <tbody>
              @for (item of paginated(); track $index) {
                <tr (click)="viewItem(item)" [class.selected]="selectedItem?.id === item.id">
                  <td>{{ item.id }}</td><td>{{ item.name }}</td><td>{{ item.type }}</td><td>{{ item.source }}</td><td>{{ item.classification }}</td><td class="mono">{{ item.qualityScore | number }}</td><td>{{ item.owner }}</td>
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

      @if (activeTab() === 'lineage') {
        <div style="background:#fff;border-radius:16px;border:1px solid #e2e8f0;padding:24px"><div style="display:flex;justify-content:space-between;margin-bottom:16px"><h3 style="font-size:18px;font-weight:700;margin:0">Data Lineage (Atlas)</h3><button class="btn-primary" (click)="interact.info('Launching lineage explorer')"><i class="pi pi-external-link"></i> Explorer</button></div><div class="data-table"><table><thead><tr><th>Source</th><th>→</th><th>Transform</th><th>→</th><th>Target</th><th>Pipeline</th><th>Status</th></tr></thead><tbody><tr><td>Core Banking</td><td>→</td><td>ETL-Txn-Extract</td><td>→</td><td>Data Warehouse</td><td class="mono">airflow_txn</td><td><span class="status-pill" style="background:#f0fdf4;color:#22c55e">RUNNING</span></td></tr><tr><td>Card Processing</td><td>→</td><td>ETL-Card-Normalize</td><td>→</td><td>Elasticsearch</td><td class="mono">airflow_card</td><td><span class="status-pill" style="background:#f0fdf4;color:#22c55e">RUNNING</span></td></tr><tr><td>AML System</td><td>→</td><td>ETL-AML-Enrich</td><td>→</td><td>ML Feature Store</td><td class="mono">airflow_aml</td><td><span class="status-pill" style="background:#f0fdf4;color:#22c55e">RUNNING</span></td></tr><tr><td>CRM</td><td>→</td><td>ETL-Customer-Merge</td><td>→</td><td>Data Warehouse</td><td class="mono">airflow_crm</td><td><span class="status-pill" style="background:#fffbeb;color:#f59e0b">DELAYED</span></td></tr></tbody></table></div></div>
      }

      @if (activeTab() === 'quality') {
        <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:16px;margin-bottom:16px"><div class="kpi-card" style="flex-direction:column;align-items:center"><p style="font-size:48px;font-weight:800;color:#22c55e;margin:0">94.5%</p><p style="font-size:13px;color:#64748b;margin:0">Overall Quality</p></div><div class="kpi-card" style="flex-direction:column;align-items:flex-start;gap:6px"><p style="font-size:13px;color:#64748b;margin:0 0 4px">Dimensions</p><div style="width:100%"><div style="display:flex;justify-content:space-between;font-size:12px"><span>Completeness</span><span style="font-weight:700">97%</span></div><div style="height:6px;background:#f1f5f9;border-radius:3px;margin:3px 0 6px"><div style="height:100%;width:97%;background:#22c55e;border-radius:3px"></div></div><div style="display:flex;justify-content:space-between;font-size:12px"><span>Accuracy</span><span style="font-weight:700">92%</span></div><div style="height:6px;background:#f1f5f9;border-radius:3px;margin:3px 0 6px"><div style="height:100%;width:92%;background:#22c55e;border-radius:3px"></div></div><div style="display:flex;justify-content:space-between;font-size:12px"><span>Timeliness</span><span style="font-weight:700">89%</span></div><div style="height:6px;background:#f1f5f9;border-radius:3px;margin:3px 0"><div style="height:100%;width:89%;background:#f59e0b;border-radius:3px"></div></div></div></div></div>
        <div class="data-table"><table><thead><tr><th>Rule</th><th>Asset</th><th>Dimension</th><th>Score</th><th>Status</th></tr></thead><tbody><tr><td>Name Not Null</td><td>customers</td><td>Completeness</td><td><span style="color:#22c55e;font-weight:700">99.2%</span></td><td><span class="status-pill" style="background:#f0fdf4;color:#22c55e">PASS</span></td></tr><tr><td>Amount > 0</td><td>transactions</td><td>Validity</td><td><span style="color:#22c55e;font-weight:700">99.8%</span></td><td><span class="status-pill" style="background:#f0fdf4;color:#22c55e">PASS</span></td></tr><tr><td>Email Format</td><td>customers</td><td>Accuracy</td><td><span style="color:#f59e0b;font-weight:700">87.5%</span></td><td><span class="status-pill" style="background:#fffbeb;color:#f59e0b">WARNING</span></td></tr></tbody></table></div>
      }

      @if (activeTab() === 'access') {
        <div class="data-table"><table><thead><tr><th>Policy</th><th>Resource</th><th>Access</th><th>Roles</th><th>Status</th><th>Actions</th></tr></thead><tbody><tr><td><strong>PII Access</strong></td><td>customers.*</td><td>Read</td><td>Analyst, Compliance</td><td><span class="status-pill" style="background:#f0fdf4;color:#22c55e">ACTIVE</span></td><td class="actions-cell"><button class="icon-btn" (click)="interact.info('Editing policy')"><i class="pi pi-pencil"></i></button></td></tr><tr><td><strong>Txn Full</strong></td><td>transactions.*</td><td>Read/Write</td><td>Admin</td><td><span class="status-pill" style="background:#f0fdf4;color:#22c55e">ACTIVE</span></td><td class="actions-cell"><button class="icon-btn" (click)="interact.info('Editing policy')"><i class="pi pi-pencil"></i></button></td></tr><tr><td><strong>Fraud Scores</strong></td><td>fraud_scores.*</td><td>Read</td><td>Fraud, Risk</td><td><span class="status-pill" style="background:#f0fdf4;color:#22c55e">ACTIVE</span></td><td class="actions-cell"><button class="icon-btn" (click)="interact.info('Editing policy')"><i class="pi pi-pencil"></i></button></td></tr><tr><td><strong>Audit Logs</strong></td><td>audit_logs.*</td><td>Read</td><td>Auditor, Compliance</td><td><span class="status-pill" style="background:#f0fdf4;color:#22c55e">ACTIVE</span></td><td class="actions-cell"><button class="icon-btn" (click)="interact.info('Editing policy')"><i class="pi pi-pencil"></i></button></td></tr></tbody></table></div>
      }

      
      @if(activeTab()==='classify'){
        <h3 style="font-size:16px;font-weight:700;margin:0 0 12px">Data Classification</h3>
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px">
          <div class="kpi-card" style="flex-direction:column;align-items:center;gap:4px;border-top:3px solid #ef4444"><span style="font-size:24px;font-weight:800;color:#ef4444">42</span><span style="font-size:12px;color:#64748b">Highly Sensitive</span></div>
          <div class="kpi-card" style="flex-direction:column;align-items:center;gap:4px;border-top:3px solid #f59e0b"><span style="font-size:24px;font-weight:800;color:#f59e0b">128</span><span style="font-size:12px;color:#64748b">Sensitive</span></div>
          <div class="kpi-card" style="flex-direction:column;align-items:center;gap:4px;border-top:3px solid #3b82f6"><span style="font-size:24px;font-weight:800;color:#3b82f6">356</span><span style="font-size:12px;color:#64748b">Internal</span></div>
          <div class="kpi-card" style="flex-direction:column;align-items:center;gap:4px;border-top:3px solid #22c55e"><span style="font-size:24px;font-weight:800;color:#22c55e">89</span><span style="font-size:12px;color:#64748b">Public</span></div>
        </div>
        <div class="data-table"><table><thead><tr><th>Dataset</th><th>Classification</th><th>PII Fields</th><th>Encryption</th><th>Last Scanned</th><th>Actions</th></tr></thead><tbody>
          <tr><td><strong>Customer PII</strong></td><td><span class="priority-tag p-critical">HIGHLY SENSITIVE</span></td><td>SSN, DOB, Address</td><td><span class="status-pill s-active">AES-256</span></td><td>Feb 15</td><td class="actions-cell"><button class="icon-btn" (click)="interact.info('Scanning...')"><i class="pi pi-sync"></i></button></td></tr>
          <tr><td><strong>Transaction Log</strong></td><td><span class="priority-tag p-high">SENSITIVE</span></td><td>Account No</td><td><span class="status-pill s-active">AES-256</span></td><td>Feb 14</td><td class="actions-cell"><button class="icon-btn" (click)="interact.info('Scanning...')"><i class="pi pi-sync"></i></button></td></tr>
          <tr><td><strong>System Metrics</strong></td><td><span class="type-tag">INTERNAL</span></td><td>None</td><td><span class="status-pill s-draft">NONE</span></td><td>Feb 13</td><td class="actions-cell"><button class="icon-btn" (click)="interact.info('Scanning...')"><i class="pi pi-sync"></i></button></td></tr>
        </tbody></table></div>
      }

      @if(activeTab()==='retention'){
        <h3 style="font-size:16px;font-weight:700;margin:0 0 12px">Data Retention Policies</h3>
        <div class="data-table"><table><thead><tr><th>Policy</th><th>Data Type</th><th>Retention</th><th>Archival</th><th>Deletion</th><th>Compliance</th><th>Status</th></tr></thead><tbody>
          <tr><td><strong>Transaction Records</strong></td><td>Financial</td><td>7 years</td><td>After 2 years</td><td>Auto-purge</td><td>SOX, Basel</td><td><span class="status-pill s-active">ACTIVE</span></td></tr>
          <tr><td><strong>KYC Documents</strong></td><td>Customer</td><td>10 years</td><td>After 5 years</td><td>Manual review</td><td>AML/KYC</td><td><span class="status-pill s-active">ACTIVE</span></td></tr>
          <tr><td><strong>Alert Data</strong></td><td>Security</td><td>5 years</td><td>After 1 year</td><td>Auto-purge</td><td>Internal</td><td><span class="status-pill s-active">ACTIVE</span></td></tr>
          <tr><td><strong>Audit Logs</strong></td><td>System</td><td>10 years</td><td>After 3 years</td><td>Never</td><td>SOX, GDPR</td><td><span class="status-pill s-active">ACTIVE</span></td></tr>
          <tr><td><strong>Model Training</strong></td><td>Analytics</td><td>3 years</td><td>After 1 year</td><td>Auto-purge</td><td>Internal</td><td><span class="status-pill s-review">REVIEW</span></td></tr>
        </tbody></table></div>
        <div style="margin-top:16px;padding:16px;background:#fffbeb;border-radius:10px;border:1px solid #fef3c7"><i class="pi pi-exclamation-triangle" style="color:#f59e0b;margin-right:6px"></i><span style="font-size:13px;color:#92400e"><strong>GDPR Notice:</strong> 23 records are approaching retention limits. Review and archive by Feb 28.</span></div>
      }

      @if (showDetail()) {
        <div class="overlay" (click)="showDetail.set(false)">
          <div class="side-panel" (click)="$event.stopPropagation()">
            <div class="panel-header"><div><span class="panel-id">{{ selectedItem?.id }}</span><h2>{{ editMode() ? 'Edit' : 'View' }} Record</h2></div><button class="close-btn" (click)="showDetail.set(false)"><i class="pi pi-times"></i></button></div>
            <div class="panel-tabs"><button class="panel-tab" [class.active]="detailTab()==='info'" (click)="detailTab.set('info')">Details</button><button class="panel-tab" [class.active]="detailTab()==='schema'" (click)="detailTab.set('schema')">Schema</button><button class="panel-tab" [class.active]="detailTab()==='lineage'" (click)="detailTab.set('lineage')">Lineage</button><button class="panel-tab" [class.active]="detailTab()==='quality'" (click)="detailTab.set('quality')">Quality</button></div>
            <div class="panel-body">
              @if (!editMode()) {
                <div class="detail-grid">
                  <div class="detail-field"><label>ID</label><span>{{ selectedItem?.id }}</span></div>
                  <div class="detail-field"><label>Name</label><span>{{ selectedItem?.name }}</span></div>
                  <div class="detail-field"><label>Type</label><span>{{ selectedItem?.type }}</span></div>
                  <div class="detail-field"><label>Source</label><span>{{ selectedItem?.source }}</span></div>
                  <div class="detail-field"><label>Classification</label><span>{{ selectedItem?.classification }}</span></div>
                  <div class="detail-field"><label>Quality</label><span>{{ selectedItem?.qualityScore }}</span></div>
                  <div class="detail-field"><label>Owner</label><span>{{ selectedItem?.owner }}</span></div>
                </div>
                <div class="panel-actions"><button class="btn-primary" (click)="editMode.set(true)"><i class="pi pi-pencil"></i> Edit</button><button class="btn-outline" (click)="showDetail.set(false)">Close</button></div>
              }
              @if (editMode()) {
                <div class="form-grid">
                  <div class="field full"><label>Name</label><input type="text" [(ngModel)]="newItem.name" placeholder="Enter name" /></div>
                <div class="field"><label>Type</label><select [(ngModel)]="newItem.type"><option value="">Select...</option><option value="TABLE">TABLE</option><option value="VIEW">VIEW</option><option value="API">API</option></select></div>
                <div class="field"><label>Source</label><input type="text" [(ngModel)]="newItem.source" placeholder="Enter source" /></div>
                <div class="field"><label>Class</label><select [(ngModel)]="newItem.classification"><option value="">Select...</option><option value="CONFIDENTIAL">CONFIDENTIAL</option><option value="INTERNAL">INTERNAL</option><option value="PUBLIC">PUBLIC</option></select></div>
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
            <div class="panel-tabs"><button class="panel-tab" [class.active]="detailTab()==='info'" (click)="detailTab.set('info')">Details</button><button class="panel-tab" [class.active]="detailTab()==='schema'" (click)="detailTab.set('schema')">Schema</button><button class="panel-tab" [class.active]="detailTab()==='lineage'" (click)="detailTab.set('lineage')">Lineage</button><button class="panel-tab" [class.active]="detailTab()==='quality'" (click)="detailTab.set('quality')">Quality</button></div>
            <div class="panel-body">
              <div class="form-grid">
                <div class="field full"><label>Name</label><input type="text" [(ngModel)]="newItem.name" placeholder="Enter name" /></div>
                <div class="field"><label>Type</label><select [(ngModel)]="newItem.type"><option value="">Select...</option><option value="TABLE">TABLE</option><option value="VIEW">VIEW</option><option value="API">API</option></select></div>
                <div class="field"><label>Source</label><input type="text" [(ngModel)]="newItem.source" placeholder="Enter source" /></div>
                <div class="field"><label>Class</label><select [(ngModel)]="newItem.classification"><option value="">Select...</option><option value="CONFIDENTIAL">CONFIDENTIAL</option><option value="INTERNAL">INTERNAL</option><option value="PUBLIC">PUBLIC</option></select></div>
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
export class DataGovernanceComponent implements OnInit {
  activeTab = signal('catalog');
  showDetail = signal(false);
  detailTab = signal('info');
  showCreate = signal(false);
  editMode = signal(false);
  page = signal(1);
  pageSize = 12;
  searchTerm = '';
  sortField = '';
  sortDir: 'asc'|'desc' = 'asc';
  filters: any = { type: '', classification: '' };
  selectedItem: any = null;
  newItem: any = { name: '', type: '', source: '', classification: '', owner: '' };

  allData: any[] = [];
  filtered: any[] = [];

  constructor(public mockData: MockDataService, public interact: InteractionService) {}

  ngOnInit() { this.allData = this.mockData.getDataAssets(); this.filtered = [...this.allData]; }

  paginated = computed(() => { const s = (this.page() - 1) * this.pageSize; return this.filtered.slice(s, s + this.pageSize); });
  totalPages = computed(() => Math.ceil(this.filtered.length / this.pageSize) || 1);

  applyFilters() {
    let r = [...this.allData];
    if (this.searchTerm) { const q = this.searchTerm.toLowerCase(); r = r.filter(item => ['id','name','source','owner'].some((f: string) => String((item as any)[f] || '').toLowerCase().includes(q))); }
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
    const id = 'DAT-' + String(Date.now()).slice(-6);
    this.allData.unshift({ ...this.newItem, id, createdAt: new Date(), status: 'NEW' });
    this.applyFilters();
    this.newItem = { name: '', type: '', source: '', classification: '', owner: '' };
    this.showCreate.set(false);
    this.interact.success('Created: ' + id);
  }

  exportData() {
    const cols = ['id', 'name', 'type', 'source', 'classification', 'qualityScore', 'owner'];
    this.interact.exportCSV(this.filtered, 'data-governance', cols);
  }
}
