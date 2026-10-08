/**
 * WORD MEMORY - The Church of Pentecost Dubai
 * Pakistani & Indian Worship Centre
 * 
 * CURRICULUM EXPORT ENGINE (Phase 3)
 * Compliant with Section 25 of System Architecture
 * 
 * Exports the 365-Day Curriculum to:
 * 1. CSV Format
 * 2. JSON Format
 * 3. Printable HTML Document / Sheet
 */

import { CurriculumDay, CurriculumPlan } from '../types/database';

export class CurriculumExportService {
  /**
   * Export to structured JSON
   */
  public static exportToJSON(plan: CurriculumPlan, days: CurriculumDay[]): string {
    const payload = {
      project: "WORD MEMORY",
      church: "THE CHURCH OF PENTECOST, DUBAI - PAKISTANI & INDIAN WORSHIP CENTRE",
      plan: {
        id: plan.id,
        name: plan.name,
        description: plan.description,
        version: plan.version,
        status: plan.status,
        durationDays: plan.duration_days,
        exportDate: new Date().toISOString(),
      },
      sourceNotice: "Original Urdu Scripture sourced verbatim from WordPocket Urdu Bible (https://www.wordpocket.com/lang_texts/ur/index.htm). Sacred Scripture is preserved without modification.",
      totalDays: days.length,
      days: days.map(d => ({
        dayNumber: d.day_number,
        monthNumber: d.month_number,
        title: d.title,
        theme: d.theme,
        category: d.category,
        difficulty: d.difficulty,
        reference: d.scripture_reference,
        book: d.book_name_english,
        bookUrdu: d.book_name_urdu,
        chapter: d.chapter_number,
        verseStart: d.verse_start,
        verseEnd: d.verse_end,
        verseIds: d.verse_ids,
        originalUrduText: d.original_urdu_text,
        englishText: d.english_text || '',
        source: d.source_name,
        explanation: d.explanation,
        application: d.application,
        prayer: d.prayer,
        memoryTip: d.memory_tip,
        status: d.status,
        contentStatus: d.content_status,
      })),
    };

    return JSON.stringify(payload, null, 2);
  }

  /**
   * Export to CSV
   */
  public static exportToCSV(days: CurriculumDay[]): string {
    const headers = [
      'Day',
      'Month',
      'Theme',
      'Category',
      'Reference',
      'Book',
      'Chapter',
      'VerseStart',
      'VerseEnd',
      'Difficulty',
      'Status',
      'OriginalUrduText',
      'EnglishText',
      'Explanation',
      'Application',
      'Prayer',
      'MemoryTip',
      'Source'
    ];

    const escapeCSV = (str: string | undefined): string => {
      if (!str) return '""';
      const clean = str.replace(/"/g, '""').replace(/\n/g, ' ');
      return `"${clean}"`;
    };

    const rows = days.map(d => [
      d.day_number,
      d.month_number,
      escapeCSV(d.theme),
      escapeCSV(d.category),
      escapeCSV(d.scripture_reference),
      escapeCSV(d.book_name_english),
      d.chapter_number,
      d.verse_start,
      d.verse_end,
      d.difficulty,
      d.status,
      escapeCSV(d.original_urdu_text),
      escapeCSV(d.english_text),
      escapeCSV(d.explanation),
      escapeCSV(d.application),
      escapeCSV(d.prayer),
      escapeCSV(d.memory_tip),
      escapeCSV(d.source_name),
    ].join(','));

    // UTF-8 BOM for Urdu Excel support
    return '\uFEFF' + [headers.join(','), ...rows].join('\n');
  }

  /**
   * Generate a Printable HTML document with Urdu Nastaliq typography and clean church branding
   */
  public static generatePrintableHTML(plan: CurriculumPlan, days: CurriculumDay[]): string {
    const daysHtml = days.map(d => `
      <div class="day-card">
        <div class="day-header">
          <div class="day-badge">DAY ${d.day_number}</div>
          <div class="day-ref">${d.scripture_reference} (${d.book_name_urdu})</div>
          <div class="day-meta">${d.category} • ${d.difficulty}</div>
        </div>
        <div class="day-theme"><strong>Theme:</strong> ${d.theme}</div>
        <div class="urdu-scripture" dir="rtl">${d.original_urdu_text}</div>
        <div class="english-scripture">"${d.english_text || ''}"</div>
        <div class="discipleship-grid">
          <div class="disc-col">
            <h4>💡 THINK ABOUT IT</h4>
            <p>${d.explanation}</p>
          </div>
          <div class="disc-col">
            <h4>🌿 LIVE IT</h4>
            <p>${d.application}</p>
          </div>
          <div class="disc-col">
            <h4>🙏 PRAY</h4>
            <p>${d.prayer}</p>
          </div>
        </div>
        <div class="day-footer">
          <span>Source: ${d.source_name}</span>
          <span>Tip: ${d.memory_tip}</span>
        </div>
      </div>
    `).join('');

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>WORD MEMORY — 365-Day Church Memory Journey</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700&family=Noto+Nastaliq+Urdu:wght@400;700&family=Plus+Jakarta+Sans:wght@400;600;700&display=swap');
    body { font-family: 'Plus Jakarta Sans', sans-serif; color: #1e293b; background: #fff; margin: 0; padding: 24px; line-height: 1.5; }
    .church-header { text-align: center; border-bottom: 2px solid #0B2545; padding-bottom: 20px; margin-bottom: 24px; }
    .church-title { font-family: 'Cinzel', serif; font-size: 20px; font-weight: bold; color: #0B2545; }
    .church-sub { font-size: 13px; color: #b45309; font-weight: 600; margin-top: 4px; }
    .plan-title { font-size: 24px; font-weight: 800; color: #0f172a; margin-top: 8px; }
    .plan-tagline { font-style: italic; color: #64748b; font-size: 14px; }
    .day-card { border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin-bottom: 20px; page-break-inside: avoid; }
    .day-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px; margin-bottom: 10px; }
    .day-badge { background: #0B2545; color: #f59e0b; font-weight: bold; padding: 4px 10px; border-radius: 6px; font-size: 12px; }
    .day-ref { font-weight: bold; font-size: 15px; color: #0B2545; }
    .day-meta { font-size: 12px; color: #64748b; }
    .day-theme { font-size: 13px; color: #475569; margin-bottom: 8px; }
    .urdu-scripture { font-family: 'Noto Nastaliq Urdu', serif; font-size: 18px; line-height: 2.2; text-align: right; background: #fffbeb; padding: 12px; border-radius: 8px; border: 1px solid #fef3c7; color: #1e1b4b; margin-bottom: 8px; }
    .english-scripture { font-size: 13px; font-style: italic; color: #334155; margin-bottom: 12px; }
    .discipleship-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; background: #f8fafc; padding: 10px; border-radius: 8px; font-size: 11px; }
    .disc-col h4 { margin: 0 0 4px 0; font-size: 11px; color: #0B2545; }
    .disc-col p { margin: 0; color: #475569; }
    .day-footer { display: flex; justify-content: space-between; font-size: 10px; color: #94a3b8; margin-top: 10px; border-top: 1px dashed #e2e8f0; padding-top: 6px; }
    @media print { body { padding: 0; } }
  </style>
</head>
<body>
  <div class="church-header">
    <div class="church-title">THE CHURCH OF PENTECOST, DUBAI</div>
    <div class="church-sub">PAKISTANI & INDIAN WORSHIP CENTRE</div>
    <div class="plan-title">${plan.name} (${plan.version})</div>
    <div class="plan-tagline">“Read • Understand • Memorize • Review • Live the Word”</div>
  </div>
  ${daysHtml}
</body>
</html>`;
  }
}
