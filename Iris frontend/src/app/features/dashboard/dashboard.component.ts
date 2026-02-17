import { Component, OnInit, AfterViewInit, ElementRef, ViewChild, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MockDataService } from '../../core/services/mock-data.service';
import { AuthService } from '../../core/auth/auth.service';
import { DashboardStats, RiskLevel, Risk, FraudAlert, UserRole } from '../../core/models';
import * as d3 from 'd3';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="dashboard">
      <div class="dash-header">
        <div class="dash-title">
          <h1>Welcome, {{ auth.user()?.firstName }}!</h1>
          <p>{{ getRoleWelcomeMessage() }} · Last updated: {{ currentTime }}</p>
        </div>
        <div class="dash-actions">
          <button class="btn-outline" (click)="refreshData()">
            <i class="pi pi-refresh" [class.spin]="refreshing()"></i> Refresh
          </button>
          <button class="btn-primary"><i class="pi pi-download"></i> Export</button>
        </div>
      </div>

      <div class="hero-banner">
        <img src="assets/images/hero-banner.png" alt="IRIS" class="hero-img" />
        <div class="hero-overlay">
          <div class="hero-content">
            <h2>Intelligent Risk & Fraud Platform</h2>
            <p>Nền Tảng Quản Trị Rủi Ro & Phòng Chống Gian Lận</p>
            <div class="hero-stats">
              <div class="hero-stat"><span class="stat-value">{{ stats.transactionsToday | number }}</span><span class="stat-label">Transactions Today</span></div>
              <div class="hero-stat"><span class="stat-value">\{{ stats.fraudPrevented | number }}</span><span class="stat-label">Fraud Prevented</span></div>
              <div class="hero-stat"><span class="stat-value">{{ stats.complianceScore }}%</span><span class="stat-label">Compliance Score</span></div>
              <div class="hero-stat"><span class="stat-value">{{ stats.modelsInProduction }}</span><span class="stat-label">AI Models Active</span></div>
            </div>
          </div>
        </div>
      </div>

      <div class="kpi-grid">
        <div class="kpi-card critical" routerLink="/risk-management">
          <div class="kpi-icon"><i class="pi pi-exclamation-triangle"></i></div>
          <div class="kpi-info"><span class="kpi-value">{{ stats.criticalRisks }}</span><span class="kpi-label">Critical Risks</span></div>
          <div class="kpi-trend up"><i class="pi pi-arrow-up"></i> +2</div>
        </div>
        <div class="kpi-card warning" routerLink="/risk-management">
          <div class="kpi-icon"><i class="pi pi-exclamation-circle"></i></div>
          <div class="kpi-info"><span class="kpi-value">{{ stats.highRisks }}</span><span class="kpi-label">High Risks</span></div>
          <div class="kpi-trend down"><i class="pi pi-arrow-down"></i> -1</div>
        </div>
        <div class="kpi-card info" routerLink="/fraud-detection">
          <div class="kpi-icon"><i class="pi pi-shield"></i></div>
          <div class="kpi-info"><span class="kpi-value">{{ stats.totalAlerts }}</span><span class="kpi-label">Fraud Alerts</span></div>
          <div class="kpi-trend up"><i class="pi pi-arrow-up"></i> +8</div>
        </div>
        <div class="kpi-card success" routerLink="/case-management">
          <div class="kpi-icon"><i class="pi pi-briefcase"></i></div>
          <div class="kpi-info"><span class="kpi-value">{{ stats.openCases }}</span><span class="kpi-label">Open Cases</span></div>
          <div class="kpi-trend stable"><i class="pi pi-minus"></i> 0</div>
        </div>
      </div>

      <div class="chart-grid two-cols">
        <div class="chart-card large">
          <div class="card-header"><h3>Risk Heat Map</h3><span class="card-badge">Likelihood × Impact</span></div>
          <div #heatmapChart class="chart-container" style="height:340px;"></div>
        </div>
        <div class="chart-card">
          <div class="card-header"><h3>Top 10 Critical Risks</h3><a routerLink="/risk-management" class="card-link">View All →</a></div>
          <div class="top-risks-list">
            @for (risk of topRisks; track risk.id; let i = $index) {
              <div class="risk-row">
                <span class="risk-rank">{{ i + 1 }}</span>
                <div class="risk-info"><span class="risk-title">{{ risk.title }}</span><span class="risk-meta">{{ risk.category }} · {{ risk.department }}</span></div>
                <span class="risk-score" [style.background]="getRiskColor(risk.riskLevel)">{{ risk.inherentScore }}</span>
              </div>
            }
          </div>
        </div>
      </div>

      <div class="chart-grid three-cols">
        <div class="chart-card"><div class="card-header"><h3>Alert Trend (30 Days)</h3></div><div #alertTrendChart class="chart-container" style="height:260px;"></div></div>
        <div class="chart-card"><div class="card-header"><h3>Risks by Category</h3></div><div #riskCategoryChart class="chart-container" style="height:260px;"></div></div>
        <div class="chart-card"><div class="card-header"><h3>Risks by Department</h3></div><div #riskDeptChart class="chart-container" style="height:260px;"></div></div>
      </div>

      <div class="module-section">
        <h2 class="section-title">Platform Modules</h2>
        <div class="module-grid">
          @for (mod of modules; track mod.route) {
            @if (canAccess(mod.route)) {
            <a [routerLink]="mod.route" class="module-card">
              <img [src]="mod.image" [alt]="mod.label" class="module-img" />
              <div class="module-overlay">
                <i [class]="mod.icon + ' module-icon'"></i>
                <h4>{{ mod.label }}</h4>
                <p>{{ mod.description }}</p>
              </div>
            </a>
            }
          }
        </div>
      </div>

      <div class="chart-grid two-cols">
        <div class="chart-card">
          <div class="card-header"><h3>Recent Fraud Alerts</h3><a routerLink="/fraud-detection" class="card-link">View All →</a></div>
          <div class="recent-table">
            <table>
              <thead><tr><th>Alert ID</th><th>Customer</th><th>Type</th><th>Amount</th><th>Score</th><th>Priority</th><th>Status</th></tr></thead>
              <tbody>
                @for (alert of recentAlerts; track alert.id) {
                  <tr>
                    <td class="mono">{{ alert.id }}</td>
                    <td>{{ alert.customerName }}</td>
                    <td>{{ alert.alertType }}</td>
                    <td class="mono">\{{ alert.amount | number }}</td>
                    <td><div class="score-wrap"><span class="score-bar"><span class="score-fill" [style.width.%]="alert.fraudScore/10" [style.background]="getScoreColor(alert.fraudScore)"></span></span><span class="score-val">{{ alert.fraudScore }}</span></div></td>
                    <td><span class="priority-tag" [class]="'p-' + alert.priority.toLowerCase()">{{ alert.priority }}</span></td>
                    <td><span class="status-tag" [class]="'s-' + alert.status.toLowerCase().replace(' ','_')">{{ alert.status.replace('_',' ') }}</span></td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
        <div class="chart-card">
          <div class="card-header"><h3>System Health</h3><span class="card-badge live">Live</span></div>
          <div class="health-list">
            @for (svc of systemHealth; track svc.service) {
              <div class="health-row">
                <div class="health-status" [class]="'hs-' + svc.status.toLowerCase()"></div>
                <span class="health-name">{{ svc.service }}</span>
                <div class="health-bars">
                  <div class="hbar" title="CPU"><div class="hbar-fill" [style.width.%]="svc.cpu" [style.background]="getBarColor(svc.cpu)"></div><span>{{ svc.cpu }}%</span></div>
                  <div class="hbar" title="Memory"><div class="hbar-fill" [style.width.%]="svc.memory" [style.background]="getBarColor(svc.memory)"></div><span>{{ svc.memory }}%</span></div>
                </div>
                <span class="health-latency">{{ svc.responseTime }}ms</span>
              </div>
            }
          </div>
        </div>
      </div>

      <div class="chart-grid two-cols" style="margin-top:20px">
        <div class="chart-card">
          <div class="card-header"><h3>SLA Metrics</h3><span class="card-badge" style="background:#f0fdf4;color:#22c55e">On Track</span></div>
          <div style="padding:16px;display:flex;flex-direction:column;gap:10px">
            <div style="display:flex;align-items:center;gap:8px"><span style="width:120px;font-size:12px;color:#64748b">Alert Response</span><div style="flex:1;height:8px;background:#f1f5f9;border-radius:4px"><div style="width:92%;height:100%;background:#22c55e;border-radius:4px"></div></div><span style="font-size:12px;font-weight:700;color:#22c55e">92% (SLA: 90%)</span></div>
            <div style="display:flex;align-items:center;gap:8px"><span style="width:120px;font-size:12px;color:#64748b">Case Resolution</span><div style="flex:1;height:8px;background:#f1f5f9;border-radius:4px"><div style="width:85%;height:100%;background:#f59e0b;border-radius:4px"></div></div><span style="font-size:12px;font-weight:700;color:#f59e0b">85% (SLA: 85%)</span></div>
            <div style="display:flex;align-items:center;gap:8px"><span style="width:120px;font-size:12px;color:#64748b">SAR Filing</span><div style="flex:1;height:8px;background:#f1f5f9;border-radius:4px"><div style="width:78%;height:100%;background:#ef4444;border-radius:4px"></div></div><span style="font-size:12px;font-weight:700;color:#ef4444">78% (SLA: 90%)</span></div>
            <div style="display:flex;align-items:center;gap:8px"><span style="width:120px;font-size:12px;color:#64748b">Model Latency</span><div style="flex:1;height:8px;background:#f1f5f9;border-radius:4px"><div style="width:98%;height:100%;background:#22c55e;border-radius:4px"></div></div><span style="font-size:12px;font-weight:700;color:#22c55e">12ms (SLA: 50ms)</span></div>
          </div>
        </div>
        <div class="chart-card">
          <div class="card-header"><h3>Compliance Status</h3><a routerLink="/compliance" class="card-link">Details →</a></div>
          <div style="padding:16px;display:grid;grid-template-columns:1fr 1fr;gap:10px">
            <div style="background:#f0fdf4;padding:14px;border-radius:10px;text-align:center"><span style="font-size:22px;font-weight:800;color:#22c55e;display:block">87%</span><span style="font-size:11px;color:#64748b">Overall Score</span></div>
            <div style="background:#fef2f2;padding:14px;border-radius:10px;text-align:center"><span style="font-size:22px;font-weight:800;color:#ef4444;display:block">4</span><span style="font-size:11px;color:#64748b">Open Violations</span></div>
            <div style="background:#eff6ff;padding:14px;border-radius:10px;text-align:center"><span style="font-size:22px;font-weight:800;color:#3b82f6;display:block">142</span><span style="font-size:11px;color:#64748b">Active Controls</span></div>
            <div style="background:#fffbeb;padding:14px;border-radius:10px;text-align:center"><span style="font-size:22px;font-weight:800;color:#f59e0b;display:block">3</span><span style="font-size:11px;color:#64748b">Due Reports</span></div>
          </div>
        </div>
      </div>

      <div class="chart-grid two-cols" style="margin-top:14px">
        <div class="chart-card">
          <div class="card-header"><h3>Model Performance</h3><a routerLink="/model-management" class="card-link">View All →</a></div>
          <div style="padding:16px">
            <table style="width:100%;font-size:12px;border-collapse:collapse"><thead><tr style="background:#f8fafc"><th style="text-align:left;padding:8px;font-size:10px;color:#64748b;text-transform:uppercase">Model</th><th style="text-align:left;padding:8px;font-size:10px;color:#64748b">Accuracy</th><th style="text-align:left;padding:8px;font-size:10px;color:#64748b">F1</th><th style="text-align:left;padding:8px;font-size:10px;color:#64748b">Drift</th><th style="text-align:left;padding:8px;font-size:10px;color:#64748b">Status</th></tr></thead><tbody>
              <tr><td style="padding:6px 8px;border-bottom:1px solid #f1f5f9"><strong>Fraud Detector v3</strong></td><td style="padding:6px 8px;color:#22c55e;font-weight:700;border-bottom:1px solid #f1f5f9">93.7%</td><td style="padding:6px 8px;border-bottom:1px solid #f1f5f9">90.3%</td><td style="padding:6px 8px;color:#22c55e;border-bottom:1px solid #f1f5f9">0.02</td><td style="padding:6px 8px;border-bottom:1px solid #f1f5f9"><span style="padding:2px 8px;background:#f0fdf4;color:#22c55e;border-radius:10px;font-size:10px;font-weight:600">HEALTHY</span></td></tr>
              <tr><td style="padding:6px 8px;border-bottom:1px solid #f1f5f9"><strong>AML Risk Scorer</strong></td><td style="padding:6px 8px;color:#22c55e;font-weight:700;border-bottom:1px solid #f1f5f9">91.2%</td><td style="padding:6px 8px;border-bottom:1px solid #f1f5f9">88.5%</td><td style="padding:6px 8px;color:#f59e0b;border-bottom:1px solid #f1f5f9">0.08</td><td style="padding:6px 8px;border-bottom:1px solid #f1f5f9"><span style="padding:2px 8px;background:#fffbeb;color:#f59e0b;border-radius:10px;font-size:10px;font-weight:600">DRIFT</span></td></tr>
              <tr><td style="padding:6px 8px"><strong>Txn Anomaly</strong></td><td style="padding:6px 8px;color:#22c55e;font-weight:700">95.1%</td><td style="padding:6px 8px">92.8%</td><td style="padding:6px 8px;color:#22c55e">0.01</td><td style="padding:6px 8px"><span style="padding:2px 8px;background:#f0fdf4;color:#22c55e;border-radius:10px;font-size:10px;font-weight:600">HEALTHY</span></td></tr>
            </tbody></table>
          </div>
        </div>
        <div class="chart-card">
          <div class="card-header"><h3>Quick Links</h3></div>
          <div style="padding:16px;display:grid;grid-template-columns:1fr 1fr;gap:8px">
            <a routerLink="/risk-management" style="padding:14px;background:#f8fafc;border-radius:10px;border:1px solid #e2e8f0;text-decoration:none;display:flex;align-items:center;gap:8px;color:#334155;font-size:13px;font-weight:600"><i class="pi pi-exclamation-triangle" style="color:#ef4444"></i> Risk Register</a>
            <a routerLink="/fraud-detection" style="padding:14px;background:#f8fafc;border-radius:10px;border:1px solid #e2e8f0;text-decoration:none;display:flex;align-items:center;gap:8px;color:#334155;font-size:13px;font-weight:600"><i class="pi pi-shield" style="color:#3b82f6"></i> Fraud Alerts</a>
            <a routerLink="/case-management" style="padding:14px;background:#f8fafc;border-radius:10px;border:1px solid #e2e8f0;text-decoration:none;display:flex;align-items:center;gap:8px;color:#334155;font-size:13px;font-weight:600"><i class="pi pi-briefcase" style="color:#8b5cf6"></i> Open Cases</a>
            <a routerLink="/compliance" style="padding:14px;background:#f8fafc;border-radius:10px;border:1px solid #e2e8f0;text-decoration:none;display:flex;align-items:center;gap:8px;color:#334155;font-size:13px;font-weight:600"><i class="pi pi-check-circle" style="color:#22c55e"></i> Compliance</a>
            <a routerLink="/analytics" style="padding:14px;background:#f8fafc;border-radius:10px;border:1px solid #e2e8f0;text-decoration:none;display:flex;align-items:center;gap:8px;color:#334155;font-size:13px;font-weight:600"><i class="pi pi-chart-bar" style="color:#f59e0b"></i> Analytics</a>
            <a routerLink="/admin" style="padding:14px;background:#f8fafc;border-radius:10px;border:1px solid #e2e8f0;text-decoration:none;display:flex;align-items:center;gap:8px;color:#334155;font-size:13px;font-weight:600"><i class="pi pi-cog" style="color:#64748b"></i> Admin</a>
          </div>
        </div>
      </div>

    </div>
  `,
  styles: [`
    .dashboard { max-width: 1600px; margin: 0 auto; }
    .dash-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .dash-title h1 { font-size: 28px; font-weight: 800; color: #0f172a; margin: 0; }
    .dash-title p { font-size: 14px; color: #64748b; margin: 4px 0 0; }
    .dash-actions { display: flex; gap: 10px; }
    .btn-outline, .btn-primary { padding: 10px 20px; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 6px; border: none; }
    .btn-outline { background: #fff; border: 1px solid #e2e8f0; color: #475569; }
    .btn-outline:hover { background: #f8fafc; }
    .btn-primary { background: linear-gradient(135deg, #1e3a8a, #2563eb); color: #fff; }
    .btn-primary:hover { box-shadow: 0 4px 12px rgba(37,99,235,0.3); }
    .spin { animation: spin 1s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    .hero-banner { position: relative; border-radius: 20px; overflow: hidden; margin-bottom: 24px; height: 220px; }
    .hero-img { width: 100%; height: 100%; object-fit: cover; }
    .hero-overlay { position: absolute; inset: 0; background: linear-gradient(135deg, rgba(15,23,42,0.88), rgba(30,58,138,0.75)); display: flex; align-items: center; padding: 0 48px; }
    .hero-content h2 { font-size: 28px; font-weight: 800; color: #fff; margin-bottom: 4px; }
    .hero-content > p { font-size: 15px; color: rgba(255,255,255,0.7); margin-bottom: 24px; }
    .hero-stats { display: flex; gap: 40px; }
    .hero-stat { display: flex; flex-direction: column; }
    .stat-value { font-size: 28px; font-weight: 800; color: #fff; }
    .stat-label { font-size: 12px; color: rgba(255,255,255,0.6); text-transform: uppercase; letter-spacing: 0.5px; }

    .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
    .kpi-card { display: flex; align-items: center; gap: 16px; padding: 20px; background: #fff; border-radius: 16px; border: 1px solid #e2e8f0; cursor: pointer; transition: all 0.2s; position: relative; overflow: hidden; }
    .kpi-card:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(0,0,0,0.08); }
    .kpi-card::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 4px; }
    .kpi-card.critical::before { background: #ef4444; }
    .kpi-card.warning::before { background: #f59e0b; }
    .kpi-card.info::before { background: #3b82f6; }
    .kpi-card.success::before { background: #22c55e; }
    .kpi-icon { width: 48px; height: 48px; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 22px; }
    .kpi-card.critical .kpi-icon { background: #fef2f2; color: #ef4444; }
    .kpi-card.warning .kpi-icon { background: #fffbeb; color: #f59e0b; }
    .kpi-card.info .kpi-icon { background: #eff6ff; color: #3b82f6; }
    .kpi-card.success .kpi-icon { background: #f0fdf4; color: #22c55e; }
    .kpi-info { flex: 1; }
    .kpi-value { font-size: 28px; font-weight: 800; color: #0f172a; display: block; }
    .kpi-label { font-size: 13px; color: #64748b; }
    .kpi-trend { font-size: 12px; font-weight: 600; padding: 4px 10px; border-radius: 20px; }
    .kpi-trend.up { color: #ef4444; background: #fef2f2; }
    .kpi-trend.down { color: #22c55e; background: #f0fdf4; }
    .kpi-trend.stable { color: #64748b; background: #f1f5f9; }

    .chart-grid { display: grid; gap: 20px; margin-bottom: 24px; }
    .chart-grid.two-cols { grid-template-columns: 1.2fr 0.8fr; }
    .chart-grid.three-cols { grid-template-columns: repeat(3, 1fr); }
    .chart-card { background: #fff; border-radius: 16px; border: 1px solid #e2e8f0; padding: 20px; }
    .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .card-header h3 { font-size: 16px; font-weight: 700; color: #0f172a; margin: 0; }
    .card-badge { font-size: 11px; font-weight: 600; padding: 4px 12px; border-radius: 20px; background: #f1f5f9; color: #64748b; }
    .card-badge.live { background: #f0fdf4; color: #22c55e; }
    .card-link { font-size: 13px; color: #2563eb; text-decoration: none; font-weight: 600; }
    .chart-container { width: 100%; }

    .top-risks-list { display: flex; flex-direction: column; gap: 6px; max-height: 340px; overflow-y: auto; }
    .risk-row { display: flex; align-items: center; gap: 12px; padding: 10px 12px; border-radius: 10px; transition: background 0.15s; }
    .risk-row:hover { background: #f8fafc; }
    .risk-rank { width: 24px; height: 24px; border-radius: 6px; background: #f1f5f9; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; color: #64748b; }
    .risk-info { flex: 1; min-width: 0; }
    .risk-title { display: block; font-size: 13px; font-weight: 600; color: #1e293b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .risk-meta { font-size: 11px; color: #94a3b8; }
    .risk-score { padding: 4px 12px; border-radius: 8px; color: #fff; font-size: 13px; font-weight: 700; }

    .module-section { margin-bottom: 24px; }
    .section-title { font-size: 20px; font-weight: 700; color: #0f172a; margin-bottom: 16px; }
    .module-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
    .module-card { position: relative; border-radius: 16px; overflow: hidden; height: 180px; display: block; text-decoration: none; transition: transform 0.3s; }
    .module-card:hover { transform: translateY(-4px); }
    .module-img { width: 100%; height: 100%; object-fit: cover; }
    .module-overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(15,23,42,0.95) 0%, rgba(15,23,42,0.3) 100%); display: flex; flex-direction: column; justify-content: flex-end; padding: 20px; }
    .module-icon { font-size: 24px; color: #60a5fa; margin-bottom: 8px; }
    .module-overlay h4 { font-size: 15px; font-weight: 700; color: #fff; margin: 0 0 4px; }
    .module-overlay p { font-size: 12px; color: rgba(255,255,255,0.6); margin: 0; }

    .recent-table { overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    thead th { text-align: left; padding: 10px 12px; color: #64748b; font-weight: 600; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #e2e8f0; }
    tbody td { padding: 10px 12px; border-bottom: 1px solid #f1f5f9; color: #334155; }
    tbody tr:hover { background: #f8fafc; }
    .mono { font-family: 'Roboto Mono', monospace; font-size: 12px; }
    .score-wrap { display: flex; align-items: center; gap: 8px; }
    .score-bar { width: 60px; height: 6px; background: #f1f5f9; border-radius: 3px; overflow: hidden; display: inline-block; }
    .score-fill { height: 100%; border-radius: 3px; display: block; }
    .score-val { font-size: 12px; font-weight: 600; color: #475569; }
    .priority-tag { padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; }
    .p-high { background: #fef2f2; color: #ef4444; }
    .p-medium { background: #fffbeb; color: #f59e0b; }
    .p-low { background: #f0fdf4; color: #22c55e; }
    .status-tag { padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; }
    .s-new { background: #eff6ff; color: #3b82f6; }
    .s-assigned { background: #faf5ff; color: #8b5cf6; }
    .s-in_review { background: #fffbeb; color: #f59e0b; }
    .s-resolved { background: #f0fdf4; color: #22c55e; }
    .s-closed { background: #f1f5f9; color: #64748b; }

    .health-list { display: flex; flex-direction: column; gap: 8px; }
    .health-row { display: flex; align-items: center; gap: 12px; padding: 8px 0; border-bottom: 1px solid #f8fafc; }
    .health-status { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
    .hs-up { background: #22c55e; box-shadow: 0 0 6px rgba(34,197,94,0.4); }
    .hs-down { background: #ef4444; box-shadow: 0 0 6px rgba(239,68,68,0.4); }
    .hs-degraded { background: #f59e0b; box-shadow: 0 0 6px rgba(245,158,11,0.4); }
    .health-name { flex: 1; font-size: 13px; font-weight: 600; color: #334155; min-width: 120px; }
    .health-bars { display: flex; gap: 8px; }
    .hbar { width: 80px; height: 6px; background: #f1f5f9; border-radius: 3px; overflow: hidden; position: relative; }
    .hbar-fill { height: 100%; border-radius: 3px; transition: width 0.5s; }
    .hbar span { position: absolute; top: -16px; right: 0; font-size: 10px; color: #94a3b8; }
    .health-latency { font-size: 12px; font-weight: 500; color: #64748b; min-width: 50px; text-align: right; font-family: 'Roboto Mono', monospace; }

    @media (max-width: 1200px) {
      .kpi-grid { grid-template-columns: repeat(2, 1fr); }
      .chart-grid.two-cols, .chart-grid.three-cols { grid-template-columns: 1fr; }
      .module-grid { grid-template-columns: repeat(2, 1fr); }
      .hero-stats { flex-wrap: wrap; gap: 20px; }
    }
    @media (max-width: 768px) {
      .kpi-grid { grid-template-columns: 1fr; }
      .module-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class DashboardComponent implements OnInit, AfterViewInit {
  @ViewChild('heatmapChart') heatmapEl!: ElementRef;
  @ViewChild('alertTrendChart') alertTrendEl!: ElementRef;
  @ViewChild('riskCategoryChart') riskCategoryEl!: ElementRef;
  @ViewChild('riskDeptChart') riskDeptEl!: ElementRef;

  stats!: DashboardStats;
  topRisks: Risk[] = [];
  recentAlerts: FraudAlert[] = [];
  systemHealth: any[] = [];
  currentTime = new Date().toLocaleTimeString();
  refreshing = signal(false);

  modules = [
    { route: '/risk-management', label: 'Risk Management', description: 'Enterprise risk register & assessment', icon: 'pi pi-exclamation-triangle', image: 'assets/images/risk-management-bg.png' },
    { route: '/fraud-detection', label: 'Fraud Detection', description: 'Real-time fraud monitoring & alerts', icon: 'pi pi-shield', image: 'assets/images/fraud-detection-bg.png' },
    { route: '/aml-screening', label: 'AML & Sanctions', description: 'Anti-money laundering screening', icon: 'pi pi-globe', image: 'assets/images/aml-screening-bg.png' },
    { route: '/case-management', label: 'Case Management', description: 'Investigation case workspace', icon: 'pi pi-briefcase', image: 'assets/images/case-management-bg.png' },
    { route: '/analytics', label: 'Data Analytics', description: 'Advanced analytics & reporting', icon: 'pi pi-chart-bar', image: 'assets/images/data-analytics-bg.png' },
    { route: '/model-management', label: 'AI/ML Models', description: 'Model lifecycle management', icon: 'pi pi-microchip-ai', image: 'assets/images/ai-model-bg.png' },
    { route: '/compliance', label: 'Compliance & Audit', description: 'Regulatory compliance tracking', icon: 'pi pi-verified', image: 'assets/images/compliance-bg.png' },
    { route: '/admin', label: 'Administration', description: 'System configuration & users', icon: 'pi pi-cog', image: 'assets/images/hero-banner.png' },
  ];

  constructor(public mockData: MockDataService, public auth: AuthService) {}

  canAccess(route: string): boolean { return this.auth.canAccessRoute(route); }

  getRoleWelcomeMessage(): string {
    const role = this.auth.userRole();
    const map: Record<string, string> = {
      'SYSTEM_ADMIN': 'Full system overview · All modules accessible',
      'RISK_MANAGER': 'Enterprise risk overview · Focus on risk register & assessments',
      'RISK_ANALYST': 'Risk analysis workspace · Focus on risk data & KRIs',
      'FRAUD_ANALYST': 'Fraud monitoring center · Focus on alerts & investigations',
      'SENIOR_INVESTIGATOR': 'Investigation workspace · Case management & fraud review',
      'AML_OFFICER': 'AML monitoring dashboard · Sanctions screening & SARs',
      'COMPLIANCE_OFFICER': 'Compliance overview · Policy & audit tracking',
      'DATA_ANALYST': 'Analytics workspace · Models, data quality & reports',
      'AUDITOR': 'Audit dashboard · Findings, compliance & risk review',
      'EXECUTIVE': 'Executive overview · Key metrics & strategic risks',
    };
    return map[role || ''] || 'Dashboard overview';
  }

  ngOnInit() {
    this.loadData();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.drawHeatMap();
      this.drawAlertTrend();
      this.drawRiskCategory();
      this.drawRiskDept();
    }, 100);
  }

  loadData() {
    this.stats = this.mockData.getDashboardStats();
    this.topRisks = this.mockData.getRisks()
      .sort((a, b) => b.inherentScore - a.inherentScore)
      .slice(0, 10);
    this.recentAlerts = this.mockData.getFraudAlerts()
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 8);
    this.systemHealth = this.mockData.getSystemHealth();
    this.currentTime = new Date().toLocaleTimeString();
  }

  refreshData() {
    this.refreshing.set(true);
    setTimeout(() => {
      this.loadData();
      this.refreshing.set(false);
    }, 1000);
  }

  getRiskColor(level: RiskLevel): string {
    const map: Record<string, string> = { CRITICAL: '#ef4444', HIGH: '#f59e0b', MEDIUM: '#eab308', LOW: '#22c55e' };
    return map[level] || '#94a3b8';
  }

  getScoreColor(score: number): string {
    if (score >= 800) return '#ef4444';
    if (score >= 600) return '#f59e0b';
    if (score >= 300) return '#eab308';
    return '#22c55e';
  }

  getBarColor(val: number): string {
    if (val >= 80) return '#ef4444';
    if (val >= 60) return '#f59e0b';
    return '#22c55e';
  }

  // ===================== D3.js CHARTS =====================
  drawHeatMap() {
    const el = this.heatmapEl?.nativeElement;
    if (!el) return;
    const data = this.mockData.getHeatMapData();
    const margin = { top: 30, right: 20, bottom: 40, left: 50 };
    const width = el.clientWidth - margin.left - margin.right;
    const height = 290 - margin.top - margin.bottom;
    const cellW = width / 5, cellH = height / 5;

    d3.select(el).selectAll('*').remove();
    const svg = d3.select(el).append('svg').attr('width', width + margin.left + margin.right).attr('height', height + margin.top + margin.bottom)
      .append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    const colorScale = d3.scaleLinear<string>().domain([0, 3, 8]).range(['#22c55e', '#f59e0b', '#ef4444']);
    const labels = ['Very Low', 'Low', 'Medium', 'High', 'Very High'];

    data.forEach(d => {
      const x = (d.impact - 1) * cellW, y = (5 - d.likelihood) * cellH;
      svg.append('rect').attr('x', x).attr('y', y).attr('width', cellW - 2).attr('height', cellH - 2)
        .attr('rx', 6).attr('fill', colorScale(d.count)).attr('opacity', 0.85).style('cursor', 'pointer')
        .on('mouseover', function() { d3.select(this).attr('opacity', 1).attr('stroke', '#1e293b').attr('stroke-width', 2); })
        .on('mouseout', function() { d3.select(this).attr('opacity', 0.85).attr('stroke', 'none'); });
      if (d.count > 0) {
        svg.append('text').attr('x', x + cellW / 2).attr('y', y + cellH / 2).attr('text-anchor', 'middle').attr('dy', '0.35em')
          .attr('fill', '#fff').attr('font-size', '16px').attr('font-weight', '700').text(d.count);
      }
    });

    svg.append('text').attr('x', width / 2).attr('y', height + 35).attr('text-anchor', 'middle').attr('fill', '#64748b').attr('font-size', '12px').text('Impact →');
    svg.append('text').attr('x', -height / 2).attr('y', -35).attr('text-anchor', 'middle').attr('transform', 'rotate(-90)').attr('fill', '#64748b').attr('font-size', '12px').text('Likelihood →');

    labels.forEach((l, i) => {
      svg.append('text').attr('x', i * cellW + cellW / 2).attr('y', -8).attr('text-anchor', 'middle').attr('fill', '#94a3b8').attr('font-size', '10px').text(l);
      svg.append('text').attr('x', -8).attr('y', (4 - i) * cellH + cellH / 2).attr('text-anchor', 'end').attr('dy', '0.35em').attr('fill', '#94a3b8').attr('font-size', '10px').text(l);
    });
  }

  drawAlertTrend() {
    const el = this.alertTrendEl?.nativeElement;
    if (!el) return;
    const data = this.mockData.getAlertTrendData();
    const margin = { top: 10, right: 20, bottom: 30, left: 40 };
    const width = el.clientWidth - margin.left - margin.right;
    const height = 220 - margin.top - margin.bottom;

    d3.select(el).selectAll('*').remove();
    const svg = d3.select(el).append('svg').attr('width', width + margin.left + margin.right).attr('height', height + margin.top + margin.bottom)
      .append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3.scaleTime().domain(d3.extent(data, d => new Date(d.date)) as [Date, Date]).range([0, width]);
    const y = d3.scaleLinear().domain([0, d3.max(data, d => d.value)! * 1.2]).range([height, 0]);

    const area = d3.area<any>().x(d => x(new Date(d.date))).y0(height).y1(d => y(d.value)).curve(d3.curveMonotoneX);
    const line = d3.line<any>().x(d => x(new Date(d.date))).y(d => y(d.value)).curve(d3.curveMonotoneX);

    const gradient = svg.append('defs').append('linearGradient').attr('id', 'areaGrad').attr('x1', '0').attr('y1', '0').attr('x2', '0').attr('y2', '1');
    gradient.append('stop').attr('offset', '0%').attr('stop-color', '#3b82f6').attr('stop-opacity', 0.3);
    gradient.append('stop').attr('offset', '100%').attr('stop-color', '#3b82f6').attr('stop-opacity', 0);

    svg.append('path').datum(data).attr('d', area).attr('fill', 'url(#areaGrad)');
    svg.append('path').datum(data).attr('d', line).attr('fill', 'none').attr('stroke', '#3b82f6').attr('stroke-width', 2.5);

    svg.append('g').attr('transform', `translate(0,${height})`).call(d3.axisBottom(x).ticks(6).tickFormat(d3.timeFormat('%b %d') as any)).selectAll('text').attr('fill', '#94a3b8').attr('font-size', '10px');
    svg.append('g').call(d3.axisLeft(y).ticks(5)).selectAll('text').attr('fill', '#94a3b8').attr('font-size', '10px');
    svg.selectAll('.domain, .tick line').attr('stroke', '#e2e8f0');
  }

  drawRiskCategory() {
    const el = this.riskCategoryEl?.nativeElement;
    if (!el) return;
    const data = this.mockData.getRiskByCategoryData();
    const width = el.clientWidth, height = 230;
    const radius = Math.min(width, height) / 2 - 20;

    d3.select(el).selectAll('*').remove();
    const svg = d3.select(el).append('svg').attr('width', width).attr('height', height)
      .append('g').attr('transform', `translate(${width / 2},${height / 2})`);

    const color = d3.scaleOrdinal<string>().domain(data.map(d => d.category))
      .range(['#3b82f6', '#ef4444', '#f59e0b', '#8b5cf6', '#06b6d4']);

    const pie = d3.pie<any>().value(d => d.count).sort(null);
    const arc = d3.arc<any>().innerRadius(radius * 0.55).outerRadius(radius);

    svg.selectAll('path').data(pie(data)).join('path').attr('d', arc).attr('fill', (d: any) => color(d.data.category))
      .attr('stroke', '#fff').attr('stroke-width', 2).style('cursor', 'pointer')
      .on('mouseover', function() { d3.select(this).attr('opacity', 0.8); })
      .on('mouseout', function() { d3.select(this).attr('opacity', 1); });

    svg.selectAll('text').data(pie(data)).join('text').attr('transform', (d: any) => `translate(${arc.centroid(d)})`)
      .attr('text-anchor', 'middle').attr('fill', '#fff').attr('font-size', '11px').attr('font-weight', '600')
      .text((d: any) => d.data.count > 0 ? d.data.count : '');
  }

  drawRiskDept() {
    const el = this.riskDeptEl?.nativeElement;
    if (!el) return;
    const data = this.mockData.getRiskByDepartmentData();
    const margin = { top: 10, right: 10, bottom: 60, left: 40 };
    const width = el.clientWidth - margin.left - margin.right;
    const height = 220 - margin.top - margin.bottom;

    d3.select(el).selectAll('*').remove();
    const svg = d3.select(el).append('svg').attr('width', width + margin.left + margin.right).attr('height', height + margin.top + margin.bottom)
      .append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3.scaleBand().domain(data.map(d => d.department)).range([0, width]).padding(0.3);
    const y = d3.scaleLinear().domain([0, d3.max(data, d => d.count)! * 1.2]).range([height, 0]);

    svg.selectAll('rect').data(data).join('rect')
      .attr('x', d => x(d.department)!).attr('y', d => y(d.count)).attr('width', x.bandwidth())
      .attr('height', d => height - y(d.count)).attr('rx', 4)
      .attr('fill', '#3b82f6').attr('opacity', 0.85).style('cursor', 'pointer')
      .on('mouseover', function() { d3.select(this).attr('opacity', 1); })
      .on('mouseout', function() { d3.select(this).attr('opacity', 0.85); });

    svg.selectAll('.bar-label').data(data).join('text').attr('class', 'bar-label')
      .attr('x', d => x(d.department)! + x.bandwidth() / 2).attr('y', d => y(d.count) - 5)
      .attr('text-anchor', 'middle').attr('fill', '#475569').attr('font-size', '11px').attr('font-weight', '600').text(d => d.count);

    svg.append('g').attr('transform', `translate(0,${height})`).call(d3.axisBottom(x))
      .selectAll('text').attr('fill', '#94a3b8').attr('font-size', '10px').attr('transform', 'rotate(-30)').attr('text-anchor', 'end');
    svg.append('g').call(d3.axisLeft(y).ticks(5)).selectAll('text').attr('fill', '#94a3b8').attr('font-size', '10px');
    svg.selectAll('.domain, .tick line').attr('stroke', '#e2e8f0');
  }
}
