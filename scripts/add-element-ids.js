/**
 * Script to add id attributes to v-text-field, v-dialog, and v-card elements
 * across all .vue files in the project.
 *
 * Usage: node scripts/add-element-ids.js
 *
 * Convention:
 *   v-text-field -> tf-{prefix}-{vmodel_or_label}-{n}
 *   v-dialog     -> dlg-{prefix}-{vmodel_or_purpose}-{n}
 *   v-card       -> card-{prefix}-{purpose}-{n}
 *
 * For nested folders, uses shorter prefix (like 5-letter abbreviation).
 * Skips elements already with id/:id.
 * Skips elements inside v-for directives.
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

const ROOT = path.resolve(__dirname, '..');

// ─── Helpers ────────────────────────────────────────────────────────────────

function slugify(str) {
  if (!str) return '';
  return str
    .replace(/\s+/g, '-')
    .replace(/[^a-zA-Z0-9_-]/g, '')
    .toLowerCase()
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || 'field';
}

/** Get a short prefix from a file path */
function getPrefix(filePath) {
  const rel = path.relative(ROOT, filePath).replace(/\\/g, '/');
  const parts = rel.replace(/\.vue$/, '').split('/');

  if (parts[0] === 'components') {
    const compParts = parts.slice(1);
    if (compParts.length === 1) return slugify(compParts[0]);
    // For nested, use last 2 segments with abbreviations
    const segments = compParts.map(p => {
      if (p === '_id' || p.startsWith('_')) return 'detl';
      return slugify(p).substring(0, 5);
    });
    return segments.join('-');
  }

  if (parts[0] === 'layouts') return 'layout-' + slugify(parts[1] || 'default');
  if (parts[0] === 'pages') {
    const pageParts = parts.slice(1).filter(p => !p.startsWith('_'));
    if (pageParts.length === 1) return slugify(pageParts[0]);
    const segments = pageParts.map(p => slugify(p).substring(0, 5));
    return segments.join('-');
  }

  return parts.slice(-3).map(p => slugify(p).substring(0, 5)).join('-');
}

/**
 * Check if the element at matchIndex is inside a v-for by scanning backward.
 * Looks for the nearest opening tag containing v-for that hasn't been closed yet.
 */
function isInsideVFor(text, matchIndex) {
  const before = text.substring(0, matchIndex);
  
  // Find all v-for occurrences
  const vForRegex = /<([a-zA-Z][a-zA-Z0-9-]*)[^>]*?v-for\s*=\s*["'][^"']*["'][^>]*>/gi;
  let match;
  
  while ((match = vForRegex.exec(before)) !== null) {
    const tagName = match[1];
    const fullMatch = match[0];
    const tagStart = match.index;
    const tagEnd = match.index + fullMatch.length;
    
    // Check if this v-for tag is still open (not closed) before our element
    const betweenTagAndElement = text.substring(tagEnd, matchIndex);
    
    // Count how many of this tag type are opened vs closed between the v-for and our element
    const openRegex = new RegExp(`<${tagName}[\\s>]`, 'gi');
    const closeRegex = new RegExp(`</${tagName}>`, 'gi');
    
    const opens = (betweenTagAndElement.match(openRegex) || []).length;
    const closes = (betweenTagAndElement.match(closeRegex) || []).length;
    
    // Also count self-closing tags
    const selfCloseRegex = new RegExp(`<${tagName}[^>]*/>`, 'gi');
    const selfCloses = (betweenTagAndElement.match(selfCloseRegex) || []).length;
    
    const totalCloses = closes + selfCloses;
    
    // If there are more opens than closes, we're inside this v-for iteration
    if (opens < totalCloses + 1) {
      // The v-for tag itself might be closed or we moved past it
      // Check if the v-for tag is self-closing
      if (fullMatch.endsWith('/>')) continue; // self-closing, so not a container
      
      // For non-self-closing tags: no additional opens means the tag is closed
      if (opens === 0 && closes > 0) continue;
      
      // We're inside the v-for!
      return true;
    }
  }
  
  return false;
}

// ─── Main Processing ─────────────────────────────────────────────────────────

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  let modified = false;
  const prefix = getPrefix(filePath);
  
  // Counters per file per type
  let tfCounter = 0, dlgCounter = 0, cardCounter = 0, dtCounter = 0;

  // ─── Process v-text-field ─────────────────────────────────────────────
  const tfRegex = /<v-text-field\s[^>]*>/gi;
  const tfReplacements = [];
  tfRegex.lastIndex = 0;
  let match;

  while ((match = tfRegex.exec(content)) !== null) {
    const fullTag = match[0];
    if (/\sid\s*=\s*["']/.test(fullTag) || /:id\s*=\s*["']/.test(fullTag)) continue;
    if (isInsideVFor(content, match.index)) continue;
    
    tfCounter++;
    let context = '';
    const vm = fullTag.match(/v-model\s*=\s*"([^"]+)"/);
    if (vm) context = slugify(vm[1].replace(/\./g, '-'));
    else {
      const lb = fullTag.match(/label\s*=\s*"([^"]+)"/);
      if (lb) context = slugify(lb[1]);
      else {
        const ph = fullTag.match(/placeholder\s*=\s*"([^"]+)"/);
        if (ph) context = slugify(ph[1]);
      }
    }
    const ctx = context ? `-${context}` : '';
    const id = `tf-${prefix}${ctx}-${tfCounter}`;
    tfReplacements.push({ old: fullTag, new: fullTag.replace('<v-text-field', `<v-text-field id="${id}"`) });
  }

  for (const r of tfReplacements) {
    if (content.includes(r.old)) { content = content.replace(r.old, r.new); modified = true; }
  }

  // ─── Process v-dialog ─────────────────────────────────────────────────
  const dlgRegex = /<v-dialog\s[^>]*>/gi;
  dlgRegex.lastIndex = 0;
  const dlgReplacements = [];

  while ((match = dlgRegex.exec(content)) !== null) {
    const fullTag = match[0];
    if (/\sid\s*=\s*["']/.test(fullTag) || /:id\s*=\s*["']/.test(fullTag)) continue;
    if (isInsideVFor(content, match.index)) continue;
    
    dlgCounter++;
    let context = '';
    const vm = fullTag.match(/v-model\s*=\s*"([^"]+)"/);
    if (vm) context = slugify(vm[1].replace(/\./g, '-'));
    const ctx = context ? `-${context}` : '';
    const id = `dlg-${prefix}${ctx}-${dlgCounter}`;
    dlgReplacements.push({ old: fullTag, new: fullTag.replace('<v-dialog', `<v-dialog id="${id}"`) });
  }

  for (const r of dlgReplacements) {
    if (content.includes(r.old)) { content = content.replace(r.old, r.new); modified = true; }
  }

  // ─── Process v-card ───────────────────────────────────────────────────
  const cardRegex = /<v-card\s[^>]*>/gi;
  cardRegex.lastIndex = 0;
  const cardReplacements = [];

  while ((match = cardRegex.exec(content)) !== null) {
    const fullTag = match[0];
    if (/\sid\s*=\s*["']/.test(fullTag) || /:id\s*=\s*["']/.test(fullTag)) continue;
    if (isInsideVFor(content, match.index)) continue;
    
    cardCounter++;
    // Try to find a nearby header/subtitle for context
    let context = '';
    const cls = fullTag.match(/class\s*=\s*"([^"]+)"/);
    if (cls) {
      const meaningful = cls[1].split(/\s+/).find(c => 
        !/^(elevation|outlined|flat|rounded|border|pa-|ma-|mb-|mt-|mx-|my-|d-|flex|align|justify|fill|w-|h-|max-|min-|text-|grey|white|black|transparent|bg-|color|hover|shrink|grow|wrap|nowrap|line-clamp)/.test(c)
      );
      if (meaningful) context = slugify(meaningful);
    }
    const ctx = context ? `-${context}` : '';
    const id = `card-${prefix}${ctx}-${cardCounter}`;
    cardReplacements.push({ old: fullTag, new: fullTag.replace('<v-card', `<v-card id="${id}"`) });
  }

  for (const r of cardReplacements) {
    if (content.includes(r.old)) { content = content.replace(r.old, r.new); modified = true; }
  }


  // ─── Process v-data-table ────────────────────────────────────────────
  const dtRegex = /<v-data-table\s[^>]*>/gi;
  dtRegex.lastIndex = 0;
  const dtReplacements = [];

  while ((match = dtRegex.exec(content)) !== null) {
    const fullTag = match[0];
    if (/\sid\s*=\s*["']/.test(fullTag) || /:id\s*=\s*["']/.test(fullTag)) continue;
    if (isInsideVFor(content, match.index)) continue;
    
    dtCounter++;
    let context = '';
    // Try to extract context from :items or class
    const itemsMatch = fullTag.match(/:items\s*=\s*"([^"]+)"/);
    if (itemsMatch) context = slugify(itemsMatch[1].replace(/\./g, '-').replace(/\$/g, ''));
    else {
      const cls = fullTag.match(/class\s*=\s*"([^"]+)"/);
      if (cls) {
        const meaningful = cls[1].split(/\s+/).find(c => 
          !/^(elevation|outlined|flat|rounded|border|pa-|ma-|mb-|mt-|mx-|my-|d-|flex|align|justify|fill|w-|h-|max-|min-|text-|grey|white|black|transparent|bg-)/.test(c)
        );
        if (meaningful) context = slugify(meaningful);
      }
    }
    const ctx = context ? `-${context}` : '';
    const id = `dt-${prefix}${ctx}-${dtCounter}`;
    dtReplacements.push({ old: fullTag, new: fullTag.replace('<v-data-table', `<v-data-table id="${id}"`) });
  }

  for (const r of dtReplacements) {
    if (content.includes(r.old)) { content = content.replace(r.old, r.new); modified = true; }
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf-8');
    return { path: path.relative(ROOT, filePath), tf: tfCounter, dlg: dlgCounter, card: cardCounter, dt: dtCounter };
  }
  return null;
}

// ─── Run ─────────────────────────────────────────────────────────────────────

const vueFiles = glob.sync('**/*.vue', {
  cwd: ROOT,
  ignore: ['node_modules/**', '.nuxt/**', '_legacy/**', '.agents/**', 'nul/**', 'test/**'],
});

console.log(`\nFound ${vueFiles.length} .vue files. Processing...\n`);

let processed = 0, modifiedCount = 0;
let totalTf = 0, totalDlg = 0, totalCard = 0, totalDt = 0;

for (const file of vueFiles) {
  const fullPath = path.join(ROOT, file);
  try {
    const result = processFile(fullPath);
    processed++;
    if (result) {
      modifiedCount++;
      totalTf += result.tf;
      totalDlg += result.dlg;
      totalCard += result.card;
      totalDt += result.dt;
      console.log(`  ✓ ${result.path} (tf:${result.tf} dlg:${result.dlg} card:${result.card} dt:${result.dt})`);
    }
  } catch (err) {
    console.error(`  ✗ ${file}: ${err.message}`);
  }
}

console.log(`\nDone! Processed ${processed} files, modified ${modifiedCount} files.`);
console.log(`Added: ${totalTf} v-text-field, ${totalDlg} v-dialog, ${totalCard} v-card, ${totalDt} v-data-table IDs`);
