// contact.js: the notepad. "What kind of work? circle one" picks the email subject; every email link
// on the page follows the choice. Each link is a real mailto: link, so it all works with JS off.
import { note, announce, rewrite } from './notes.js';

export const EMAIL = 'cmarquezworks@gmail.com';
export const MODES = [
  { label: 'full-time', subject: 'Full-time role: UI/UX + frontend',
    body: 'Hi Christian,\n\nWe have a full-time role and would like to talk.\n\nRole:\nTeam:\nLink:\n' },
  { label: 'contract', subject: 'Contract work: UI/UX + frontend',
    body: 'Hi Christian,\n\nWe have contract work and would like to talk.\n\nScope:\nTimeline:\nBudget:\n' },
  { label: 'project', subject: 'Project inquiry: UI/UX + frontend',
    body: 'Hi Christian,\n\nWe have a project and would like your help.\n\nWhat:\nTimeline:\nBudget:\n' },
];

export function mailtoFor(i) {
  const m = MODES[i] ?? MODES[0];
  return `mailto:${EMAIL}?subject=${encodeURIComponent(m.subject)}&body=${encodeURIComponent(m.body)}`;
}

export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    Object.assign(ta.style, { position: 'fixed', opacity: '0', top: '0', left: '0' });
    document.body.append(ta);
    ta.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch { ok = false; }
    ta.remove();
    return ok;
  }
}

export function initNotepad(root = document) {
  const pad = root.querySelector('[data-notepad]');
  if (pad) {
    const opts = [...pad.querySelectorAll('[role="radio"]')];
    const subject = pad.querySelector('[data-subject]');
    const mails = [...root.querySelectorAll('a[data-mail]')];
    let cur = Math.max(0, opts.findIndex((o) => o.getAttribute('aria-checked') === 'true'));
    const choose = (i, { focus = false, write = true } = {}) => {
      cur = (i + opts.length) % opts.length;
      opts.forEach((o, j) => { o.setAttribute('aria-checked', String(j === cur)); o.tabIndex = j === cur ? 0 : -1; });
      if (focus) opts[cur].focus();
      mails.forEach((a) => { a.href = mailtoFor(cur); });
      if (subject) {
        subject.textContent = `subject: ${MODES[cur].subject}`;
        if (write) rewrite(subject);
      }
    };
    opts.forEach((o, i) => {
      o.addEventListener('click', () => choose(i));
      o.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); choose(cur + 1, { focus: true }); }
        else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); choose(cur - 1, { focus: true }); }
      });
    });
    choose(cur, { write: false });
  }
  root.querySelectorAll('[data-copy-email]').forEach((b) => b.addEventListener('click', async () => {
    const ok = await copyText(EMAIL);
    note(b, ok ? 'copied ✓' : `copy it: ${EMAIL}`);
    announce(ok ? 'Email address copied' : 'Copy failed');
  }));
}
