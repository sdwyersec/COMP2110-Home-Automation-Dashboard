// Select DOM elements
const taskInput = document.getElementById('task-input');
const addBtn = document.getElementById('add-btn');
const taskList = document.getElementById('task-list');

// Load tasks from localStorage
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
renderTasks();

// Event listeners
addBtn.addEventListener('click', addTask);
taskInput.addEventListener('keypress', e => {
  if (e.key === 'Enter') addTask();
});

// Add a new task
function addTask() {
  const text = taskInput.value.trim();
  if (!text) return;
  const task = {
    id: Date.now(),
    text,
    done: false
  };
  tasks.push(task);
  saveAndRender();
  taskInput.value = '';
}

// Toggle completion or delete
taskList.addEventListener('click', e => {
  const target = e.target;
  const li = target.closest('li');
  if (!li) return;
  const id = Number(li.dataset.id);

  if (target.classList.contains('toggle')) {
    tasks = tasks.map(t =>
      t.id === id ? { ...t, done: !t.done } : t
    );
  } else if (target.classList.contains('delete')) {
    tasks = tasks.filter(t => t.id !== id);
  }
  saveAndRender();
});

// Save to localStorage and re-render list
function saveAndRender() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
  renderTasks();
}

// Render the list
function renderTasks() {
  taskList.innerHTML = '';
  tasks.forEach(({ id, text, done }) => {
    const li = document.createElement('li');
    li.dataset.id = id;
    li.className = done ? 'task done' : 'task';
    li.innerHTML = `
      <span class="toggle">${done ? '✔️' : '⭕'}</span>
      <span class="text">${text}</span>
      <button class="delete">🗑️</button>
    `;
    taskList.appendChild(li);
  });
}