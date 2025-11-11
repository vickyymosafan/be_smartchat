/**
 * Dashboard Controller
 * Serve visual dashboard untuk monitoring backend
 */

import { Request, Response } from 'express';
import { DashboardService } from '../services/DashboardService';

export class DashboardController {
  private dashboardService: DashboardService;

  constructor(dashboardService?: DashboardService) {
    this.dashboardService = dashboardService || new DashboardService();
  }

  /**
   * Serve dashboard HTML
   */
  async serveDashboard(_req: Request, res: Response): Promise<void> {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ChatSmart Backend Dashboard</title>
    <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🚀</text></svg>">
    <style>
        :root {
            /* Base Colors */
            --bg-primary: #1a1a1a;
            --bg-secondary: #2a2a2a;
            --bg-tertiary: #1f1f1f;
            --bg-hover: #3a3a3a;
            --bg-hover-light: #e0e0e0;
            
            /* Border Colors */
            --border-primary: #3a3a3a;
            --border-secondary: #4a4a4a;
            --border-light: #2a2a2a;
            
            /* Text Colors */
            --text-primary: #f5f5f5;
            --text-secondary: #a0a0a0;
            --text-tertiary: #808080;
            --text-inverse: #1a1a1a;
            
            /* Accent Colors */
            --accent-success: #90ee90;
            --accent-error: #ff6b6b;
            --accent-warning: #ffd700;
            --accent-info: #90d5d5;
            
            /* Status Backgrounds */
            --bg-success: #1f3a1f;
            --bg-error: #3a1f1f;
            --bg-warning: #3a3a1f;
            --bg-info: #1f3a3a;
            
            /* Status Borders */
            --border-success: #2d5a2d;
            --border-error: #5a2d2d;
            
            /* Spacing Scale */
            --space-xs: 4px;
            --space-sm: 8px;
            --space-md: 12px;
            --space-lg: 16px;
            --space-xl: 20px;
            --space-2xl: 24px;
            
            /* Border Radius Scale */
            --radius-sm: 4px;
            --radius-md: 6px;
            --radius-lg: 8px;
            --radius-xl: 10px;
            --radius-pill: 12px;
            
            /* Typography Scale */
            --font-xs: 10px;
            --font-sm: 11px;
            --font-md: 12px;
            --font-lg: 14px;
            --font-xl: 18px;
            --font-2xl: 24px;
            
            /* Transitions */
            --transition-fast: 0.2s ease;
            
            /* Shadows */
            --shadow-sm: 0 2px 8px rgba(0,0,0,0.3);
            --shadow-md: 0 4px 12px rgba(0,0,0,0.4);
            
            /* Borders */
            --border-width: 1px;
            --border-width-thick: 2px;
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: var(--bg-primary);
            min-height: 100vh;
            padding: var(--space-md);
            font-size: var(--font-lg);
            line-height: 1.5;
            color: var(--text-primary);
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
        }

        /* Base card style - reusable */
        .card {
            background: var(--bg-secondary);
            border: var(--border-width) solid var(--border-primary);
            border-radius: var(--radius-lg);
            box-shadow: var(--shadow-sm);
            transition: all var(--transition-fast);
        }

        .card:hover {
            transform: translateY(-2px);
            border-color: var(--border-secondary);
            box-shadow: var(--shadow-md);
        }

        /* Base button style - reusable */
        .btn {
            border: none;
            padding: var(--space-xs) var(--space-lg);
            border-radius: var(--radius-md);
            cursor: pointer;
            font-size: var(--font-md);
            font-weight: 600;
            transition: all var(--transition-fast);
            width: 100%;
        }

        .btn:hover {
            transform: translateY(-1px);
        }

        .btn:active {
            transform: translateY(0);
        }

        .btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
            transform: none;
        }

        .btn-primary {
            background: var(--text-primary);
            color: var(--bg-primary);
        }

        .btn-primary:hover {
            background: var(--bg-hover-light);
        }

        .btn-secondary {
            background: var(--bg-secondary);
            color: var(--text-primary);
            border: var(--border-width) solid var(--border-primary);
        }

        .btn-secondary:hover {
            background: var(--bg-hover);
            border-color: var(--border-secondary);
        }

        /* Base input style - reusable */
        .input {
            background: var(--bg-tertiary);
            border: var(--border-width) solid var(--border-primary);
            color: var(--text-primary);
            padding: var(--space-xs) var(--space-md);
            border-radius: var(--radius-md);
            font-size: var(--font-md);
            font-family: inherit;
            transition: border-color var(--transition-fast);
        }

        .input:focus {
            outline: none;
            border-color: var(--text-primary);
        }

        .input::placeholder {
            color: var(--text-tertiary);
        }

        .header {
            padding: var(--space-lg) var(--space-xl);
            border-radius: var(--radius-xl);
            margin-bottom: var(--space-lg);
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: var(--space-md);
        }

        .header h1 {
            font-size: var(--font-xl);
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: var(--space-sm);
        }

        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
            gap: var(--space-md);
            margin-bottom: var(--space-lg);
        }

        .stat-card {
            padding: var(--space-lg);
        }

        .stat-card .icon {
            font-size: var(--font-2xl);
            margin-bottom: var(--space-sm);
            display: block;
        }

        .stat-card .label {
            color: var(--text-secondary);
            font-size: var(--font-sm);
            margin-bottom: var(--space-xs);
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .stat-card .value {
            font-size: var(--font-2xl);
            font-weight: 700;
        }

        .content-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
            gap: var(--space-md);
        }

        .panel {
            padding: var(--space-lg);
        }

        .panel h2 {
            font-size: var(--font-lg);
            font-weight: 600;
            margin-bottom: var(--space-md);
            padding-bottom: var(--space-xs);
            border-bottom: var(--border-width) solid var(--border-primary);
            display: flex;
            align-items: center;
            gap: var(--space-xs);
        }

        /* Activity & Session Items */
        .activity-item, .session-item {
            padding: var(--space-xs) var(--space-md);
            background: var(--bg-tertiary);
            margin-bottom: var(--space-sm);
            border-radius: var(--radius-sm);
            font-size: var(--font-md);
        }

        .activity-item {
            border-left: var(--border-width-thick) solid var(--text-primary);
        }

        .activity-item.success {
            border-left-color: var(--accent-success);
        }

        .activity-item.failed {
            border-left-color: var(--accent-error);
        }

        .activity-item .time {
            color: var(--text-tertiary);
            font-size: var(--font-xs);
            margin-bottom: var(--space-xs);
        }

        .activity-item .event {
            font-weight: 500;
            margin-bottom: var(--space-xs);
        }

        .activity-item .details {
            color: var(--text-secondary);
            font-size: var(--font-sm);
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .session-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: var(--space-sm);
        }

        .session-item .info {
            flex: 1;
            min-width: 0;
        }

        .session-item .session-id {
            font-weight: 500;
            margin-bottom: var(--space-xs);
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .session-item .meta {
            color: var(--text-secondary);
            font-size: var(--font-xs);
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .session-item .badge {
            background: var(--text-primary);
            color: var(--text-inverse);
            padding: var(--space-xs) var(--space-sm);
            border-radius: var(--radius-pill);
            font-size: var(--font-xs);
            font-weight: 600;
            white-space: nowrap;
        }

        /* Buttons */
        .refresh-btn, .test-all-btn {
            border: none;
            padding: var(--space-xs) var(--space-lg);
            border-radius: var(--radius-md);
            cursor: pointer;
            font-size: var(--font-md);
            font-weight: 600;
            transition: all var(--transition-fast);
            margin-top: var(--space-md);
            width: 100%;
        }

        .refresh-btn {
            background: var(--text-primary);
            color: var(--text-inverse);
        }

        .refresh-btn:hover {
            background: var(--bg-hover-light);
            transform: translateY(-1px);
        }

        .test-all-btn {
            background: var(--bg-secondary);
            color: var(--text-primary);
            border: var(--border-width) solid var(--border-primary);
            margin-top: 0;
            margin-bottom: var(--space-md);
        }

        .test-all-btn:hover {
            background: var(--bg-hover);
            border-color: var(--border-secondary);
            transform: translateY(-1px);
        }

        .refresh-btn:active, .test-all-btn:active {
            transform: translateY(0);
        }

        /* State indicators */
        .loading, .empty {
            text-align: center;
            padding: var(--space-2xl);
            color: var(--text-secondary);
            font-size: var(--font-md);
        }

        .empty {
            color: var(--text-tertiary);
        }

        @media (max-width: 768px) {
            body {
                padding: var(--space-sm);
            }
            .stats-grid {
                grid-template-columns: repeat(2, 1fr);
            }
            .content-grid {
                grid-template-columns: 1fr;
            }
            .header h1 {
                font-size: var(--space-lg);
            }
        }

        @media (max-width: 480px) {
            .stats-grid {
                grid-template-columns: 1fr;
            }
        }

        /* Status badge - reusable */
        .badge {
            display: inline-flex;
            align-items: center;
            gap: var(--space-xs);
            padding: var(--space-xs) var(--space-md);
            border-radius: var(--radius-pill);
            font-size: var(--font-md);
            font-weight: 500;
        }

        .badge-success {
            background: var(--bg-success);
            color: var(--accent-success);
            border: var(--border-width) solid var(--border-success);
        }

        .badge-error {
            background: var(--bg-error);
            color: var(--accent-error);
            border: var(--border-width) solid var(--border-error);
        }

        .dot {
            width: var(--space-xs);
            height: var(--space-xs);
            border-radius: 50%;
            animation: pulse 2s infinite;
        }

        .dot-success { background: var(--accent-success); }
        .dot-error { background: var(--accent-error); }

        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }

        /* Item with status border - reusable */
        .item {
            margin-bottom: var(--space-sm);
            padding: var(--space-xs) var(--space-md);
            background: var(--bg-tertiary);
            border-radius: var(--radius-sm);
            border-left: var(--border-width-thick) solid var(--border-primary);
            font-size: var(--font-md);
        }

        .item-success { border-left-color: var(--accent-success); }
        .item-error { border-left-color: var(--accent-error); }
        .item-pending { border-left-color: var(--accent-warning); }

        .item-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: var(--space-xs);
            gap: var(--space-sm);
            flex-wrap: wrap;
        }

        .method-badge {
            display: inline-block;
            padding: calc(var(--space-xs) / 2) var(--space-xs);
            border-radius: var(--radius-sm);
            font-size: var(--font-xs);
            font-weight: 700;
            margin-right: var(--space-xs);
        }

        .method-get {
            background: var(--bg-info);
            color: var(--accent-info);
        }

        .method-post {
            background: var(--bg-warning);
            color: var(--accent-warning);
        }

        .code-text {
            font-family: 'Courier New', monospace;
            font-size: var(--font-sm);
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .status-badge {
            font-size: var(--font-xs);
            padding: calc(var(--space-xs) / 2) var(--space-xs);
            border-radius: var(--radius-sm);
            white-space: nowrap;
        }

        .status-success {
            background: var(--bg-success);
            color: var(--accent-success);
        }

        .status-error {
            background: var(--bg-error);
            color: var(--accent-error);
        }

        .status-pending {
            background: var(--bg-warning);
            color: var(--accent-warning);
        }

        .item-detail {
            color: var(--text-secondary);
            font-size: var(--font-xs);
            margin-top: var(--space-xs);
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        /* Removed - using .btn, .btn-secondary classes */

        .flex-col { 
            display: flex; 
            flex-direction: column; 
            gap: var(--space-sm); 
        }

        .flex-row { 
            display: flex; 
            gap: var(--space-sm); 
        }

        .flex-between {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: var(--space-sm);
        }

        /* Chat & PIN Components */
        .pin-container, .chat-test-container {
            display: flex;
            flex-direction: column;
            gap: var(--space-sm);
        }

        .pin-container {
            padding: var(--space-md);
            background: var(--bg-tertiary);
            border: var(--border-width) solid var(--border-primary);
            border-radius: var(--radius-md);
        }

        .pin-label {
            color: var(--text-secondary);
            font-size: var(--font-sm);
            font-weight: 600;
        }

        .pin-input-group, .chat-input-group {
            display: flex;
            gap: var(--space-sm);
        }

        .pin-input, .chat-input {
            flex: 1;
        }

        .pin-input {
            background: var(--bg-secondary);
            font-family: monospace;
        }

        .verify-btn, .send-btn {
            background: var(--text-primary);
            color: var(--text-inverse);
            border: none;
            padding: var(--space-xs) var(--space-xl);
            border-radius: var(--radius-md);
            cursor: pointer;
            font-size: var(--font-md);
            font-weight: 600;
            transition: all var(--transition-fast);
            white-space: nowrap;
        }

        .verify-btn:hover, .send-btn:hover {
            background: var(--bg-hover-light);
            transform: translateY(-1px);
        }

        .verify-btn:active, .send-btn:active {
            transform: translateY(0);
        }

        .verify-btn:disabled, .send-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
            transform: none;
        }

        .auth-status {
            font-size: var(--font-sm);
            padding: var(--space-sm);
            border-radius: var(--radius-sm);
            text-align: center;
        }

        .auth-status.success {
            background: var(--bg-success);
            color: var(--accent-success);
            border: var(--border-width) solid var(--border-success);
        }

        .auth-status.error {
            background: var(--bg-error);
            color: var(--accent-error);
            border: var(--border-width) solid var(--border-error);
        }

        .chat-response {
            background: var(--bg-tertiary);
            border: var(--border-width) solid var(--border-primary);
            border-radius: var(--radius-md);
            padding: var(--space-md);
            min-height: 100px;
            max-height: 300px;
            overflow-y: auto;
            font-size: var(--font-md);
        }

        .chat-message {
            margin-bottom: var(--space-md);
            padding-bottom: var(--space-md);
            border-bottom: var(--border-width) solid var(--border-light);
        }

        .chat-message:last-child {
            margin-bottom: 0;
            padding-bottom: 0;
            border-bottom: none;
        }

        .chat-message-role {
            color: var(--text-secondary);
            font-size: var(--font-xs);
            font-weight: 600;
            text-transform: uppercase;
            margin-bottom: var(--space-xs);
        }

        .chat-message-role.user {
            color: var(--accent-info);
        }

        .chat-message-role.assistant {
            color: var(--accent-success);
        }

        .chat-message-content {
            line-height: 1.5;
            word-wrap: break-word;
        }

        .chat-error {
            color: var(--accent-error);
            font-size: var(--font-sm);
            padding: var(--space-sm);
            background: var(--bg-error);
            border-radius: var(--radius-sm);
            border: var(--border-width) solid var(--border-error);
        }

        .chat-loading {
            color: var(--text-secondary);
            font-size: var(--font-sm);
            text-align: center;
            padding: var(--space-md);
        }

        /* Endpoint Test Components */
        .endpoint-test {
            margin-bottom: var(--space-sm);
            padding: var(--space-xs) var(--space-md);
            background: var(--bg-tertiary);
            border-radius: var(--radius-sm);
            border-left: var(--border-width-thick) solid var(--border-primary);
            font-size: var(--font-md);
        }

        .endpoint-test.success {
            border-left-color: var(--accent-success);
        }

        .endpoint-test.error {
            border-left-color: var(--accent-error);
        }

        .endpoint-test.pending {
            border-left-color: var(--accent-warning);
        }

        .endpoint-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: var(--space-xs);
            gap: var(--space-sm);
            flex-wrap: wrap;
        }

        .endpoint-method {
            display: inline-block;
            padding: calc(var(--space-xs) / 2) var(--space-xs);
            border-radius: var(--radius-sm);
            font-size: var(--font-xs);
            font-weight: 700;
            margin-right: var(--space-xs);
        }

        .endpoint-path {
            font-family: 'Courier New', monospace;
            font-size: var(--font-sm);
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .endpoint-status {
            font-size: var(--font-xs);
            padding: calc(var(--space-xs) / 2) var(--space-xs);
            border-radius: var(--radius-sm);
            white-space: nowrap;
        }

        .endpoint-response {
            color: var(--text-secondary);
            font-size: var(--font-xs);
            margin-top: var(--space-xs);
            font-family: 'Courier New', monospace;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .scrollable {
            background: var(--bg-tertiary);
            border: var(--border-width) solid var(--border-primary);
            border-radius: var(--radius-md);
            padding: var(--space-md);
            min-height: 100px;
            max-height: 300px;
            overflow-y: auto;
            font-size: var(--font-md);
        }

        .message {
            margin-bottom: var(--space-md);
            padding-bottom: var(--space-md);
            border-bottom: var(--border-width) solid var(--border-light);
        }

        .message:last-child {
            margin-bottom: 0;
            padding-bottom: 0;
            border-bottom: none;
        }

        .message-role {
            color: var(--text-secondary);
            font-size: var(--font-xs);
            font-weight: 600;
            text-transform: uppercase;
            margin-bottom: var(--space-xs);
        }

        .role-user { color: var(--accent-info); }
        .role-assistant { color: var(--accent-success); }

        .message-content {
            line-height: 1.5;
            word-wrap: break-word;
        }

        .alert {
            font-size: var(--font-sm);
            padding: var(--space-sm);
            border-radius: var(--radius-sm);
            border: var(--border-width) solid;
        }

        .alert-error {
            color: var(--accent-error);
            background: var(--bg-error);
            border-color: var(--border-error);
        }

        .alert-success {
            color: var(--accent-success);
            background: var(--bg-success);
            border-color: var(--border-success);
        }

        .text-center {
            text-align: center;
            padding: var(--space-md);
        }

        .label {
            color: var(--text-secondary);
            font-size: var(--font-sm);
            font-weight: 600;
        }

        .input-monospace {
            font-family: monospace;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 Smartchat Backend Dashboard</h1>
            <div style="display: flex; align-items: center; gap: var(--space-md);">
                <div class="health-status healthy" id="healthStatus">
                    <div class="health-dot healthy"></div>
                    <span>System Healthy</span>
                </div>
                <button class="btn btn-secondary" onclick="logout()" id="logoutBtn" style="display: none; width: auto;">
                    🚪 Logout
                </button>
            </div>
        </div>

        <div class="stats-grid" id="stats">
            <div class="stat-card">
                <div class="icon">📊</div>
                <div class="label">Total Sessions</div>
                <div class="value" id="totalSessions">-</div>
            </div>
            <div class="stat-card">
                <div class="icon">💬</div>
                <div class="label">Total Messages</div>
                <div class="value" id="totalMessages">-</div>
            </div>
            <div class="stat-card">
                <div class="icon">✅</div>
                <div class="label">Active Sessions</div>
                <div class="value" id="activeSessions">-</div>
            </div>
            <div class="stat-card">
                <div class="icon">🔐</div>
                <div class="label">PIN Attempts (24h)</div>
                <div class="value" id="pinAttempts">-</div>
            </div>
        </div>

        <div class="content-grid">
            <div class="panel">
                <h2>💬 Chat N8N Test</h2>
                <div id="authContainer" class="pin-container">
                    <div class="pin-label">🔐 Enter PIN to authenticate</div>
                    <div class="pin-input-group">
                        <input 
                            type="password" 
                            id="pinInput" 
                            class="pin-input" 
                            placeholder="Enter PIN (182001)"
                            onkeypress="if(event.key==='Enter') verifyPin()"
                        />
                        <button class="verify-btn" onclick="verifyPin()" id="verifyBtn">Verify</button>
                    </div>
                    <div id="authStatus"></div>
                </div>
                <div class="chat-test-container" id="chatContainer" style="display: none;">
                    <div class="chat-input-group">
                        <input 
                            type="text" 
                            id="chatInput" 
                            class="chat-input" 
                            placeholder="Type your message here..."
                            onkeypress="if(event.key==='Enter') sendChatMessage()"
                        />
                        <button class="send-btn" onclick="sendChatMessage()" id="sendBtn">Send</button>
                    </div>
                    <div class="chat-response" id="chatResponse">
                        <div class="empty">Send a message to test N8N chat integration</div>
                    </div>
                </div>
            </div>

            <div class="panel">
                <h2>🧪 API Endpoint Tests</h2>
                <button class="test-all-btn" onclick="testAllEndpoints()">▶️ Test All Endpoints</button>
                <div id="endpointTests">
                    <div class="empty">Click "Test All Endpoints" to start</div>
                </div>
            </div>

            <div class="panel">
                <h2>📋 Recent Activity</h2>
                <div id="recentActivity">
                    <div class="loading">Loading...</div>
                </div>
                <button class="refresh-btn" onclick="loadData()">🔄 Refresh</button>
            </div>

            <div class="panel">
                <h2>👥 Active Sessions</h2>
                <div id="activeSessionsList">
                    <div class="loading">Loading...</div>
                </div>
            </div>
        </div>
    </div>

    <script>
        // Health check realtime
        async function checkHealth() {
            try {
                const res = await fetch('/health');
                const data = await res.json();
                const statusEl = document.getElementById('healthStatus');
                
                if (res.ok && data.ok === true) {
                    // Response structure: { ok: true, data: { uptime, database } }
                    const dbStatus = data.data?.database === 'connected' ? '✓ DB Connected' : '⚠ DB Disconnected';
                    statusEl.className = 'health-status healthy';
                    statusEl.innerHTML = '<div class="health-dot healthy"></div><span>System Healthy · ' + dbStatus + '</span>';
                } else {
                    statusEl.className = 'health-status unhealthy';
                    statusEl.innerHTML = '<div class="health-dot unhealthy"></div><span>System Unhealthy</span>';
                }
            } catch (error) {
                const statusEl = document.getElementById('healthStatus');
                statusEl.className = 'health-status unhealthy';
                statusEl.innerHTML = '<div class="health-dot unhealthy"></div><span>System Down</span>';
            }
        }

        // Authentication
        let authToken = localStorage.getItem('chatAuthToken');
        
        // Logout function
        function logout() {
            if (confirm('Are you sure you want to logout?')) {
                // Clear token
                localStorage.removeItem('chatAuthToken');
                authToken = null;
                
                // Clear chat history
                chatHistory = [];
                
                // Reset UI
                document.getElementById('chatContainer').style.display = 'none';
                document.getElementById('authContainer').style.display = 'flex';
                document.getElementById('logoutBtn').style.display = 'none';
                document.getElementById('pinInput').value = '';
                document.getElementById('authStatus').textContent = '';
                document.getElementById('chatResponse').innerHTML = '<div class="empty">Send a message to test N8N chat integration</div>';
                
                // Show logout message
                const authStatus = document.getElementById('authStatus');
                authStatus.className = 'auth-status success';
                authStatus.textContent = '✓ Logged out successfully';
                setTimeout(() => {
                    authStatus.textContent = '';
                }, 3000);
            }
        }
        
        // Check if already authenticated on load
        if (authToken) {
            document.getElementById('authContainer').style.display = 'none';
            document.getElementById('chatContainer').style.display = 'flex';
            document.getElementById('logoutBtn').style.display = 'block';
        }
        
        async function verifyPin() {
            const pinInput = document.getElementById('pinInput');
            const verifyBtn = document.getElementById('verifyBtn');
            const authStatus = document.getElementById('authStatus');
            const pin = pinInput.value.trim();
            
            if (!pin) {
                authStatus.className = 'auth-status error';
                authStatus.textContent = 'Please enter PIN';
                return;
            }
            
            // Disable input
            pinInput.disabled = true;
            verifyBtn.disabled = true;
            verifyBtn.textContent = 'Verifying...';
            authStatus.textContent = '';
            
            try {
                const res = await fetch('/api/auth/verify-pin', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ pin })
                });
                
                const data = await res.json();
                
                console.log('PIN verify response:', { status: res.status, data });
                
                if (res.ok && data.data && data.data.token) {
                    // Save token
                    authToken = data.data.token;
                    localStorage.setItem('chatAuthToken', authToken);
                    
                    // Show success
                    authStatus.className = 'auth-status success';
                    authStatus.textContent = '✓ Authentication successful!';
                    
                    // Switch to chat UI
                    setTimeout(() => {
                        document.getElementById('authContainer').style.display = 'none';
                        document.getElementById('chatContainer').style.display = 'flex';
                        document.getElementById('logoutBtn').style.display = 'block';
                    }, 1000);
                } else {
                    authStatus.className = 'auth-status error';
                    authStatus.textContent = '✗ ' + (data.message || 'Invalid PIN');
                    pinInput.disabled = false;
                    verifyBtn.disabled = false;
                    verifyBtn.textContent = 'Verify';
                    pinInput.value = '';
                    pinInput.focus();
                }
            } catch (error) {
                authStatus.className = 'auth-status error';
                authStatus.textContent = '✗ Error: ' + error.message;
                pinInput.disabled = false;
                verifyBtn.disabled = false;
                verifyBtn.textContent = 'Verify';
            }
        }

        // Send chat message to N8N
        let chatHistory = [];
        
        async function sendChatMessage() {
            const input = document.getElementById('chatInput');
            const sendBtn = document.getElementById('sendBtn');
            const responseDiv = document.getElementById('chatResponse');
            const message = input.value.trim();
            
            if (!message) return;
            
            // Disable input
            input.disabled = true;
            sendBtn.disabled = true;
            sendBtn.textContent = 'Sending...';
            
            // Add user message to history
            chatHistory.push({
                role: 'user',
                content: message,
                timestamp: new Date()
            });
            
            // Update UI with user message
            updateChatUI();
            
            // Show loading
            const loadingMsg = document.createElement('div');
            loadingMsg.className = 'chat-loading';
            loadingMsg.textContent = '⏳ Waiting for response...';
            responseDiv.appendChild(loadingMsg);
            
            try {
                // Generate session ID
                const sessionId = 'dashboard-test-' + Date.now();
                
                // Send to backend
                const res = await fetch('/api/chat', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + authToken
                    },
                    body: JSON.stringify({
                        message: message,
                        sessionId: sessionId
                    })
                });
                
                const data = await res.json();
                
                console.log('Chat response:', { status: res.status, data });
                
                // Remove loading
                loadingMsg.remove();
                
                if (res.ok) {
                    // Add assistant response to history
                    // Parse nested response structure: { ok: true, data: { output: "message" } }
                    let assistantContent = '';
                    if (data.data && data.data.output) {
                        assistantContent = data.data.output;
                    } else if (data.output) {
                        assistantContent = data.output;
                    } else if (data.response) {
                        assistantContent = data.response;
                    } else if (data.message) {
                        assistantContent = data.message;
                    } else {
                        assistantContent = JSON.stringify(data);
                    }
                    
                    chatHistory.push({
                        role: 'assistant',
                        content: assistantContent,
                        timestamp: new Date()
                    });
                    updateChatUI();
                } else {
                    // Show error
                    const errorMsg = data.message || data.error || 'Failed to send message';
                    responseDiv.innerHTML += '<div class="chat-error">Error (' + res.status + '): ' + errorMsg + '</div>';
                    console.error('Chat error:', data);
                }
            } catch (error) {
                loadingMsg.remove();
                const errorMsg = error.message || 'Network error';
                responseDiv.innerHTML += '<div class="chat-error">❌ ' + errorMsg + '<br><small>Tip: Pastikan N8N workflow sudah aktif</small></div>';
                console.error('Chat error:', error);
            } finally {
                // Re-enable input
                input.disabled = false;
                sendBtn.disabled = false;
                sendBtn.textContent = 'Send';
                input.value = '';
                input.focus();
            }
        }
        
        function updateChatUI() {
            const responseDiv = document.getElementById('chatResponse');
            responseDiv.innerHTML = chatHistory.map(msg => \`
                <div class="chat-message">
                    <div class="chat-message-role \${msg.role}">\${msg.role}</div>
                    <div class="chat-message-content">\${msg.content}</div>
                </div>
            \`).join('');
            responseDiv.scrollTop = responseDiv.scrollHeight;
        }

        // Test all endpoints
        async function testAllEndpoints() {
            const endpoints = [
                { method: 'GET', path: '/health', name: 'Health Check' },
                { method: 'GET', path: '/api/dashboard/stats', name: 'Dashboard Stats' },
                { method: 'GET', path: '/api/dashboard/activity', name: 'Recent Activity' },
                { method: 'GET', path: '/api/dashboard/sessions', name: 'Active Sessions' },
            ];

            const container = document.getElementById('endpointTests');
            container.innerHTML = '';

            for (const endpoint of endpoints) {
                const testId = 'test-' + Math.random().toString(36).substr(2, 9);
                
                // Add pending test
                container.innerHTML += \`
                    <div class="endpoint-test pending" id="\${testId}">
                        <div class="endpoint-header">
                            <div>
                                <span class="endpoint-method method-\${endpoint.method.toLowerCase()}">\${endpoint.method}</span>
                                <span class="endpoint-path">\${endpoint.path}</span>
                            </div>
                            <span class="endpoint-status status-pending">Testing...</span>
                        </div>
                        <div class="endpoint-response">Waiting for response...</div>
                    </div>
                \`;

                // Test endpoint
                try {
                    const startTime = Date.now();
                    const options = {
                        method: endpoint.method,
                        headers: { 'Content-Type': 'application/json' }
                    };
                    
                    if (endpoint.body) {
                        options.body = JSON.stringify(endpoint.body);
                    }

                    const res = await fetch(endpoint.path, options);
                    const duration = Date.now() - startTime;
                    const data = await res.json();

                    const testEl = document.getElementById(testId);
                    if (res.ok) {
                        testEl.className = 'endpoint-test success';
                        testEl.innerHTML = \`
                            <div class="endpoint-header">
                                <div>
                                    <span class="endpoint-method method-\${endpoint.method.toLowerCase()}">\${endpoint.method}</span>
                                    <span class="endpoint-path">\${endpoint.path}</span>
                                </div>
                                <span class="endpoint-status status-success">✓ \${res.status} (\${duration}ms)</span>
                            </div>
                            <div class="endpoint-response">\${JSON.stringify(data).substring(0, 100)}...</div>
                        \`;
                    } else {
                        testEl.className = 'endpoint-test error';
                        testEl.innerHTML = \`
                            <div class="endpoint-header">
                                <div>
                                    <span class="endpoint-method method-\${endpoint.method.toLowerCase()}">\${endpoint.method}</span>
                                    <span class="endpoint-path">\${endpoint.path}</span>
                                </div>
                                <span class="endpoint-status status-error">✗ \${res.status} (\${duration}ms)</span>
                            </div>
                            <div class="endpoint-response">Error: \${data.message || 'Unknown error'}</div>
                        \`;
                    }
                } catch (error) {
                    const testEl = document.getElementById(testId);
                    testEl.className = 'endpoint-test error';
                    testEl.innerHTML = \`
                        <div class="endpoint-header">
                            <div>
                                <span class="endpoint-method method-\${endpoint.method.toLowerCase()}">\${endpoint.method}</span>
                                <span class="endpoint-path">\${endpoint.path}</span>
                            </div>
                            <span class="endpoint-status status-error">✗ Failed</span>
                        </div>
                        <div class="endpoint-response">Error: \${error.message}</div>
                    \`;
                }
            }
        }

        async function loadData() {
            try {
                // Load statistics
                const statsRes = await fetch('/api/dashboard/stats');
                const stats = await statsRes.json();
                
                document.getElementById('totalSessions').textContent = stats.totalSessions || 0;
                document.getElementById('totalMessages').textContent = stats.totalMessages || 0;
                document.getElementById('activeSessions').textContent = stats.activeSessions || 0;
                document.getElementById('pinAttempts').textContent = stats.pinAttempts24h || 0;

                // Load recent activity
                const activityRes = await fetch('/api/dashboard/activity');
                const activity = await activityRes.json();
                
                const activityHtml = activity.length > 0 
                    ? activity.map(item => \`
                        <div class="activity-item \${item.success ? 'success' : 'failed'}">
                            <div class="time">\${new Date(item.createdAt).toLocaleString()}</div>
                            <div class="event">\${item.event}</div>
                            <div class="details">IP: \${item.ipAddress || 'N/A'} | Session: \${item.sessionId || 'N/A'}</div>
                        </div>
                    \`).join('')
                    : '<div class="empty">No recent activity</div>';
                
                document.getElementById('recentActivity').innerHTML = activityHtml;

                // Load active sessions
                const sessionsRes = await fetch('/api/dashboard/sessions');
                const sessions = await sessionsRes.json();
                
                const sessionsHtml = sessions.length > 0
                    ? sessions.map(session => \`
                        <div class="session-item">
                            <div class="info">
                                <div class="session-id">\${session.sessionId}</div>
                                <div class="meta">
                                    IP: \${session.ipAddress || 'N/A'} | 
                                    Messages: \${session.messageCount || 0} | 
                                    Last: \${new Date(session.lastActivityAt).toLocaleString()}
                                </div>
                            </div>
                            <div class="badge">Active</div>
                        </div>
                    \`).join('')
                    : '<div class="empty">No active sessions</div>';
                
                document.getElementById('activeSessionsList').innerHTML = sessionsHtml;

            } catch (error) {
                console.error('Error loading data:', error);
            }
        }

        // Load data on page load
        loadData();
        checkHealth();

        // Auto-refresh every 30 seconds
        setInterval(loadData, 30000);
        
        // Check health every 5 seconds
        setInterval(checkHealth, 5000);
    </script>
</body>
</html>
    `;

    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  }

  /**
   * Get dashboard statistics
   */
  async getStats(_req: Request, res: Response): Promise<void> {
    try {
      const stats = await this.dashboardService.getStatistics();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: 'Failed to load statistics' });
    }
  }

  /**
   * Get recent activity
   */
  async getActivity(_req: Request, res: Response): Promise<void> {
    try {
      const activity = await this.dashboardService.getRecentActivity();
      res.json(activity);
    } catch (error) {
      res.status(500).json({ error: 'Failed to load activity' });
    }
  }

  /**
   * Get active sessions
   */
  async getSessions(_req: Request, res: Response): Promise<void> {
    try {
      const sessions = await this.dashboardService.getActiveSessions();
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ error: 'Failed to load sessions' });
    }
  }

}
