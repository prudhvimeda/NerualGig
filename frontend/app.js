const state = {
  baseUrl: localStorage.getItem('neuralgig-base-url') || 'http://localhost:8000',
};

const baseUrlInput = document.querySelector('#base-url');
const statusNode = document.querySelector('#api-status');
const alertsRoot = document.querySelector('#alerts');
const yearNode = document.querySelector('#year');
const navButtons = document.querySelectorAll('[data-section-target]');
const panels = document.querySelectorAll('.panel');
const hasPrototypeConsole = Boolean(document.querySelector('#workspace'));

if (baseUrlInput) {
  baseUrlInput.value = state.baseUrl;
}

if (yearNode) {
  yearNode.textContent = new Date().getFullYear();
}

function setActivePanel(target) {
  if (!target) return;
  navButtons.forEach((button) => {
    button.classList.toggle('active', button.dataset.sectionTarget === target);
  });
  panels.forEach((panel) => {
    panel.classList.toggle('active', panel.dataset.panel === target);
  });
}

if (navButtons.length) {
  navButtons.forEach((button) => {
    button.addEventListener('click', () => {
      setActivePanel(button.dataset.sectionTarget);
      const workspace = document.querySelector('#workspace');
      workspace?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
  setActivePanel(navButtons[0].dataset.sectionTarget);
}

function showAlert(message, variant = 'info') {
  if (!alertsRoot) return;
  const tpl = document.querySelector('#alert-template');
  if (!tpl) return;
  const node = tpl.content.firstElementChild.cloneNode(true);
  node.classList.add(`alert-${variant}`);
  node.querySelector('.message').textContent = message;
  node.querySelector('.close').addEventListener('click', () => node.remove());
  alertsRoot.appendChild(node);
  setTimeout(() => node.remove(), 8000);
}

function updateStatus(connected) {
  if (!statusNode) return;
  statusNode.textContent = connected ? 'Connected' : 'Disconnected';
  statusNode.classList.toggle('connected', connected);
}

async function connect(baseUrl) {
  try {
    const response = await fetch(`${baseUrl}/projects`);
    if (!response.ok && response.type !== 'opaqueredirect') {
      throw new Error('Received non-OK response');
    }
    state.baseUrl = baseUrl;
    localStorage.setItem('neuralgig-base-url', baseUrl);
    updateStatus(true);
    showAlert(`Connected to ${baseUrl}`, 'success');
  } catch (error) {
    updateStatus(false);
    showAlert(`Connection failed: ${error.message}`, 'error');
  }
}

function parseKeyValuePairs(input) {
  const entries = input
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
  const result = {};
  for (const entry of entries) {
    const [key, rawValue] = entry.split(':').map((part) => part.trim());
    if (!key) continue;
    if (rawValue === undefined || rawValue === '') {
      result[key] = 1;
      continue;
    }
    const numeric = Number(rawValue);
    result[key] = Number.isFinite(numeric) ? numeric : rawValue;
  }
  return result;
}

function parseList(input) {
  return input
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function getFormData(form) {
  const data = new FormData(form);
  return Object.fromEntries(data.entries());
}

function attachFormHandler(formId, handler) {
  const form = document.querySelector(formId);
  if (!form) return;
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const submitButton = form.querySelector('[type="submit"]');
    submitButton.disabled = true;
    try {
      const payload = handler(getFormData(form));
      const response = await fetch(payload.url, payload.options);
      if (!response.ok) {
        const detail = await response.json().catch(() => ({}));
        const message = detail?.detail || response.statusText;
        throw new Error(message);
      }
      const body = await response.json().catch(() => ({}));
      payload.onSuccess?.(body);
    } catch (error) {
      showAlert(error.message, 'error');
    } finally {
      submitButton.disabled = false;
    }
  });
}

function renderJson(node, data) {
  node.textContent = JSON.stringify(data, null, 2);
}

if (hasPrototypeConsole) {
  connect(state.baseUrl);

  attachFormHandler('#base-url-form', ({ ['base-url']: baseUrl }) => ({
    url: `${baseUrl}/projects`,
    options: { method: 'GET' },
    onSuccess: () => connect(baseUrl),
  }));

  attachFormHandler('#freelancer-form', (values) => {
  const payload = {
    freelancer_id: values.freelancer_id,
    name: values.name,
    availability_hours: Number(values.availability_hours),
    rating: Number(values.rating),
    active_projects: Number(values.active_projects),
    skills: parseKeyValuePairs(values.skills),
    tools: parseList(values.tools),
  };
  return {
    url: `${state.baseUrl}/freelancers`,
    options: {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    },
    onSuccess: (body) => {
      renderJson(document.querySelector('#freelancer-output'), body);
      showAlert(`Freelancer ${body.name} registered`, 'success');
    },
  };
  });

  attachFormHandler('#project-form', (values) => {
  const payload = {
    project_id: values.project_id,
    title: values.title,
    hours_needed: Number(values.hours_needed),
    budget: Number(values.budget),
    allow_group: values.allow_group !== undefined,
    required_skills: parseKeyValuePairs(values.required_skills),
    preferred_tools: parseList(values.preferred_tools),
  };
  return {
    url: `${state.baseUrl}/projects`,
    options: {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    },
    onSuccess: (body) => {
      renderJson(document.querySelector('#project-output'), body);
      showAlert(`Project ${body.title} created`, 'success');
    },
  };
  });

  attachFormHandler('#match-form', (values) => {
  const payload = {
    top_n: Number(values.top_n),
  };
  return {
    url: `${state.baseUrl}/projects/${values.project_id}/match`,
    options: {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    },
    onSuccess: (body) => {
      renderJson(document.querySelector('#match-output'), body);
      const count = body.matches?.length || 0;
      showAlert(`Received ${count} match result${count === 1 ? '' : 's'}`, 'info');
    },
  };
  });

  attachFormHandler('#onboarding-form', (values) => ({
    url: `${state.baseUrl}/projects/${values.project_id}/onboarding/${values.freelancer_id}`,
    options: { method: 'GET' },
    onSuccess: (body) => {
      renderJson(document.querySelector('#onboarding-output'), body);
      showAlert('Onboarding plan generated', 'success');
    },
  }));

  attachFormHandler('#milestone-form', (values) => {
  const milestones = parseKeyValuePairs(values.milestones);
  const payload = {
    milestones: Object.entries(milestones).map(([name, amount]) => ({
      name,
      amount: Number(amount),
    })),
  };
  return {
    url: `${state.baseUrl}/projects/${values.project_id}/milestones`,
    options: {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    },
    onSuccess: (body) => {
      renderJson(document.querySelector('#milestone-output'), body);
      showAlert('Milestone schedule created', 'success');
    },
  };
  });

  attachFormHandler('#milestone-action-form', (values) => ({
    url: `${state.baseUrl}/projects/${values.project_id}/milestones/${values.milestone_name}/${values.action}`,
    options: { method: 'POST' },
    onSuccess: (body) => {
      renderJson(document.querySelector('#milestone-output'), body);
      showAlert(`Milestone ${values.milestone_name} updated`, 'success');
    },
  }));
}
