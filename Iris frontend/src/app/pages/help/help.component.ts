import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-help',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="page-header"><div><h1>Help & Documentation</h1><p>Platform guides, FAQs, and support resources</p></div>
        <div style="display:flex;gap:10px"><input type="text" placeholder="Search help articles..." class="search-input" [(ngModel)]="searchQuery" /><button class="btn-primary" style="padding:10px 20px;border-radius:10px;font-size:14px;font-weight:600;cursor:pointer;border:none;background:linear-gradient(135deg,#1e3a8a,#2563eb);color:#fff"><i class="pi pi-search"></i></button></div>
      </div>

      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-bottom:24px">
        @for(g of guides;track g.title){
          <div style="padding:20px;background:#fff;border-radius:14px;border:1px solid #e2e8f0;cursor:pointer" (click)="activeGuide.set(g.title)">
            <div style="width:44px;height:44px;border-radius:12px;display:flex;align-items:center;justify-content:center;margin-bottom:12px" [style.background]="g.bg"><i [class]="g.icon" [style.color]="g.color" style="font-size:18px"></i></div>
            <h3 style="font-size:15px;font-weight:700;margin:0 0 4px">{{ g.title }}</h3>
            <p style="font-size:12px;color:#64748b;margin:0">{{ g.desc }}</p>
            <span style="font-size:12px;color:#2563eb;font-weight:600;margin-top:8px;display:block">{{ g.articles }} articles</span>
          </div>
        }
      </div>

      <h2 style="font-size:18px;font-weight:700;margin:0 0 12px">Frequently Asked Questions</h2>
      <div style="display:flex;flex-direction:column;gap:6px;margin-bottom:24px">
        @for(faq of faqs;track faq.q){
          <div style="background:#fff;border:1px solid #e2e8f0;border-radius:10px;overflow:hidden">
            <button style="width:100%;padding:14px 18px;background:none;border:none;cursor:pointer;display:flex;justify-content:space-between;align-items:center;font-size:14px;font-weight:600;text-align:left;color:#1e293b" (click)="faq.open=!faq.open">{{ faq.q }}<i [class]="faq.open?'pi pi-chevron-up':'pi pi-chevron-down'" style="font-size:12px;color:#94a3b8"></i></button>
            @if(faq.open){<div style="padding:0 18px 14px;font-size:13px;color:#64748b;line-height:1.6">{{ faq.a }}</div>}
          </div>
        }
      </div>

      <h2 style="font-size:18px;font-weight:700;margin:0 0 12px">Contact Support</h2>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:14px">
        <div style="padding:20px;background:#fff;border-radius:14px;border:1px solid #e2e8f0;text-align:center"><i class="pi pi-envelope" style="font-size:24px;color:#3b82f6;margin-bottom:8px;display:block"></i><strong style="font-size:14px">Email Support</strong><p style="font-size:12px;color:#64748b;margin:4px 0">support&#64;iris-platform.com</p><span style="font-size:11px;color:#94a3b8">Response within 4 hours</span></div>
        <div style="padding:20px;background:#fff;border-radius:14px;border:1px solid #e2e8f0;text-align:center"><i class="pi pi-phone" style="font-size:24px;color:#22c55e;margin-bottom:8px;display:block"></i><strong style="font-size:14px">Phone</strong><p style="font-size:12px;color:#64748b;margin:4px 0">+84 28 1234 5678</p><span style="font-size:11px;color:#94a3b8">Mon-Fri 8AM-6PM</span></div>
        <div style="padding:20px;background:#fff;border-radius:14px;border:1px solid #e2e8f0;text-align:center"><i class="pi pi-comments" style="font-size:24px;color:#f59e0b;margin-bottom:8px;display:block"></i><strong style="font-size:14px">Live Chat</strong><p style="font-size:12px;color:#64748b;margin:4px 0">Available now</p><span style="font-size:11px;color:#22c55e;font-weight:600">Online</span></div>
      </div>
    </div>
  `,
  styles: [`
    .page{max-width:1200px;margin:0 auto}.page-header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px}h1{font-size:28px;font-weight:800;color:#0f172a;margin:0}p{font-size:14px;color:#64748b;margin:4px 0 0}.search-input{padding:10px 16px;border:1px solid #e2e8f0;border-radius:10px;font-size:14px;width:300px;outline:none}.btn-primary{display:flex;align-items:center;gap:6px}
  `]
})
export class HelpComponent {
  searchQuery = '';
  activeGuide = signal('');
  guides = [
    {title:'Getting Started',desc:'Quick start guide for new users',articles:8,icon:'pi pi-play',color:'#3b82f6',bg:'#eff6ff'},
    {title:'Risk Management',desc:'How to create, assess, and manage risks',articles:12,icon:'pi pi-exclamation-triangle',color:'#ef4444',bg:'#fef2f2'},
    {title:'Fraud Detection',desc:'Alert investigation and decision workflow',articles:10,icon:'pi pi-shield',color:'#f59e0b',bg:'#fffbeb'},
    {title:'AML & Compliance',desc:'AML screening, SAR filing, regulatory',articles:15,icon:'pi pi-check-circle',color:'#22c55e',bg:'#f0fdf4'},
    {title:'Case Management',desc:'Investigation workspace and evidence',articles:9,icon:'pi pi-briefcase',color:'#8b5cf6',bg:'#f5f3ff'},
    {title:'Administration',desc:'User management, roles, system config',articles:11,icon:'pi pi-cog',color:'#64748b',bg:'#f8fafc'},
  ];
  faqs: any[] = [
    {q:'How do I create a new risk?',a:'Navigate to Risk Management > Click "New Risk" button > Fill in required fields (Title, Category, Owner) > Set likelihood and impact scores > Click "Create". The risk will appear in Draft status.',open:false},
    {q:'What happens when I submit a SAR?',a:'SARs go through a multi-step workflow: Draft > Review by Compliance Officer > Approval by BSA Officer > Filed with FinCEN. You will receive notifications at each stage.',open:false},
    {q:'How to investigate a fraud alert?',a:'Click on the alert in Fraud Detection module > Review the 6-tab investigation workspace (Summary, Scoring, Customer 360, Velocity, Device/Geo, Decision) > Make a True Positive/False Positive decision.',open:false},
    {q:'How to export data?',a:'Most modules have an Export button in the top-right corner. You can export to PDF or Excel format. For scheduled exports, use Analytics > Scheduled Reports.',open:false},
    {q:'What roles are available?',a:'IRIS supports 9 roles: System Admin, Risk Manager, Risk Analyst, Fraud Analyst, AML Analyst, Compliance Officer, Case Investigator, Viewer, and Business User. Each role has specific permissions.',open:false},
  ];
}
