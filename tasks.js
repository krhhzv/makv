let tasks = JSON.parse(localStorage.getItem("tasks") || "[]");

function getTasksUI() {
    return `
    <div style="margin-bottom: 32px; display: flex; align-items: center; gap: 12px;">
        <div style="width: 40px; height: 40px; background: var(--primary-light); color: var(--primary); border-radius: 12px; display: flex; align-items: center; justify-content: center;">
            <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>
        </div>
        <h2 style="margin: 0; font-size: 24px;">Tasks</h2>
    </div>

    <div style="display: flex; gap: 12px; margin-bottom: 32px;">
        <input id="taskInput" placeholder="What needs to be done?" style="flex: 1; padding: 20px 24px; font-size: 16px;" onkeypress="if(event.key === 'Enter') addTask()">
        <button class="btn-secondary" onclick="addTask()" style="padding: 20px 32px; font-size: 16px; font-weight: 600;">
            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            Add
        </button>
    </div>

    <div id="taskList"></div>
  `;
}

function initTasks() {
    renderTasks();
}

function addTask() {
    let val = document.getElementById("taskInput").value.trim();
    if (!val) return;

    tasks.push(val);
    saveTasks();
    renderTasks();
    
    document.getElementById("taskInput").value = "";
    document.getElementById("taskInput").focus();
    
    if(window.showToast) showToast("Task added");
}

function renderTasks() {
    let el = document.getElementById("taskList");

    if (tasks.length === 0) {
        el.innerHTML = `
            <div style="text-align: center; padding: 60px 20px; color: var(--text-muted);">
                <svg viewBox="0 0 24 24" width="48" height="48" stroke="currentColor" stroke-width="1.5" fill="none" style="margin-bottom: 16px; opacity: 0.5;"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                <p style="margin: 0; font-size: 16px;">All caught up! You have no tasks.</p>
            </div>
        `;
        return;
    }

    el.innerHTML = tasks.map((t, i) => `
    <div style="background: var(--card-bg); border-radius: var(--radius-lg); padding: 16px 20px; margin-bottom: 12px; box-shadow: var(--shadow-sm); border: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center;">
      <span style="font-size: 15px; font-weight: 500;">${t}</span>
      <button class="btn-icon" onclick="deleteTask(${i})" style="padding: 8px; margin: 0; color: #ef4444;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
      </button>
    </div>
  `).join("");
}

function deleteTask(i) {
    tasks.splice(i, 1);
    saveTasks();
    renderTasks();
    if(window.showToast) showToast("Task deleted");
}

function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}