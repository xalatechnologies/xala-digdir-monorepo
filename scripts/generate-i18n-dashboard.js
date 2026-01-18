#!/usr/bin/env node
/* eslint-disable */
/**
 * i18n Tracking Dashboard Generator
 * 
 * Generates an HTML dashboard from i18n scan results showing:
 * - Overall progress towards zero violations
 * - Trends over time (if historical data exists)
 * - Breakdown by app, file, and issue type
 * - Actionable next steps
 * 
 * Usage:
 *   node scripts/generate-i18n-dashboard.js
 */

const fs = require('fs');
const path = require('path');

// Load the latest scan report
const reportPath = path.join(__dirname, '..', 'i18n-comprehensive-report.json');
const historicalDir = path.join(__dirname, '..', '.i18n-history');
const outputPath = path.join(__dirname, '..', 'i18n-dashboard.html');

// Ensure historical directory exists
if (!fs.existsSync(historicalDir)) {
  fs.mkdirSync(historicalDir, { recursive: true });
}

// Load current report
let currentReport;
try {
  currentReport = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
} catch (error) {
  console.error('❌ Could not load current report:', error.message);
  console.log('📋 Run: node scripts/scan-i18n-comprehensive.js --all');
  process.exit(1);
}

// Save snapshot to history
const timestamp = new Date(currentReport.timestamp).toISOString().split('T')[0];
const snapshotPath = path.join(historicalDir, `scan-${timestamp}.json`);
fs.writeFileSync(snapshotPath, JSON.stringify({
  timestamp: currentReport.timestamp,
  summary: currentReport.summary,
  apps: Object.entries(currentReport.apps).reduce((acc, [app, data]) => {
    acc[app] = { issueCount: data.issues.length };
    return acc;
  }, {}),
}, null, 2));

// Load historical data
function loadHistoricalData() {
  const files = fs.readdirSync(historicalDir)
    .filter(f => f.startsWith('scan-') && f.endsWith('.json'))
    .sort()
    .slice(-30); // Last 30 scans
  
  return files.map(file => {
    const data = JSON.parse(fs.readFileSync(path.join(historicalDir, file), 'utf8'));
    return data;
  });
}

const historicalData = loadHistoricalData();

// Calculate statistics
const stats = {
  current: currentReport.summary,
  totalViolations: currentReport.summary.totalIssues,
  violationsByApp: Object.entries(currentReport.apps).map(([app, data]) => ({
    app,
    count: data.issues.length,
  })).sort((a, b) => b.count - a.count),
  violationsByType: {},
  topFiles: currentReport.topFiles || [],
};

// Count violations by type
currentReport.allIssues?.forEach(issue => {
  stats.violationsByType[issue.type] = (stats.violationsByType[issue.type] || 0) + 1;
});

// Generate HTML
const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>i18n Zero-Violations Dashboard</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 2rem;
      min-height: 100vh;
    }
    .container {
      max-width: 1400px;
      margin: 0 auto;
    }
    .header {
      background: white;
      border-radius: 16px;
      padding: 2rem;
      margin-bottom: 2rem;
      box-shadow: 0 10px 40px rgba(0,0,0,0.1);
    }
    .header h1 {
      font-size: 2.5rem;
      color: #1a202c;
      margin-bottom: 0.5rem;
    }
    .header .subtitle {
      color: #718096;
      font-size: 1.1rem;
    }
    .header .timestamp {
      color: #a0aec0;
      font-size: 0.9rem;
      margin-top: 1rem;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }
    .stat-card {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 4px 12px rgba(0,0,0,0.08);
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .stat-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 24px rgba(0,0,0,0.12);
    }
    .stat-card .label {
      color: #718096;
      font-size: 0.875rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 0.5rem;
    }
    .stat-card .value {
      font-size: 2.5rem;
      font-weight: bold;
      color: #1a202c;
    }
    .stat-card.critical .value { color: #e53e3e; }
    .stat-card.warning .value { color: #ed8936; }
    .stat-card.success .value { color: #38a169; }
    .stat-card.info .value { color: #3182ce; }
    .chart-section {
      background: white;
      border-radius: 16px;
      padding: 2rem;
      margin-bottom: 2rem;
      box-shadow: 0 10px 40px rgba(0,0,0,0.1);
    }
    .chart-section h2 {
      color: #1a202c;
      margin-bottom: 1.5rem;
      font-size: 1.5rem;
    }
    .chart-container {
      position: relative;
      height: 300px;
      margin-bottom: 2rem;
    }
    .table-section {
      background: white;
      border-radius: 16px;
      padding: 2rem;
      margin-bottom: 2rem;
      box-shadow: 0 10px 40px rgba(0,0,0,0.1);
    }
    .table-section h2 {
      color: #1a202c;
      margin-bottom: 1.5rem;
      font-size: 1.5rem;
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    thead {
      background: #f7fafc;
    }
    th {
      padding: 1rem;
      text-align: left;
      font-weight: 600;
      color: #4a5568;
      border-bottom: 2px solid #e2e8f0;
    }
    td {
      padding: 1rem;
      border-bottom: 1px solid #e2e8f0;
      color: #2d3748;
    }
    tbody tr:hover {
      background: #f7fafc;
    }
    .badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.875rem;
      font-weight: 600;
    }
    .badge.critical { background: #fed7d7; color: #c53030; }
    .badge.high { background: #feebc8; color: #c05621; }
    .badge.medium { background: #fefcbf; color: #975a16; }
    .badge.low { background: #c6f6d5; color: #276749; }
    .progress-bar {
      width: 100%;
      height: 8px;
      background: #e2e8f0;
      border-radius: 9999px;
      overflow: hidden;
      margin-top: 0.5rem;
    }
    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
      transition: width 0.3s ease;
    }
    .action-items {
      background: white;
      border-radius: 16px;
      padding: 2rem;
      box-shadow: 0 10px 40px rgba(0,0,0,0.1);
    }
    .action-items h2 {
      color: #1a202c;
      margin-bottom: 1.5rem;
      font-size: 1.5rem;
    }
    .action-item {
      padding: 1rem;
      border-left: 4px solid #667eea;
      background: #f7fafc;
      margin-bottom: 1rem;
      border-radius: 4px;
    }
    .action-item h3 {
      color: #2d3748;
      margin-bottom: 0.5rem;
      font-size: 1.1rem;
    }
    .action-item p {
      color: #718096;
      line-height: 1.6;
    }
    .action-item code {
      background: #edf2f7;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-family: 'Courier New', monospace;
      font-size: 0.9rem;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🌐 i18n Zero-Violations Dashboard</h1>
      <p class="subtitle">Tracking progress towards complete localization</p>
      <p class="timestamp">Last scan: ${new Date(currentReport.timestamp).toLocaleString()}</p>
    </div>

    <div class="stats-grid">
      <div class="stat-card critical">
        <div class="label">Total Violations</div>
        <div class="value">${stats.totalViolations}</div>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${Math.max(0, 100 - (stats.totalViolations / 15) * 100)}%"></div>
        </div>
      </div>
      <div class="stat-card warning">
        <div class="label">Hardcoded Strings</div>
        <div class="value">${stats.current.hardcodedStrings}</div>
      </div>
      <div class="stat-card info">
        <div class="label">Missing Keys</div>
        <div class="value">${currentReport.usedButMissingKeys?.length || 0}</div>
      </div>
      <div class="stat-card info">
        <div class="label">Files Affected</div>
        <div class="value">${stats.current.scannedFiles}</div>
      </div>
    </div>

    <div class="chart-section">
      <h2>📊 Violations by App</h2>
      <div class="chart-container">
        <canvas id="appChart"></canvas>
      </div>
    </div>

    ${historicalData.length > 1 ? `
    <div class="chart-section">
      <h2>📈 Trend Over Time</h2>
      <div class="chart-container">
        <canvas id="trendChart"></canvas>
      </div>
    </div>
    ` : ''}

    <div class="table-section">
      <h2>🏆 Top 10 Files Needing Attention</h2>
      <table>
        <thead>
          <tr>
            <th>Rank</th>
            <th>File</th>
            <th>Issues</th>
            <th>Priority</th>
          </tr>
        </thead>
        <tbody>
          ${stats.topFiles.slice(0, 10).map((file, i) => `
            <tr>
              <td><strong>#${i + 1}</strong></td>
              <td><code>${file.file.replace(/^.*(apps\/[^/]+\/)/, '$1')}</code></td>
              <td><strong>${file.issueCount}</strong></td>
              <td>
                <span class="badge ${file.issueCount > 20 ? 'critical' : file.issueCount > 10 ? 'high' : 'medium'}">
                  ${file.issueCount > 20 ? 'Critical' : file.issueCount > 10 ? 'High' : 'Medium'}
                </span>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <div class="action-items">
      <h2>⚡ Recommended Actions</h2>
      
      <div class="action-item">
        <h3>1. Prevention System Active ✅</h3>
        <p>Pre-commit hooks and CI/CD checks are now blocking new violations from being committed.</p>
      </div>
      
      <div class="action-item">
        <h3>2. Add Critical Translation Keys (${Math.max(0, 723 - 157)} remaining)</h3>
        <p>Continue adding high-usage translation keys to <code>packages/i18n/src/locales/nb.ts</code></p>
        <p><strong>Command:</strong> <code>grep "suggestedKey" i18n-comprehensive-report.json | sort | uniq</code></p>
      </div>
      
      <div class="action-item">
        <h3>3. Fix High-Priority Files</h3>
        <p>Focus on files with 15+ violations. Each file fixed makes a measurable impact.</p>
        <p><strong>Target:</strong> ${stats.topFiles.filter(f => f.issueCount >= 15).length} files with 15+ issues</p>
      </div>
      
      <div class="action-item">
        <h3>4. Fix Smallest Apps First</h3>
        <p>Quick wins: tenant-admin (${stats.violationsByApp.find(a => a.app === 'tenant-admin')?.count || 'N/A'} issues), docs-learning (${stats.violationsByApp.find(a => a.app === 'docs-learning')?.count || 'N/A'} issues)</p>
      </div>
    </div>
  </div>

  <script>
    // App breakdown chart
    const appCtx = document.getElementById('appChart').getContext('2d');
    new Chart(appCtx, {
      type: 'bar',
      data: {
        labels: ${JSON.stringify(stats.violationsByApp.map(a => a.app))},
        datasets: [{
          label: 'Violations',
          data: ${JSON.stringify(stats.violationsByApp.map(a => a.count))},
          backgroundColor: [
            'rgba(231, 76, 60, 0.8)',
            'rgba(230, 126, 34, 0.8)',
            'rgba(241, 196, 15, 0.8)',
            'rgba(52, 152, 219, 0.8)',
            'rgba(155, 89, 182, 0.8)',
            'rgba(46, 204, 113, 0.8)',
            'rgba(149, 165, 166, 0.8)',
          ],
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
        },
        scales: {
          y: { beginAtZero: true }
        }
      }
    });

    ${historicalData.length > 1 ? `
    // Trend chart
    const trendCtx = document.getElementById('trendChart').getContext('2d');
    new Chart(trendCtx, {
      type: 'line',
      data: {
        labels: ${JSON.stringify(historicalData.map(d => new Date(d.timestamp).toLocaleDateString()))},
        datasets: [{
          label: 'Total Violations',
          data: ${JSON.stringify(historicalData.map(d => d.summary.totalIssues))},
          borderColor: 'rgba(102, 126, 234, 1)',
          backgroundColor: 'rgba(102, 126, 234, 0.1)',
          tension: 0.4,
          fill: true,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: true },
        },
        scales: {
          y: { beginAtZero: true }
        }
      }
    });
    ` : ''}
  </script>
</body>
</html>`;

// Write dashboard
fs.writeFileSync(outputPath, html);

console.log('✅ i18n Dashboard generated successfully!');
console.log(`📊 View at: file://${outputPath}`);
console.log(`📁 Historical data: ${historicalData.length} snapshots saved`);
console.log('');
console.log('💡 Tip: Run this script weekly to track progress over time');
