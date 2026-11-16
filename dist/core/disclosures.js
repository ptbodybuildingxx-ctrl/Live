// Presentation-only disclosure state. Restore only the same account/page scope
// and explicit stable keys; do not persist form values or health information.
export function captureDisclosures(root, scope) {
  if (root.dataset.disclosureScope !== scope) return new Map();
  return new Map([...root.querySelectorAll('details[data-disclosure-key]')]
    .map(node => [node.dataset.disclosureKey, node.open]));
}

export function restoreDisclosures(root, scope, previous) {
  root.dataset.disclosureScope = scope;
  for (const node of root.querySelectorAll('details[data-disclosure-key]')) {
    if (previous.has(node.dataset.disclosureKey)) node.open = previous.get(node.dataset.disclosureKey);
  }
}

// A background snapshot must not overwrite user edits after a field loses focus.
// Compare DOM controls with their rendered defaults; never store their values.
export function hasUnsavedForm(root) {
  if (!root) return false;
  for (const form of root.querySelectorAll('form[data-form]')) {
    for (const el of form.elements) {
      if (el.disabled || !el.name) continue;
      if (el.tagName === 'SELECT') {
        const options = [...el.options], explicit = options.some(o => o.defaultSelected), first = options.findIndex(o => !o.disabled);
        if (options.some((o, i) => o.selected !== (o.defaultSelected || (!explicit && !el.multiple && i === first)))) return true;
      } else if (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT') {
        if (['checkbox','radio'].includes(el.type)) { if (el.checked !== el.defaultChecked) return true; }
        else if (el.type === 'file') { if (el.files?.length) return true; }
        else if (!['hidden','submit','button','reset'].includes(el.type) && el.value !== el.defaultValue) return true;
      }
    }
  }
  return false;
}

export function workspaceCard({ module, t, h, ic, btn }) {
  const { id, icon, stage, items } = module;
  return `<details class="workspace-card" data-disclosure-key="module:${h(id)}">
    <summary>
      <span class="workspace-card-heading">
        <span class="workspace-card-icon">${ic(icon)}</span>
        <span class="workspace-card-label"><b>${h(t(id))}</b><span class="badge ${stage === 'prototype' ? 'green' : 'gold'}">${h(t(stage))}</span></span>
      </span>
    </summary>
    <div class="workspace-card-body stack">
      <ul>${items.map(key => `<li>${h(t(key))}</li>`).join('')}</ul>
      ${btn(t('openModule'), 'nav', `data-id="${h(id)}"`, 'primary')}
    </div>
  </details>`;
}
