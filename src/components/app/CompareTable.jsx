// "What's included at every level": Futures, Rec, Club and Academy side by side.
// The program being viewed gets the widest column and a teal outline; the others link to their page.
import React from 'react';
import { CheckCircle } from '@phosphor-icons/react';
import { COMPARE_COLUMNS, COMPARE_ROWS } from '../../data/site';
import { ROW_RULE } from '../ui.jsx';

export default function CompareTable({ programs, current, onPick }) {
  const P = Object.fromEntries(programs.map((p) => [p.id, p]));
  const grid = 'minmax(200px,1.3fr) ' + COMPARE_COLUMNS.map((k) => (k === current ? 'minmax(0,1.6fr)' : 'minmax(0,1fr)')).join(' ');
  const included = COMPARE_ROWS.filter(([k]) => P[current].compare[k] != null).length;
  const last = COMPARE_ROWS.length - 1;
  return (
    <div style={{ overflowX: 'auto', margin: '0 -4px', padding: '4px' }}>
      <div role="table" aria-label="Compare programs" style={{ minWidth: '820px', display: 'flex', flexDirection: 'column' }}>
        <div role="row" style={{ display: 'grid', gridTemplateColumns: grid, alignItems: 'end' }}>
          <span role="columnheader" style={{ padding: '0 16px 14px 0', fontSize: '11px', letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--color-neutral-500)' }}>{included} of {COMPARE_ROWS.length} included in {P[current].name}</span>
          {COMPARE_COLUMNS.map((k) => {
            const cur = k === current;
            return (
              <button key={k} role="columnheader" type="button" onClick={() => { if (!cur) onPick(k); }} aria-current={cur ? 'page' : undefined}
                style={{ all: 'unset', cursor: cur ? 'default' : 'pointer', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: '6px', padding: cur ? '18px 16px 16px' : '12px 16px 14px', borderRadius: '12px 12px 0 0', background: cur ? 'linear-gradient(180deg,rgba(120,183,179,.22),rgba(120,183,179,.1))' : 'transparent', boxShadow: cur ? 'inset 1px 0 0 #78b7b3,inset -1px 0 0 #78b7b3,inset 0 1px 0 #78b7b3' : 'none', transition: 'background .3s' }}>
                <span style={{ alignSelf: 'flex-start', fontSize: '10px', letterSpacing: '.12em', textTransform: 'uppercase', padding: '4px 7px', borderRadius: '5px', background: cur ? '#78b7b3' : 'transparent', color: cur ? '#111318' : 'var(--color-accent-300)' }}>{cur ? 'Viewing' : 'View →'}</span>
                <span style={{ font: `500 ${cur ? '28px' : '18px'}/1 var(--font-heading)`, letterSpacing: '-.03em', color: cur ? 'var(--color-text)' : 'var(--color-neutral-300)' }}>{P[k].name}</span>
                <span style={{ fontSize: '12px', color: 'var(--color-neutral-500)' }}>{P[k].ages}</span>
              </button>
            );
          })}
        </div>
        {COMPARE_ROWS.map(([key, label], ri) => (
          <div key={key} role="row" style={{ display: 'grid', gridTemplateColumns: grid, alignItems: 'stretch', background: ROW_RULE }}>
            <span role="rowheader" style={{ display: 'flex', alignItems: 'center', padding: '14px 16px 14px 0', fontSize: '14px', color: 'var(--color-neutral-300)' }}>{label}</span>
            {COMPARE_COLUMNS.map((k) => {
              const v = P[k].compare[key], cur = k === current, none = v == null;
              return (
                <span key={k} role="cell" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '14px 16px', fontSize: cur ? '15px' : '13px', color: none ? 'var(--color-neutral-600)' : cur ? 'var(--color-text)' : 'var(--color-neutral-400)', background: cur ? 'rgba(120,183,179,.08)' : 'transparent', boxShadow: cur ? 'inset 1px 0 0 #78b7b3,inset -1px 0 0 #78b7b3' + (ri === last ? ',inset 0 -1px 0 #78b7b3' : '') : 'none', borderRadius: cur && ri === last ? '0 0 12px 12px' : 0, transition: 'background .3s' }}>
                  {cur && !none ? <CheckCircle size={18} color="#78b7b3" aria-hidden="true" style={{ flex: 'none' }} /> : null}
                  {none ? <span aria-label="Not included">–</span> : v}
                </span>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
