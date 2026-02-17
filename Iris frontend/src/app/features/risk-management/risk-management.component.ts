import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MockDataService } from '../../core/services/mock-data.service';
import { InteractionService } from '../../core/services/interaction.service';

@Component({
  selector: 'app-risk-management',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="page">
      <div class="breadcrumb"><a routerLink="/dashboard">Home</a><span class="sep">/</span><span>Risk Management</span></div>
      <div class="page-header">
        <div><h1>Risk Management</h1><p>Enterprise Risk Register, Assessment & KRI Monitoring</p></div>
        <div class="page-actions">
          <button class="btn-outline" (click)="exportData()"><i class="pi pi-download"></i> Export</button>
          <button class="btn-primary" (click)="showCreate.set(true)"><i class="pi pi-plus"></i> New Risk</button>
        </div>
      </div>

      <div class="hero-section"><img src="assets/images/risk-management-bg.png" class="hero-img"/><div class="hero-ov"><h2>Enterprise Risk Register</h2><p>ISO 31000 / COSO ERM Framework</p></div></div>

      <div class="kpi-row">
        <div class="kpi-card"><div class="kpi-icon red"><i class="pi pi-exclamation-triangle"></i></div><div><span class="kpi-val">{{ criticalCount }}</span><span class="kpi-lbl">Critical Risks</span></div></div>
        <div class="kpi-card"><div class="kpi-icon orange"><i class="pi pi-chart-line"></i></div><div><span class="kpi-val">{{ highCount }}</span><span class="kpi-lbl">High Risks</span></div></div>
        <div class="kpi-card"><div class="kpi-icon blue"><i class="pi pi-shield"></i></div><div><span class="kpi-val">{{ controlCount }}</span><span class="kpi-lbl">Active Controls</span></div></div>
        <div class="kpi-card"><div class="kpi-icon green"><i class="pi pi-check-circle"></i></div><div><span class="kpi-val">{{ mitigatedPct }}%</span><span class="kpi-lbl">Mitigated</span></div></div>
      </div>

      <div class="tabs">
        <button class="tab" [class.active]="activeTab()==='register'" (click)="activeTab.set('register')">Risk Register</button>
        <button class="tab" [class.active]="activeTab()==='heatmap'" (click)="activeTab.set('heatmap')">Heat Map</button>
        <button class="tab" [class.active]="activeTab()==='kri'" (click)="activeTab.set('kri')">KRI Monitor</button>
        <button class="tab" [class.active]="activeTab()==='controls'" (click)="activeTab.set('controls')">Controls</button>
        <button class="tab" [class.active]="activeTab()==='assessments'" (click)="activeTab.set('assessments')">Assessments</button>
        <button class="tab" [class.active]="activeTab()==='reports'" (click)="activeTab.set('reports')">Reports</button>
      </div>

      <!-- TAB: RISK REGISTER -->
      @if (activeTab()==='register') {
        <div class="filter-bar">
          <input type="text" placeholder="Search risks..." class="search-input" [(ngModel)]="searchTerm" (input)="applyFilters()"/>
          <select [(ngModel)]="filters.category" (change)="applyFilters()" class="filter-select"><option value="">All Categories</option><option>Strategic</option><option>Financial</option><option>Operational</option><option>Compliance</option><option>Reputational</option></select>
          <select [(ngModel)]="filters.level" (change)="applyFilters()" class="filter-select"><option value="">All Levels</option><option>Critical</option><option>High</option><option>Medium</option><option>Low</option></select>
          <select [(ngModel)]="filters.status" (change)="applyFilters()" class="filter-select"><option value="">All Status</option><option>ACTIVE</option><option>DRAFT</option><option>CLOSED</option></select>
          <span class="result-count">{{ filtered.length }} risks</span>
        </div>
        <div class="data-table"><table>
          <thead><tr><th (click)="sortBy('id')">ID</th><th (click)="sortBy('title')">Title</th><th>Category</th><th>Owner</th><th>Inherent</th><th>Residual</th><th>Level</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>@for(item of paginated();track $index){
            <tr (click)="viewItem(item)">
              <td class="mono">{{ item.id }}</td><td><strong>{{ item.title }}</strong></td><td>{{ item.category }}</td><td>{{ item.owner }}</td>
              <td><span class="mono" [style.color]="item.inherentScore > 15 ? '#ef4444' : item.inherentScore > 10 ? '#f59e0b' : '#22c55e'">{{ item.inherentScore }}</span></td>
              <td><span class="mono" [style.color]="item.residualScore > 15 ? '#ef4444' : item.residualScore > 10 ? '#f59e0b' : '#22c55e'">{{ item.residualScore }}</span></td>
              <td><span class="priority-tag" [class]="'p-' + (item.level||'').toLowerCase()">{{ item.level }}</span></td>
              <td><span class="status-pill" [class]="'s-' + (item.status||'').toLowerCase()">{{ item.status }}</span></td>
              <td class="actions-cell">
                <button class="icon-btn" title="View" (click)="viewItem(item);$event.stopPropagation()"><i class="pi pi-eye"></i></button>
                <button class="icon-btn" title="Edit" (click)="editItem(item);$event.stopPropagation()"><i class="pi pi-pencil"></i></button>
                <button class="icon-btn danger" title="Delete" (click)="deleteItem(item);$event.stopPropagation()"><i class="pi pi-trash"></i></button>
              </td>
            </tr>
          }</tbody>
        </table>
        <div class="pagination"><button [disabled]="page()===1" (click)="page.set(page()-1)"><i class="pi pi-chevron-left"></i> Prev</button><span>Page {{ page() }} of {{ totalPages() }}</span><button [disabled]="page()>=totalPages()" (click)="page.set(page()+1)">Next <i class="pi pi-chevron-right"></i></button></div>
        </div>
      }

      <!-- TAB: HEAT MAP -->
      @if (activeTab()==='heatmap') {
        <div style="background:#fff;border-radius:16px;border:1px solid #e2e8f0;padding:24px;">
          <h3 style="font-size:18px;font-weight:700;margin:0 0 20px;">Risk Heat Map (Likelihood × Impact)</h3>
          <div id="heatmapContainer" style="display:grid;grid-template-columns:40px repeat(5,1fr);grid-template-rows:repeat(5,60px) 30px;gap:4px;max-width:600px;">
            <!-- Y axis labels -->
            <div style="display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:600;color:#64748b;">5</div>
            @for(cell of getHeatRow(5);track $index){<div [style.background]="cell.color" style="border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:700;color:#fff;cursor:pointer;" (click)="interact.info('Likelihood=5, Impact='+ ($index+1) + ': ' + cell.count + ' risks')">{{cell.count||''}}</div>}
            <div style="display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:600;color:#64748b;">4</div>
            @for(cell of getHeatRow(4);track $index){<div [style.background]="cell.color" style="border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:700;color:#fff;cursor:pointer;" (click)="interact.info('Likelihood=4, Impact='+ ($index+1) + ': ' + cell.count + ' risks')">{{cell.count||''}}</div>}
            <div style="display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:600;color:#64748b;">3</div>
            @for(cell of getHeatRow(3);track $index){<div [style.background]="cell.color" style="border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:700;color:#fff;cursor:pointer;" (click)="interact.info('Likelihood=3, Impact='+ ($index+1) + ': ' + cell.count + ' risks')">{{cell.count||''}}</div>}
            <div style="display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:600;color:#64748b;">2</div>
            @for(cell of getHeatRow(2);track $index){<div [style.background]="cell.color" style="border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:700;color:#fff;cursor:pointer;" (click)="interact.info('Likelihood=2, Impact='+ ($index+1) + ': ' + cell.count + ' risks')">{{cell.count||''}}</div>}
            <div style="display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:600;color:#64748b;">1</div>
            @for(cell of getHeatRow(1);track $index){<div [style.background]="cell.color" style="border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:700;color:#fff;cursor:pointer;" (click)="interact.info('Likelihood=1, Impact='+ ($index+1) + ': ' + cell.count + ' risks')">{{cell.count||''}}</div>}
            <div></div>
            <div style="text-align:center;font-size:11px;font-weight:600;color:#64748b;">1</div><div style="text-align:center;font-size:11px;font-weight:600;color:#64748b;">2</div><div style="text-align:center;font-size:11px;font-weight:600;color:#64748b;">3</div><div style="text-align:center;font-size:11px;font-weight:600;color:#64748b;">4</div><div style="text-align:center;font-size:11px;font-weight:600;color:#64748b;">5</div>
          </div>
          <div style="display:flex;gap:16px;margin-top:16px;font-size:12px;">
            <span><span style="display:inline-block;width:12px;height:12px;border-radius:3px;background:#22c55e;margin-right:4px;vertical-align:middle;"></span>Low (1-4)</span>
            <span><span style="display:inline-block;width:12px;height:12px;border-radius:3px;background:#f59e0b;margin-right:4px;vertical-align:middle;"></span>Medium (5-9)</span>
            <span><span style="display:inline-block;width:12px;height:12px;border-radius:3px;background:#f97316;margin-right:4px;vertical-align:middle;"></span>High (10-16)</span>
            <span><span style="display:inline-block;width:12px;height:12px;border-radius:3px;background:#ef4444;margin-right:4px;vertical-align:middle;"></span>Critical (17-25)</span>
          </div>
        </div>
      }

      <!-- TAB: KRI MONITOR -->
      @if (activeTab()==='kri') {
        <div class="data-table"><table>
          <thead><tr><th>KRI</th><th>Risk</th><th>Current</th><th>Warning</th><th>Critical</th><th>Status</th><th>Trend</th><th>Actions</th></tr></thead>
          <tbody>@for(kri of kriData;track $index){
            <tr><td><strong>{{kri.name}}</strong></td><td class="mono">{{kri.riskId}}</td>
            <td><strong [style.color]="kri.current > kri.critical ? '#ef4444' : kri.current > kri.warning ? '#f59e0b' : '#22c55e'">{{kri.current}}{{kri.unit}}</strong></td>
            <td>{{kri.warning}}{{kri.unit}}</td><td>{{kri.critical}}{{kri.unit}}</td>
            <td><span class="status-pill" [class]="kri.current > kri.critical ? 's-failed' : kri.current > kri.warning ? 's-review' : 's-active'">{{ kri.current > kri.critical ? 'BREACH' : kri.current > kri.warning ? 'WARNING' : 'NORMAL' }}</span></td>
            <td><i [class]="kri.trend === 'UP' ? 'pi pi-arrow-up' : kri.trend === 'DOWN' ? 'pi pi-arrow-down' : 'pi pi-minus'" [style.color]="kri.trend === 'UP' ? '#ef4444' : kri.trend === 'DOWN' ? '#22c55e' : '#64748b'"></i></td>
            <td class="actions-cell"><button class="icon-btn" (click)="interact.info('KRI Detail: ' + kri.name)"><i class="pi pi-chart-line"></i></button></td></tr>
          }</tbody>
        </table></div>
      }

      <!-- TAB: CONTROLS -->
      @if (activeTab()==='controls') {
              <div class="filter-bar">
          <input type="text" placeholder="Search controls..." class="search-input" [(ngModel)]="ctrlSearch" (input)="filterControls()"/>
          <select [(ngModel)]="ctrlTypeFilter" (change)="filterControls()" class="filter-select"><option value="">All Types</option><option>PREVENTIVE</option><option>DETECTIVE</option><option>CORRECTIVE</option></select>
          <span class="result-count">{{ filteredControls.length }} controls</span>
        </div>
        <div class="data-table"><table>
          <thead><tr><th>ID</th><th>Name</th><th>Type</th><th>Category</th><th>Frequency</th><th>Effectiveness</th><th>Last Test</th><th>Result</th><th>Actions</th></tr></thead>
          <tbody>@for(c of filteredControls;track $index){
            <tr>
              <td class="mono">{{c.id}}</td><td><strong>{{c.name}}</strong></td>
              <td><span class="status-pill" [style.background]="c.type==='PREVENTIVE'?'#eff6ff':'#f5f3ff'" [style.color]="c.type==='PREVENTIVE'?'#3b82f6':'#8b5cf6'">{{c.type}}</span></td>
              <td>{{c.category}}</td><td>{{c.frequency}}</td>
              <td><div style="display:flex;align-items:center;gap:6px;"><div class="progress-bar" style="width:80px"><div class="progress-fill" [style.width.%]="c.effectiveness" [style.background]="c.effectiveness>85?'#22c55e':c.effectiveness>70?'#f59e0b':'#ef4444'"></div></div><span style="font-size:12px;font-weight:600;">{{c.effectiveness}}%</span></div></td>
              <td>{{ c.lastTestDate | date:'shortDate' }}</td>
              <td><span class="status-pill" [class]="c.lastTestResult==='PASS'?'s-active':c.lastTestResult==='PARTIAL'?'s-review':'s-failed'">{{c.lastTestResult}}</span></td>
              <td class="actions-cell"><button class="icon-btn" (click)="interact.info('Viewing control ' + c.id)"><i class="pi pi-eye"></i></button><button class="icon-btn" (click)="interact.info('Testing control ' + c.id)"><i class="pi pi-check-square"></i></button></td>
            </tr>
          }</tbody>
        </table></div>
      }

      <!-- TAB: ASSESSMENTS -->
      @if (activeTab()==='assessments') {
        <div style="display:flex;justify-content:space-between;margin-bottom:16px;"><h3 style="font-size:16px;font-weight:700;margin:0;">Risk Assessment Workflows</h3><button class="btn-primary btn-sm" (click)="interact.info('Creating new assessment')"><i class="pi pi-plus"></i> New Assessment</button></div>
        <div class="data-table"><table>
          <thead><tr><th>Assessment</th><th>Framework</th><th>Scope</th><th>Period</th><th>Team</th><th>Risks</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            <tr><td><strong>Q1 2026 Enterprise Risk</strong></td><td>ISO 31000</td><td>All Departments</td><td>Jan-Mar 2026</td><td>5 members</td><td>15</td><td><span class="status-pill s-review">IN PROGRESS</span></td><td class="actions-cell"><button class="icon-btn" (click)="interact.info('Opening assessment')"><i class="pi pi-eye"></i></button></td></tr>
            <tr><td><strong>IT Security Assessment</strong></td><td>ISO 27001</td><td>IT Department</td><td>Feb 2026</td><td>3 members</td><td>8</td><td><span class="status-pill s-draft">DRAFT</span></td><td class="actions-cell"><button class="icon-btn" (click)="interact.info('Opening assessment')"><i class="pi pi-eye"></i></button></td></tr>
            <tr><td><strong>Q4 2025 Enterprise Risk</strong></td><td>ISO 31000</td><td>All Departments</td><td>Oct-Dec 2025</td><td>5 members</td><td>15</td><td><span class="status-pill s-active">APPROVED</span></td><td class="actions-cell"><button class="icon-btn" (click)="interact.info('Opening assessment')"><i class="pi pi-eye"></i></button></td></tr>
            <tr><td><strong>Basel III Credit Risk</strong></td><td>Basel III</td><td>Credit Division</td><td>2025 Annual</td><td>4 members</td><td>12</td><td><span class="status-pill s-active">APPROVED</span></td><td class="actions-cell"><button class="icon-btn" (click)="interact.info('Opening assessment')"><i class="pi pi-eye"></i></button></td></tr>
          </tbody>
        </table></div>
      }

      <!-- TAB: REPORTS -->
      @if (activeTab()==='reports') {
        <div class="card-grid">
          @for(rpt of riskReports;track $index){
            <div class="info-card" style="cursor:pointer" (click)="interact.success('Generating ' + rpt.name + '...')">
              <div style="display:flex;align-items:center;gap:8px;"><i [class]="rpt.icon" [style.color]="rpt.color" style="font-size:18px;"></i><h4>{{rpt.name}}</h4></div>
              <p>{{rpt.desc}}</p>
              <div style="display:flex;gap:8px;margin-top:4px;">
                <button class="btn-sm btn-primary" (click)="interact.success('Generating PDF...');$event.stopPropagation()"><i class="pi pi-file-pdf"></i> PDF</button>
                <button class="btn-sm btn-outline" (click)="interact.success('Generating Excel...');$event.stopPropagation()"><i class="pi pi-file-excel"></i> Excel</button>
              </div>
            </div>
          }
        </div>
      }

      <!-- DETAIL PANEL (7 sub-tabs) -->
      @if (showDetail()) {
        <div class="overlay" (click)="showDetail.set(false)">
          <div class="side-panel" (click)="$event.stopPropagation()">
            <div class="panel-header">
              <div><span class="panel-id">{{ selectedItem?.id }}</span><h2>{{ selectedItem?.title }}</h2></div>
              <button class="close-btn" (click)="showDetail.set(false)"><i class="pi pi-times"></i></button>
            </div>
            <div class="panel-body">
              <div class="panel-tabs">
                <button class="panel-tab" [class.active]="detailTab()==='info'" (click)="detailTab.set('info')">Information</button>
                <button class="panel-tab" [class.active]="detailTab()==='assess'" (click)="detailTab.set('assess')">Assessment</button>
                <button class="panel-tab" [class.active]="detailTab()==='treat'" (click)="detailTab.set('treat')">Treatment</button>
                <button class="panel-tab" [class.active]="detailTab()==='ctrl'" (click)="detailTab.set('ctrl')">Controls</button>
                <button class="panel-tab" [class.active]="detailTab()==='kris'" (click)="detailTab.set('kris')">KRIs</button>
                <button class="panel-tab" [class.active]="detailTab()==='docs'" (click)="detailTab.set('docs')">Documents</button>
                <button class="panel-tab" [class.active]="detailTab()==='hist'" (click)="detailTab.set('hist')">History</button>
              </div>

              @if(detailTab()==='info'){
                @if(!editMode()){
                  <div class="detail-grid">
                    <div class="detail-field"><label>Risk ID</label><span>{{ selectedItem?.id }}</span></div>
                    <div class="detail-field"><label>Category</label><span>{{ selectedItem?.category }}</span></div>
                    <div class="detail-field"><label>Owner</label><span>{{ selectedItem?.owner }}</span></div>
                    <div class="detail-field"><label>Department</label><span>{{ selectedItem?.department }}</span></div>
                    <div class="detail-field"><label>Level</label><span class="priority-tag" [class]="'p-'+(selectedItem?.level||'').toLowerCase()">{{ selectedItem?.level }}</span></div>
                    <div class="detail-field"><label>Status</label><span class="status-pill" [class]="'s-'+(selectedItem?.status||'').toLowerCase()">{{ selectedItem?.status }}</span></div>
                    <div class="detail-field" style="grid-column:span 2"><label>Description</label><span>{{ selectedItem?.description }}</span></div>
                  </div>
                  <div class="panel-actions"><button class="btn-primary btn-sm" (click)="editMode.set(true)"><i class="pi pi-pencil"></i> Edit</button><button class="btn-outline btn-sm" (click)="interact.info('Submitting for review...')"><i class="pi pi-send"></i> Submit</button><button class="btn-outline btn-sm" (click)="showDetail.set(false)">Close</button></div>
                }
                @if(editMode()){
                  <div class="form-grid">
                    <div class="field full"><label>Title</label><input [(ngModel)]="editData.title"/></div>
                    <div class="field"><label>Category</label><select [(ngModel)]="editData.category"><option>Strategic</option><option>Financial</option><option>Operational</option><option>Compliance</option><option>Reputational</option></select></div>
                    <div class="field"><label>Owner</label><input [(ngModel)]="editData.owner"/></div>
                    <div class="field"><label>Department</label><input [(ngModel)]="editData.department"/></div>
                    <div class="field"><label>Status</label><select [(ngModel)]="editData.status"><option>DRAFT</option><option>ACTIVE</option><option>CLOSED</option></select></div>
                    <div class="field full"><label>Description</label><textarea rows="3" [(ngModel)]="editData.description"></textarea></div>
                  </div>
                  <div class="panel-actions"><button class="btn-primary btn-sm" (click)="saveEdit()"><i class="pi pi-check"></i> Save</button><button class="btn-outline btn-sm" (click)="editMode.set(false)">Cancel</button></div>
                }
              }

              @if(detailTab()==='assess'){
                <h4 class="section-title">Risk Assessment</h4>
                <div class="detail-grid">
                  <div class="detail-field"><label>Likelihood (1-5)</label><span style="font-size:24px;font-weight:800;color:#f59e0b;">{{ selectedItem?.likelihood || 3 }}</span></div>
                  <div class="detail-field"><label>Impact (1-5)</label><span style="font-size:24px;font-weight:800;color:#ef4444;">{{ selectedItem?.impact || 4 }}</span></div>
                  <div class="detail-field"><label>Inherent Score</label><span style="font-size:24px;font-weight:800;">{{ selectedItem?.inherentScore }}</span></div>
                  <div class="detail-field"><label>Residual Score</label><span style="font-size:24px;font-weight:800;color:#22c55e;">{{ selectedItem?.residualScore }}</span></div>
                  <div class="detail-field"><label>Risk Velocity</label><span>{{ selectedItem?.velocity || 'Medium (3-6 months)' }}</span></div>
                  <div class="detail-field"><label>Control Effectiveness</label><div style="display:flex;align-items:center;gap:6px;"><div class="progress-bar" style="width:100px"><div class="progress-fill" style="width:75%;background:#22c55e"></div></div><span>75%</span></div></div>
                </div>
              }

              @if(detailTab()==='treat'){
                <h4 class="section-title">Treatment Plan</h4>
                <div class="detail-grid" style="margin-bottom:20px;">
                  <div class="detail-field"><label>Strategy</label><span class="status-pill s-review">{{ selectedItem?.treatmentStrategy || 'REDUCE' }}</span></div>
                  <div class="detail-field"><label>Budget</label><span>{{ selectedItem?.budget || '$50,000' }}</span></div>
                </div>
                <h4 class="section-title">Action Plans</h4>
                <table class="mini-table"><thead><tr><th>Action</th><th>Owner</th><th>Due</th><th>Progress</th><th>Status</th></tr></thead><tbody>
                  <tr><td>Implement additional monitoring</td><td>IT Ops</td><td>Mar 31</td><td><div style="display:flex;align-items:center;gap:4px;"><div class="progress-bar" style="width:60px"><div class="progress-fill" style="width:60%;background:#f59e0b"></div></div>60%</div></td><td><span class="status-pill s-review">IN PROGRESS</span></td></tr>
                  <tr><td>Update policy documentation</td><td>Compliance</td><td>Feb 28</td><td><div style="display:flex;align-items:center;gap:4px;"><div class="progress-bar" style="width:60px"><div class="progress-fill" style="width:100%;background:#22c55e"></div></div>100%</div></td><td><span class="status-pill s-active">DONE</span></td></tr>
                  <tr><td>Staff training program</td><td>HR</td><td>Apr 15</td><td><div style="display:flex;align-items:center;gap:4px;"><div class="progress-bar" style="width:60px"><div class="progress-fill" style="width:30%;background:#3b82f6"></div></div>30%</div></td><td><span class="status-pill s-draft">PLANNED</span></td></tr>
                </tbody></table>
              }

              @if(detailTab()==='ctrl'){
                <h4 class="section-title">Linked Controls</h4>
                <table class="mini-table"><thead><tr><th>Control</th><th>Type</th><th>Effectiveness</th><th>Last Test</th><th>Result</th></tr></thead><tbody>
                  @for(c of riskControls;track $index){<tr><td><strong>{{c.name}}</strong></td><td>{{c.type}}</td><td><div style="display:flex;align-items:center;gap:4px;"><div class="progress-bar" style="width:60px"><div class="progress-fill" [style.width.%]="c.effectiveness" [style.background]="c.effectiveness>85?'#22c55e':'#f59e0b'"></div></div>{{c.effectiveness}}%</div></td><td>{{ c.lastTestDate | date:'shortDate' }}</td><td><span class="status-pill" [class]="c.lastTestResult==='PASS'?'s-active':'s-review'">{{c.lastTestResult}}</span></td></tr>}
                </tbody></table>
                <button class="btn-outline btn-sm" (click)="interact.info('Linking new control...')"><i class="pi pi-link"></i> Link Control</button>
              }

              @if(detailTab()==='kris'){
                <h4 class="section-title">Key Risk Indicators</h4>
                <table class="mini-table"><thead><tr><th>KRI</th><th>Current</th><th>Warning</th><th>Critical</th><th>Status</th></tr></thead><tbody>
                  @for(k of riskKRIs;track $index){<tr><td><strong>{{k.name}}</strong></td><td><strong [style.color]="k.current > k.critical ? '#ef4444' : k.current > k.warning ? '#f59e0b' : '#22c55e'">{{k.current}}{{k.unit}}</strong></td><td>{{k.warning}}{{k.unit}}</td><td>{{k.critical}}{{k.unit}}</td><td><span class="status-pill" [class]="k.current > k.critical ? 's-failed' : k.current > k.warning ? 's-review' : 's-active'">{{ k.current > k.critical ? 'BREACH' : k.current > k.warning ? 'WARNING' : 'NORMAL' }}</span></td></tr>}
                </tbody></table>
                <button class="btn-outline btn-sm" (click)="interact.info('Adding new KRI...')"><i class="pi pi-plus"></i> Add KRI</button>
              }

              @if(detailTab()==='docs'){
                <h4 class="section-title">Documents & Attachments</h4>
                <div style="border:2px dashed #e2e8f0;border-radius:12px;padding:30px;text-align:center;margin-bottom:16px;cursor:pointer;" (click)="interact.info('File upload dialog...')">
                  <i class="pi pi-cloud-upload" style="font-size:32px;color:#94a3b8;display:block;margin-bottom:8px;"></i>
                  <p style="font-size:14px;color:#64748b;margin:0;">Drag & drop files or <strong style="color:#2563eb;">browse</strong></p>
                  <p style="font-size:12px;color:#94a3b8;margin:4px 0 0;">PDF, DOC, XLS, Images (max 10MB)</p>
                </div>
                <table class="mini-table"><thead><tr><th>File</th><th>Type</th><th>Size</th><th>Uploaded</th><th>Actions</th></tr></thead><tbody>
                  <tr><td><i class="pi pi-file-pdf" style="color:#ef4444;margin-right:6px;"></i>Risk_Assessment_2026.pdf</td><td>PDF</td><td>2.4 MB</td><td>Feb 10, 2026</td><td class="actions-cell"><button class="icon-btn" (click)="interact.success('Downloading...')"><i class="pi pi-download"></i></button><button class="icon-btn danger" (click)="interact.warn('File deleted')"><i class="pi pi-trash"></i></button></td></tr>
                  <tr><td><i class="pi pi-file" style="color:#3b82f6;margin-right:6px;"></i>Control_Evidence.docx</td><td>DOCX</td><td>1.1 MB</td><td>Feb 8, 2026</td><td class="actions-cell"><button class="icon-btn" (click)="interact.success('Downloading...')"><i class="pi pi-download"></i></button><button class="icon-btn danger" (click)="interact.warn('File deleted')"><i class="pi pi-trash"></i></button></td></tr>
                </tbody></table>
              }

              @if(detailTab()==='hist'){
                <h4 class="section-title">Audit Trail</h4>
                <div style="padding-left:16px;">
                  <div class="timeline-item"><span class="timeline-time">Feb 15</span><div class="timeline-content"><strong>Status changed</strong> DRAFT → ACTIVE by Nguyễn Risk Manager</div></div>
                  <div class="timeline-item"><span class="timeline-time">Feb 14</span><div class="timeline-content"><strong>Assessment updated</strong> Likelihood: 3→4, Impact: 4→4 by Phạm Risk Analyst</div></div>
                  <div class="timeline-item"><span class="timeline-time">Feb 12</span><div class="timeline-content"><strong>Control linked</strong> CTR-001 Transaction Monitoring by Admin</div></div>
                  <div class="timeline-item"><span class="timeline-time">Feb 10</span><div class="timeline-content"><strong>Document uploaded</strong> Risk_Assessment_2026.pdf by Nguyễn Risk Manager</div></div>
                  <div class="timeline-item"><span class="timeline-time">Feb 8</span><div class="timeline-content"><strong>Created</strong> by Nguyễn Risk Manager</div></div>
                </div>
              }
            </div>
          </div>
        </div>
      }

      <!-- CREATE DIALOG -->
      @if (showCreate()) {
        <div class="overlay" (click)="showCreate.set(false)">
          <div class="side-panel" (click)="$event.stopPropagation()">
            <div class="panel-header"><h2>Register New Risk</h2><button class="close-btn" (click)="showCreate.set(false)"><i class="pi pi-times"></i></button></div>
            <div class="panel-body">
              <div class="form-grid">
                <div class="field full"><label>Risk Title</label><input [(ngModel)]="newItem.title" placeholder="Enter risk title"/></div>
                <div class="field"><label>Category</label><select [(ngModel)]="newItem.category"><option value="">Select...</option><option>Strategic</option><option>Financial</option><option>Operational</option><option>Compliance</option><option>Reputational</option></select></div>
                <div class="field"><label>Department</label><select [(ngModel)]="newItem.department"><option value="">Select...</option><option>Risk Management</option><option>Finance</option><option>IT</option><option>Operations</option><option>Compliance</option></select></div>
                <div class="field"><label>Risk Owner</label><input [(ngModel)]="newItem.owner" placeholder="Assigned owner"/></div>
                <div class="field"><label>Treatment Strategy</label><select [(ngModel)]="newItem.treatmentStrategy"><option value="">Select...</option><option>Avoid</option><option>Reduce</option><option>Transfer</option><option>Accept</option></select></div>
                <div class="field"><label>Likelihood (1-5)</label><select [(ngModel)]="newItem.likelihood"><option>1</option><option>2</option><option>3</option><option>4</option><option>5</option></select></div>
                <div class="field"><label>Impact (1-5)</label><select [(ngModel)]="newItem.impact"><option>1</option><option>2</option><option>3</option><option>4</option><option>5</option></select></div>
                <div class="field full"><label>Description</label><textarea rows="3" [(ngModel)]="newItem.description" placeholder="Describe the risk..."></textarea></div>
              </div>
              <div class="panel-actions"><button class="btn-outline" (click)="showCreate.set(false)">Cancel</button><button class="btn-outline" (click)="interact.info('Saved as draft')"><i class="pi pi-save"></i> Save Draft</button><button class="btn-primary" (click)="createItem()"><i class="pi pi-plus"></i> Register Risk</button></div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .page{max-width:1600px;margin:0 auto}.page-header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:20px;flex-wrap:wrap;gap:12px}.page-header h1{font-size:28px;font-weight:800;color:#0f172a;margin:0}.page-header p{font-size:14px;color:#64748b;margin:4px 0 0}.page-actions{display:flex;gap:10px}.btn-outline,.btn-primary,.btn-sm{padding:10px 20px;border-radius:10px;font-size:14px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:6px;border:none;transition:all .2s}.btn-sm{padding:6px 14px;font-size:12px}.btn-outline{background:#fff;border:1px solid #e2e8f0;color:#475569}.btn-outline:hover{background:#f8fafc}.btn-primary{background:linear-gradient(135deg,#1e3a8a,#2563eb);color:#fff}.btn-primary:hover{box-shadow:0 4px 12px rgba(37,99,235,.3)}.btn-danger{background:#ef4444;color:#fff;border:none;padding:6px 14px;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer}.btn-success{background:#22c55e;color:#fff;border:none;padding:6px 14px;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer}.hero-section{position:relative;border-radius:16px;overflow:hidden;height:140px;margin-bottom:20px}.hero-img{width:100%;height:100%;object-fit:cover}.hero-ov{position:absolute;inset:0;background:linear-gradient(135deg,rgba(15,23,42,.85),rgba(30,58,138,.7));display:flex;flex-direction:column;justify-content:center;padding:0 32px}.hero-ov h2{font-size:24px;font-weight:800;color:#fff;margin:0 0 4px}.hero-ov p{font-size:14px;color:rgba(255,255,255,.7);margin:0}.kpi-row{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:20px}.kpi-card{display:flex;align-items:center;gap:14px;padding:18px;background:#fff;border-radius:14px;border:1px solid #e2e8f0}.kpi-icon{width:44px;height:44px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:18px}.kpi-icon.blue{background:#eff6ff;color:#3b82f6}.kpi-icon.red{background:#fef2f2;color:#ef4444}.kpi-icon.green{background:#f0fdf4;color:#22c55e}.kpi-icon.orange{background:#fffbeb;color:#f59e0b}.kpi-icon.purple{background:#f5f3ff;color:#8b5cf6}.kpi-val{font-size:22px;font-weight:800;color:#0f172a;display:block}.kpi-lbl{font-size:12px;color:#64748b}.tabs{display:flex;gap:4px;margin-bottom:20px;background:#fff;border-radius:12px;padding:4px;border:1px solid #e2e8f0;flex-wrap:wrap}.tab{padding:10px 20px;border-radius:8px;border:none;background:none;font-size:14px;font-weight:500;color:#64748b;cursor:pointer;transition:all .2s;white-space:nowrap}.tab.active{background:#1e3a8a;color:#fff}.tab:hover:not(.active){background:#f1f5f9}.filter-bar{display:flex;gap:10px;margin-bottom:14px;align-items:center;flex-wrap:wrap}.search-input{padding:10px 16px;border:1px solid #e2e8f0;border-radius:10px;font-size:14px;width:260px;outline:none}.search-input:focus{border-color:#2563eb}.filter-select{padding:10px 14px;border:1px solid #e2e8f0;border-radius:10px;font-size:13px;background:#fff;cursor:pointer}.result-count{font-size:13px;color:#64748b;margin-left:auto}.data-table{background:#fff;border-radius:14px;border:1px solid #e2e8f0;overflow:auto}table{width:100%;border-collapse:collapse;font-size:13px}thead th{text-align:left;padding:12px;background:#f8fafc;color:#64748b;font-size:11px;font-weight:600;text-transform:uppercase;border-bottom:2px solid #e2e8f0;white-space:nowrap;cursor:pointer}th:hover{color:#2563eb}tbody td{padding:10px 12px;border-bottom:1px solid #f1f5f9;color:#334155;white-space:nowrap}tbody tr{cursor:pointer;transition:background .15s}tbody tr:hover{background:#f8fafc}.mono{font-family:monospace;font-size:12px}.status-pill{font-size:11px;padding:3px 10px;border-radius:20px;background:#f1f5f9;color:#475569;font-weight:600}.s-active{background:#f0fdf4;color:#22c55e}.s-draft{background:#f1f5f9;color:#94a3b8}.s-review{background:#fffbeb;color:#f59e0b}.s-closed,.s-resolved{background:#eff6ff;color:#3b82f6}.s-overdue,.s-failed{background:#fef2f2;color:#ef4444}.priority-tag{padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700}.p-high,.p-critical{background:#fef2f2;color:#ef4444}.p-medium{background:#fffbeb;color:#f59e0b}.p-low{background:#f0fdf4;color:#22c55e}.actions-cell{display:flex;gap:4px}.icon-btn{width:30px;height:30px;border-radius:6px;border:1px solid #e2e8f0;background:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center}.icon-btn:hover{background:#f1f5f9}.icon-btn.danger:hover{background:#fef2f2;border-color:#fecaca}.icon-btn i{font-size:12px;color:#64748b}.pagination{display:flex;align-items:center;justify-content:center;gap:12px;padding:14px}.pagination button{padding:8px 14px;border:1px solid #e2e8f0;border-radius:8px;background:#fff;cursor:pointer;font-size:13px}.pagination button:disabled{opacity:.4;cursor:default}.pagination span{font-size:13px;color:#64748b}.overlay{position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:200;display:flex;justify-content:flex-end}.side-panel{width:700px;max-width:95vw;background:#fff;height:100vh;overflow-y:auto;box-shadow:-10px 0 40px rgba(0,0,0,.15);animation:slideIn .3s ease}@keyframes slideIn{from{transform:translateX(100%)}}.panel-header{display:flex;justify-content:space-between;align-items:flex-start;padding:24px;border-bottom:1px solid #e2e8f0}.panel-id{font-size:12px;font-family:monospace;color:#64748b}.panel-header h2{font-size:20px;font-weight:700;color:#0f172a;margin:4px 0 0}.close-btn{background:#f1f5f9;border:none;width:36px;height:36px;border-radius:10px;cursor:pointer;display:flex;align-items:center;justify-content:center}.close-btn:hover{background:#e2e8f0}.panel-body{padding:24px}.detail-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px}.detail-field label{font-size:11px;font-weight:600;color:#94a3b8;text-transform:uppercase;display:block;margin-bottom:4px}.detail-field span,.detail-field .val{font-size:14px;color:#1e293b;font-weight:500}.panel-actions{display:flex;gap:10px;margin-top:20px;padding-top:16px;border-top:1px solid #f1f5f9}.form-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}.field{display:flex;flex-direction:column;gap:6px}.field.full{grid-column:span 2}.field label{font-size:13px;font-weight:600;color:#374151}.field input,.field select,.field textarea{padding:10px 14px;border:1px solid #e2e8f0;border-radius:10px;font-size:14px;outline:none;font-family:inherit}.field input:focus,.field select:focus,.field textarea:focus{border-color:#2563eb}.panel-tabs{display:flex;gap:2px;border-bottom:2px solid #e2e8f0;margin-bottom:20px}.panel-tab{padding:10px 16px;border:none;background:none;font-size:13px;font-weight:500;color:#64748b;cursor:pointer;border-bottom:2px solid transparent;margin-bottom:-2px;transition:all .2s}.panel-tab.active{color:#1e3a8a;border-bottom-color:#1e3a8a;font-weight:600}.panel-tab:hover:not(.active){color:#475569}.section-title{font-size:16px;font-weight:700;color:#0f172a;margin:0 0 16px;padding-bottom:8px;border-bottom:1px solid #f1f5f9}.mini-table{width:100%;font-size:12px;border-collapse:collapse;margin-bottom:16px}.mini-table th{text-align:left;padding:8px;background:#f8fafc;color:#64748b;font-size:10px;text-transform:uppercase;border-bottom:1px solid #e2e8f0}.mini-table td{padding:8px;border-bottom:1px solid #f1f5f9;color:#334155}.progress-bar{height:8px;background:#f1f5f9;border-radius:4px;overflow:hidden}.progress-fill{height:100%;border-radius:4px;transition:width .3s}.timeline-item{display:flex;gap:12px;padding:12px 0;border-left:2px solid #e2e8f0;margin-left:8px;padding-left:20px;position:relative}.timeline-item::before{content:'';position:absolute;left:-5px;top:16px;width:8px;height:8px;border-radius:50%;background:#3b82f6;border:2px solid #fff}.timeline-time{font-size:11px;color:#94a3b8;white-space:nowrap;min-width:80px}.timeline-content{font-size:13px;color:#334155}
    .breadcrumb{display:flex;gap:6px;align-items:center;margin-bottom:16px;font-size:13px;color:#94a3b8}.breadcrumb a{color:#3b82f6;text-decoration:none}.breadcrumb a:hover{text-decoration:underline}.breadcrumb .sep{color:#cbd5e1}
    .sub-tabs{display:flex;gap:2px;border-bottom:2px solid #e2e8f0;margin-bottom:16px}.sub-tab{padding:8px 14px;border:none;background:none;font-size:12px;font-weight:500;color:#94a3b8;cursor:pointer;border-bottom:2px solid transparent;margin-bottom:-2px}.sub-tab.active{color:#1e3a8a;border-bottom-color:#1e3a8a;font-weight:600}
    .card-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}.info-card{padding:20px;background:#fff;border-radius:14px;border:1px solid #e2e8f0;display:flex;flex-direction:column;gap:8px}.info-card h4{font-size:14px;font-weight:700;margin:0;color:#0f172a}.info-card p{font-size:12px;color:#64748b;margin:0}
    .score-gauge{width:80px;height:80px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:800;border:4px solid}
    .empty-state{text-align:center;padding:60px 20px;background:#fff;border-radius:16px;border:1px solid #e2e8f0}.empty-state i{font-size:48px;color:#cbd5e1;display:block;margin-bottom:12px}.empty-state h3{font-size:18px;color:#475569;margin:0 0 8px}.empty-state p{font-size:14px;color:#94a3b8;margin:0 0 16px}
    .skeleton{background:linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%);background-size:200% 100%;animation:shimmer 1.5s infinite;border-radius:8px}@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
    @media(max-width:1024px){.kpi-row,.card-grid{grid-template-columns:repeat(2,1fr)}.detail-grid,.form-grid{grid-template-columns:1fr}.field.full{grid-column:span 1}.side-panel{width:100%}}
`]
})
export class RiskManagementComponent implements OnInit {
  activeTab = signal('register');
  detailTab = signal('info');
  showDetail = signal(false);
  showCreate = signal(false);
  editMode = signal(false);
  page = signal(1);
  pageSize = 12;
  searchTerm = '';
  sortField = '';
  sortDir: 'asc'|'desc' = 'asc';
  filters: any = { category: '', level: '', status: '' };
  selectedItem: any = null;
  editData: any = {};
  newItem: any = { title:'',category:'',department:'',owner:'',description:'',likelihood:'3',impact:'3',treatmentStrategy:'' };

  allData: any[] = [];
  filtered: any[] = [];
  allControls: any[] = [];
  filteredControls: any[] = [];
  ctrlSearch = '';
  ctrlTypeFilter = '';
  kriData: any[] = [];
  riskControls: any[] = [];
  riskKRIs: any[] = [];
  heatmapData: any[] = [];
  riskReports = [
    { name:'Risk Register Report', desc:'Complete register with scores', icon:'pi pi-list', color:'#3b82f6' },
    { name:'Risk Heat Map', desc:'5x5 likelihood × impact matrix', icon:'pi pi-th-large', color:'#ef4444' },
    { name:'Top Risks Report', desc:'Top 10 critical/high risks', icon:'pi pi-exclamation-triangle', color:'#f59e0b' },
    { name:'KRI Dashboard', desc:'Key Risk Indicators summary', icon:'pi pi-chart-line', color:'#22c55e' },
    { name:'Treatment Status', desc:'Action plan completion tracker', icon:'pi pi-check-circle', color:'#8b5cf6' },
    { name:'Risk Trend Analysis', desc:'Risk score trends over time', icon:'pi pi-chart-bar', color:'#06b6d4' },
  ];

  criticalCount = 0; highCount = 0; controlCount = 0; mitigatedPct = 0;

  constructor(public mockData: MockDataService, public interact: InteractionService) {}

  ngOnInit() {
    this.allData = this.mockData.getRisks();
    this.filtered = [...this.allData];
    this.allControls = this.mockData.getControls();
    this.filteredControls = [...this.allControls];
    this.heatmapData = this.mockData.getHeatMapData();
    this.criticalCount = this.allData.filter(r => r.level === 'Critical').length;
    this.highCount = this.allData.filter(r => r.level === 'High').length;
    this.controlCount = this.allControls.length;
    this.mitigatedPct = Math.round((this.allData.filter(r => r.residualScore < r.inherentScore).length / this.allData.length) * 100);
    this.kriData = [
      { name:'VaR Utilization', riskId:'RSK-001', current:82, warning:75, critical:90, unit:'%', trend:'UP' },
      { name:'Fraud Loss Rate', riskId:'RSK-003', current:0.15, warning:0.2, critical:0.5, unit:'%', trend:'DOWN' },
      { name:'System Uptime', riskId:'RSK-004', current:99.8, warning:99.5, critical:99.0, unit:'%', trend:'UP' },
      { name:'Open Audit Findings', riskId:'RSK-006', current:5, warning:3, critical:8, unit:'', trend:'UP' },
      { name:'SLA Breach Rate', riskId:'RSK-007', current:4.2, warning:5, critical:10, unit:'%', trend:'DOWN' },
      { name:'Customer Complaints', riskId:'RSK-005', current:12, warning:15, critical:25, unit:'/month', trend:'DOWN' },
      { name:'Regulatory Penalties', riskId:'RSK-002', current:0, warning:1, critical:3, unit:'', trend:'DOWN' },
    ];
    this.riskControls = this.allControls.slice(0, 3);
    this.riskKRIs = this.kriData.slice(0, 3);
  }

  paginated = computed(() => { const s = (this.page()-1)*this.pageSize; return this.filtered.slice(s, s+this.pageSize); });
  totalPages = computed(() => Math.ceil(this.filtered.length/this.pageSize)||1);

  applyFilters() {
    let r = [...this.allData];
    if(this.searchTerm) { const q=this.searchTerm.toLowerCase(); r=r.filter(x=>x.id.toLowerCase().includes(q)||x.title.toLowerCase().includes(q)||x.owner.toLowerCase().includes(q)); }
    if(this.filters.category) r=r.filter(x=>x.category===this.filters.category);
    if(this.filters.level) r=r.filter(x=>x.level===this.filters.level);
    if(this.filters.status) r=r.filter(x=>x.status===this.filters.status);
    if(this.sortField) { r.sort((a:any,b:any)=>{ const va=a[this.sortField],vb=b[this.sortField]; return this.sortDir==='asc'?(va<vb?-1:1):(va>vb?-1:1); }); }
    this.filtered=r; this.page.set(1);
  }
  sortBy(f:string) { if(this.sortField===f) this.sortDir=this.sortDir==='asc'?'desc':'asc'; else { this.sortField=f; this.sortDir='asc'; } this.applyFilters(); }
  filterControls() {
    let r=[...this.allControls];
    if(this.ctrlSearch) { const q=this.ctrlSearch.toLowerCase(); r=r.filter(c=>c.name.toLowerCase().includes(q)||c.id.toLowerCase().includes(q)); }
    if(this.ctrlTypeFilter) r=r.filter(c=>c.type===this.ctrlTypeFilter);
    this.filteredControls=r;
  }
  viewItem(item:any) { this.selectedItem={...item}; this.editData={...item}; this.editMode.set(false); this.detailTab.set('info'); this.showDetail.set(true); }
  editItem(item:any) { this.selectedItem={...item}; this.editData={...item}; this.editMode.set(true); this.detailTab.set('info'); this.showDetail.set(true); }
  saveEdit() { const idx=this.allData.findIndex(x=>x.id===this.selectedItem.id); if(idx>=0){Object.assign(this.allData[idx],this.editData); this.selectedItem={...this.editData}; this.applyFilters(); this.interact.success('Risk updated'); this.editMode.set(false);} }
  deleteItem(item:any) { if(confirm('Delete '+item.id+'?')){ this.allData=this.allData.filter(x=>x.id!==item.id); this.applyFilters(); this.interact.success('Deleted'); } }
  createItem() {
    const id='RSK-'+String(Date.now()).slice(-6);
    const l=+(this.newItem.likelihood||3), imp=+(this.newItem.impact||3);
    this.allData.unshift({ ...this.newItem, id, inherentScore:l*imp, residualScore:Math.round(l*imp*0.6), level:l*imp>=17?'Critical':l*imp>=10?'High':l*imp>=5?'Medium':'Low', status:'DRAFT', createdAt:new Date() });
    this.applyFilters(); this.newItem={title:'',category:'',department:'',owner:'',description:'',likelihood:'3',impact:'3',treatmentStrategy:''}; this.showCreate.set(false); this.interact.success('Created: '+id);
  }
  exportData() { this.interact.exportCSV(this.filtered,'risks',['id','title','category','owner','inherentScore','residualScore','level','status']); }

  getHeatRow(likelihood:number): any[] {
    return [1,2,3,4,5].map(impact => {
      const score = likelihood * impact;
      const count = this.allData.filter(r => r.likelihood === likelihood && r.impact === impact).length;
      const color = score >= 17 ? '#ef4444' : score >= 10 ? '#f97316' : score >= 5 ? '#f59e0b' : '#22c55e';
      return { count, color: count > 0 ? color : color+'40' };
    });
  }
}
