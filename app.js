document.addEventListener('DOMContentLoaded', () => {

  const createStore = (storageKey) => {
    let tasks = [];

    const _persist = () => {
      localStorage.setItem(storageKey, JSON.stringify(tasks));
    };

    const _hydrate = () => {
      const data = localStorage.getItem(storageKey);
      if (data) {
        tasks = JSON.parse(data);
      }
    };

    const _deepClone = (obj) => JSON.parse(JSON.stringify(obj));

    _hydrate();

    return {
      add: (task) => {
        tasks.push({ ...task, id: `task-${Date.now()}` });
        _persist();
        return _deepClone(tasks);
      },
      toggle: (id) => {
        tasks = tasks.map(task =>
          task.id === id ? { ...task, done: !task.done } : task
        );
        _persist();
        return _deepClone(tasks);
      },
      remove: (id) => {
        tasks = tasks.filter(task => task.id !== id);
        _persist();
        return _deepClone(tasks);
      },
      list: () => _deepClone(tasks),
    };
  };

  const escapeHTML = (str) => {
    const p = document.createElement('p');
    p.textContent = str;
    return p.innerHTML;
  };
  
  const summarize = (tasks) => {
    const done = tasks.filter(task => task.done).length;
    const active = tasks.length - done;
    const total = tasks.length;
    const pct = total === 0 ? 0 : Math.round((done / total) * 100);
    return { active, done, pct };
  };

  const renderAnalytics = (tasks) => {
    const { active, done, pct } = summarize(tasks);
    const analyticsEl = document.getElementById('analytics');
    analyticsEl.textContent = `Active: ${active} · Done: ${done} · Done %: ${pct}%`;
  };

  const renderTasks = (tasks) => {
    const activeList = document.getElementById('active-list');
    const doneList = document.getElementById('done-list');

    const activeTasks = tasks.filter(task => !task.done);
    const doneTasks = tasks.filter(task => task.done);

    const taskToHTML = (task) => `
      <li class="task-item ${task.done ? 'done' : ''}" data-id="${task.id}">
        <input type="checkbox" data-action="toggle" ${task.done ? 'checked' : ''}>
        <span>${escapeHTML(task.title)}</span>
        <button type="button" data-action="remove">X</button>
      </li>
    `;

    activeList.innerHTML = activeTasks.map(taskToHTML).join('');
    doneList.innerHTML = doneTasks.map(taskToHTML).join('');
  };
  
  const store = createStore('focustasks_1234');
  const form = document.getElementById('add-task-form');
  const input = document.getElementById('new-task-title');
  const mainEl = document.querySelector('main');
  const errorEl = document.getElementById('error-message');
  
  const fullRender = () => {
    const tasks = store.list();
    renderTasks(tasks);
    renderAnalytics(tasks);
  };
  
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = input.value.trim();
    
    if (title) {
      store.add({ title, done: false });
      fullRender();
      input.value = '';
      errorEl.textContent = '';
    } else {
      errorEl.textContent = "Task title cannot be empty.";
    }
  });

  mainEl.addEventListener('click', (e) => {
    const action = e.target.dataset.action;
    if (!action) return;

    const listItem = e.target.closest('.task-item');
    const id = listItem.dataset.id;
    
    if (action === 'toggle' || action === 'remove') {
      store[action](id);
      fullRender();
    }
  });

  fullRender();
});