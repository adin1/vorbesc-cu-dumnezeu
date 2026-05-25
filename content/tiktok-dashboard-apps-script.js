function setupTrafficFormatting() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName('Daily_Log');
  if (!sh) return;

  const lastRow = Math.max(sh.getLastRow(), 2);
  const lastCol = Math.max(sh.getLastColumn(), 35);

  sh.clearConditionalFormatRules();

  const range = sh.getRange(2, 1, lastRow - 1, lastCol);

  const redRule = SpreadsheetApp.newConditionalFormatRule()
    .whenFormulaSatisfied('=$AH2<55')
    .setBackground('#FDECEC')
    .setFontColor('#8A1C1C')
    .setRanges([range])
    .build();

  const yellowRule = SpreadsheetApp.newConditionalFormatRule()
    .whenFormulaSatisfied('=AND($AH2>=55,$AH2<75)')
    .setBackground('#FFF8E1')
    .setFontColor('#7A5A00')
    .setRanges([range])
    .build();

  const greenRule = SpreadsheetApp.newConditionalFormatRule()
    .whenFormulaSatisfied('=$AH2>=75')
    .setBackground('#E9F7EF')
    .setFontColor('#1F6F3E')
    .setRanges([range])
    .build();

  sh.setConditionalFormatRules([redRule, yellowRule, greenRule]);
}

function updateDecisionForRow_(sheet, row) {
  if (row < 2) return;

  const scoreCol = 34;
  const decisionCol = 35;

  const score = sheet.getRange(row, scoreCol).getValue();
  let decision = '';

  if (score === '' || score === null || isNaN(score)) {
    decision = '';
  } else if (score >= 75) {
    decision = 'SCALEAZA';
  } else if (score >= 55) {
    decision = 'OPTIMIZEAZA';
  } else {
    decision = 'SCHIMBA FORMATUL';
  }

  sheet.getRange(row, decisionCol).setValue(decision);
}

function backfillDecisions() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName('Daily_Log');
  if (!sh) return;

  const lastRow = sh.getLastRow();
  if (lastRow < 2) return;

  for (let r = 2; r <= lastRow; r++) {
    updateDecisionForRow_(sh, r);
  }
}

function updateWeeklyRanking() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const daily = ss.getSheetByName('Daily_Log');
  const weekly = ss.getSheetByName('Weekly_Scorecard');
  if (!daily || !weekly) return;

  const weeklyLastRow = weekly.getLastRow();
  if (weeklyLastRow < 2) return;

  const dailyLastRow = daily.getLastRow();
  if (dailyLastRow < 2) return;

  const dailyData = daily.getRange(2, 1, dailyLastRow - 1, 34).getValues();

  for (let r = 2; r <= weeklyLastRow; r++) {
    const weekStart = weekly.getRange(r, 1).getValue();
    const weekEnd = weekly.getRange(r, 2).getValue();
    if (!weekStart || !weekEnd) continue;

    const filtered = dailyData
      .filter((row) => {
        const d = row[0];
        if (!(d instanceof Date)) return false;
        return d >= weekStart && d <= weekEnd;
      })
      .map((row) => ({
        date: row[0],
        video: row[2] || '',
        hook: row[5] || '',
        score: Number(row[33]) || 0,
      }))
      .filter((x) => x.video !== '');

    if (filtered.length === 0) {
      weekly.getRange(r, 14, 1, 4).setValues([['', '', '', '']]);
      continue;
    }

    const sortedDesc = [...filtered].sort((a, b) => b.score - a.score);
    const sortedAsc = [...filtered].sort((a, b) => a.score - b.score);

    const top3 = sortedDesc
      .slice(0, 3)
      .map((x) => `${x.video} (${x.score.toFixed(1)})`)
      .join(' | ');

    const bottom3 = sortedAsc
      .slice(0, 3)
      .map((x) => `${x.video} (${x.score.toFixed(1)})`)
      .join(' | ');

    const winningHooks = Array.from(
      new Set(sortedDesc.slice(0, 3).map((x) => x.hook).filter(Boolean)),
    ).join(', ');

    const losingHooks = Array.from(
      new Set(sortedAsc.slice(0, 3).map((x) => x.hook).filter(Boolean)),
    ).join(', ');

    weekly.getRange(r, 14, 1, 4).setValues([[top3, bottom3, winningHooks, losingHooks]]);
  }
}

function statusBadge_(value, greenThreshold, yellowThreshold) {
  if (value >= greenThreshold) {
    return '<span style="display:inline-block;padding:2px 8px;border-radius:999px;background:#E9F7EF;color:#166534;font-size:12px">GREEN</span>';
  }
  if (value >= yellowThreshold) {
    return '<span style="display:inline-block;padding:2px 8px;border-radius:999px;background:#FFF8E1;color:#92400E;font-size:12px">YELLOW</span>';
  }
  return '<span style="display:inline-block;padding:2px 8px;border-radius:999px;background:#FDECEC;color:#991B1B;font-size:12px">RED</span>';
}

function escapeHtml_(txt) {
  return String(txt)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function formatDateSafe_(d) {
  if (!(d instanceof Date)) return String(d || '');
  return Utilities.formatDate(d, Session.getScriptTimeZone(), 'yyyy-MM-dd');
}

function sendWeeklySummaryEmailHtml() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName('Weekly_Scorecard');
  if (!sh) return;

  const lastRow = sh.getLastRow();
  if (lastRow < 2) return;

  const row = sh.getRange(lastRow, 1, 1, 20).getValues()[0];

  const weekStart = row[0];
  const weekEnd = row[1];
  const videosPosted = row[2] || 0;
  const avgHold = Number(row[3] || 0);
  const avgCompletion = Number(row[4] || 0);
  const avgSaveShare = Number(row[5] || 0);
  const totalProfileVisits = row[6] || 0;
  const totalBioClicks = row[7] || 0;
  const totalSessions = row[8] || 0;
  const totalRegistrations = row[9] || 0;
  const totalPremium = row[10] || 0;
  const totalDonations = Number(row[11] || 0);
  const tiktokToPremium = Number(row[12] || 0);
  const top3 = row[13] || '-';
  const bottom3 = row[14] || '-';
  const winningHooks = row[15] || '-';
  const losingHooks = row[16] || '-';
  const nextScale = row[17] || '-';
  const nextOptimize = row[18] || '-';
  const nextStop = row[19] || '-';

  const weekLabel = `${formatDateSafe_(weekStart)} - ${formatDateSafe_(weekEnd)}`;
  const subject = `TikTok Weekly Report | ${weekLabel}`;

  const holdStatus = statusBadge_(avgHold, 70, 55);
  const completionStatus = statusBadge_(avgCompletion, 30, 18);
  const saveShareStatus = statusBadge_(avgSaveShare, 3, 1);
  const premiumStatus = statusBadge_(tiktokToPremium, 3, 1);

  const html = `
  <div style="font-family:Arial,Helvetica,sans-serif;line-height:1.45;color:#1f2937">
    <h2 style="margin:0 0 8px">TikTok Weekly Report</h2>
    <p style="margin:0 0 16px"><strong>Interval:</strong> ${weekLabel}</p>

    <table style="border-collapse:collapse;width:100%;max-width:860px;margin-bottom:16px">
      <tr>
        <td style="border:1px solid #e5e7eb;padding:8px"><strong>Videos posted</strong><br>${videosPosted}</td>
        <td style="border:1px solid #e5e7eb;padding:8px"><strong>Avg Hold Rate</strong><br>${avgHold.toFixed(2)}% ${holdStatus}</td>
        <td style="border:1px solid #e5e7eb;padding:8px"><strong>Avg Completion</strong><br>${avgCompletion.toFixed(2)}% ${completionStatus}</td>
        <td style="border:1px solid #e5e7eb;padding:8px"><strong>Avg Save+Share</strong><br>${avgSaveShare.toFixed(2)}% ${saveShareStatus}</td>
      </tr>
      <tr>
        <td style="border:1px solid #e5e7eb;padding:8px"><strong>Profile visits</strong><br>${totalProfileVisits}</td>
        <td style="border:1px solid #e5e7eb;padding:8px"><strong>Bio clicks</strong><br>${totalBioClicks}</td>
        <td style="border:1px solid #e5e7eb;padding:8px"><strong>UTM sessions</strong><br>${totalSessions}</td>
        <td style="border:1px solid #e5e7eb;padding:8px"><strong>Registrations</strong><br>${totalRegistrations}</td>
      </tr>
      <tr>
        <td style="border:1px solid #e5e7eb;padding:8px"><strong>Premium users</strong><br>${totalPremium}</td>
        <td style="border:1px solid #e5e7eb;padding:8px"><strong>Donations</strong><br>${totalDonations.toFixed(2)} RON</td>
        <td style="border:1px solid #e5e7eb;padding:8px" colspan="2"><strong>TikTok -> Premium</strong><br>${tiktokToPremium.toFixed(2)}% ${premiumStatus}</td>
      </tr>
    </table>

    <h3 style="margin:12px 0 6px">Content Insights</h3>
    <p style="margin:0 0 6px"><strong>Top 3 videos:</strong> ${escapeHtml_(top3)}</p>
    <p style="margin:0 0 6px"><strong>Bottom 3 videos:</strong> ${escapeHtml_(bottom3)}</p>
    <p style="margin:0 0 6px"><strong>Winning hooks:</strong> ${escapeHtml_(winningHooks)}</p>
    <p style="margin:0 0 16px"><strong>Losing hooks:</strong> ${escapeHtml_(losingHooks)}</p>

    <h3 style="margin:12px 0 6px">Next Week Plan</h3>
    <p style="margin:0 0 6px"><strong>Scale:</strong> ${escapeHtml_(nextScale)}</p>
    <p style="margin:0 0 6px"><strong>Optimize:</strong> ${escapeHtml_(nextOptimize)}</p>
    <p style="margin:0 0 6px"><strong>Stop:</strong> ${escapeHtml_(nextStop)}</p>

    <hr style="border:none;border-top:1px solid #e5e7eb;margin:16px 0">
    <p style="font-size:12px;color:#6b7280;margin:0">
      Report generated automatically from Weekly_Scorecard.
    </p>
  </div>`;

  MailApp.sendEmail({
    to: 'vorbestecudumnezeu@gmail.com',
    subject,
    htmlBody: html,
    body: 'Open this email in HTML mode to view the formatted report.',
  });
}

function runWeeklyRefresh() {
  setupTrafficFormatting();
  backfillDecisions();
  updateWeeklyRanking();
}

function sundayRun() {
  runWeeklyRefresh();
  sendWeeklySummaryEmailHtml();
}

function createSundayRunTrigger() {
  const functionName = 'sundayRun';
  const existing = ScriptApp.getProjectTriggers().filter((t) => t.getHandlerFunction() === functionName);
  if (existing.length > 0) return;

  ScriptApp.newTrigger(functionName)
    .timeBased()
    .onWeekDay(ScriptApp.WeekDay.SUNDAY)
    .atHour(20)
    .create();
}

function deleteSundayRunTriggers() {
  const functionName = 'sundayRun';
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach((t) => {
    if (t.getHandlerFunction() === functionName) {
      ScriptApp.deleteTrigger(t);
    }
  });
}

function onEdit(e) {
  const sh = e.range.getSheet();
  if (sh.getName() !== 'Daily_Log') return;

  const row = e.range.getRow();
  const col = e.range.getColumn();

  if (row >= 2 && ((col >= 12 && col <= 35) || col === 34)) {
    updateDecisionForRow_(sh, row);
  }

  setupTrafficFormatting();
}

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('TikTok Dashboard')
    .addItem('Run Full Refresh', 'runWeeklyRefresh')
    .addItem('Send Weekly Email (HTML)', 'sendWeeklySummaryEmailHtml')
    .addItem('Run Sunday Flow Now', 'sundayRun')
    .addSeparator()
    .addItem('Create Sunday Trigger', 'createSundayRunTrigger')
    .addItem('Delete Sunday Triggers', 'deleteSundayRunTriggers')
    .addToUi();
}
