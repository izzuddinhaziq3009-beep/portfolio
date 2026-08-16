/**
 * Purely decorative source shown by CodeTypewriterBackgroundComponent.
 * Each entry is a short 3-4 line snippet — one appears at a time, types
 * out, holds briefly, then fades before the next one appears elsewhere.
 * Kept separate from portfolio-data.ts since this isn't user-editable
 * profile content.
 */
export const SHORT_SNIPPETS: readonly string[][] = [
  [
    'const count = signal(0);',
    'const doubled = computed(() => count() * 2);',
    'count.set(count() + 1);',
  ],
  [
    '@Component({',
    "  selector: 'app-card',",
    '  standalone: true,',
    '})',
  ],
  [
    "const res = await fetch('/api/projects');",
    'const data = await res.json();',
    'return data.filter((p) => p.active);',
  ],
  [
    '<button (click)="onSave()" [disabled]="saving">',
    '  Save changes',
    '</button>',
  ],
  [
    '.card:hover {',
    '  transform: translateY(-2px);',
    '  box-shadow: var(--shadow-lg);',
    '}',
  ],
  [
    'interface Project {',
    '  id: string;',
    '  name: string;',
    '  tags: string[];',
    '}',
  ],
  [
    'const total = items',
    '  .filter((i) => i.active)',
    '  .reduce((sum, i) => sum + i.price, 0);',
  ],
  [
    'this.search$',
    '  .pipe(debounceTime(300))',
    '  .subscribe((q) => this.query(q));',
  ],
  [
    "app.get('/health', (_req, res) => {",
    '  res.json({ ok: true });',
    '});',
  ],
  [
    'try {',
    '  await save(record);',
    '} catch (err) {',
    '  console.error(err);',
    '}',
  ],
];
