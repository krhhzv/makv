// STATE
let currentTab = "home";

// --- NOTES STATE ---
let notes = localStorage.getItem("notes") || "";
let saveTimeout;

// --- TASKS STATE ---
let tasks = JSON.parse(localStorage.getItem("tasks") || "[]");

// --- INVOICE STATE ---
let mkItems = JSON.parse(localStorage.getItem("mk_items") || "[]");
let mkClient = localStorage.getItem("mk_client") || "";

// --- CALC STATE ---
let calcValue = "";
let calcHistory = []; // renamed to avoid potential global conflicts though not strictly necessary

// Global Toast System
function showToast(message) {
    const container = document.getElementById("toast-container");
    if (!container) return;
    
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.innerHTML = `
        <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
        ${message}
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = "toast-out 0.3s forwards ease-in";
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function switchTab(tab) {
    currentTab = tab;
    
    document.querySelectorAll(".nav-buttons button").forEach(btn => {
        btn.classList.remove("active");
    });
    
    const activeBtn = Array.from(document.querySelectorAll(".nav-buttons button")).find(btn => btn.getAttribute("onclick").includes(`'${tab}'`));
    if(activeBtn) activeBtn.classList.add("active");

    render();
}

function render() {
    const el = document.getElementById("content");

    if (currentTab === "home") {
        const savedTasks = JSON.parse(localStorage.getItem("tasks") || "[]");
        const pendingCount = savedTasks.length;
        const savedInvoice = JSON.parse(localStorage.getItem("mk_items") || "[]");
        const totalInvoiced = savedInvoice.reduce((sum, item) => sum + item.price, 0);
        const savedNotes = localStorage.getItem("notes") || "";
        const noteLength = savedNotes.trim().length;

        el.innerHTML = `
      <div style="margin-bottom: 32px;">
        <h2 style="font-size: 24px; font-weight: 700; margin-bottom: 8px;">Dashboard</h2>
        <p style="color: var(--text-muted); margin: 0;">Here's an overview of your workspace.</p>
      </div>
      
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 32px;">
        <div class="card" style="margin-bottom: 0;">
            <div style="color: var(--text-muted); font-size: 14px; font-weight: 500; margin-bottom: 8px;">Active Tasks</div>
            <div style="font-size: 32px; font-weight: 700; color: var(--text-main);">${pendingCount}</div>
        </div>
        <div class="card" style="margin-bottom: 0;">
            <div style="color: var(--text-muted); font-size: 14px; font-weight: 500; margin-bottom: 8px;">Total Invoiced</div>
            <div style="font-size: 32px; font-weight: 700; color: var(--text-main);">$${totalInvoiced}</div>
        </div>
        <div class="card" style="margin-bottom: 0;">
            <div style="color: var(--text-muted); font-size: 14px; font-weight: 500; margin-bottom: 8px;">Notes Size</div>
            <div style="font-size: 32px; font-weight: 700; color: var(--text-main);">${noteLength} <span style="font-size: 14px; color: var(--text-muted); font-weight: 500;">chars</span></div>
        </div>
      </div>
      
      <h3 style="font-size: 18px; font-weight: 600; margin-bottom: 16px;">Quick Actions</h3>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 16px;">
        <button class="btn-secondary" onclick="switchTab('tasks')" style="width: 100%; padding: 20px; font-size: 16px; font-weight: 600;">View Tasks</button>
        <button class="btn-secondary" onclick="switchTab('notes')" style="width: 100%; padding: 20px; font-size: 16px; font-weight: 600;">Edit Notes</button>
      </div>
    `;
    }

    if (currentTab === "notes") {
        el.innerHTML = getNotesUI();
        initNotes();
    }

    if (currentTab === "tasks") {
        el.innerHTML = getTasksUI();
        initTasks();
    }

    if (currentTab === "tools") {
        el.innerHTML = `
      <div style="margin-bottom: 24px;">
        <h2 style="font-size: 24px; font-weight: 700; margin-bottom: 8px;">Workspace Tools</h2>
      </div>
      <div class="card" onclick="openTool('invoice')" style="cursor: pointer; display: flex; align-items: center; gap: 16px;">
        <div style="background: var(--primary-light); color: var(--primary); padding: 12px; border-radius: 12px;">
            <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
        </div>
        <div style="flex: 1;">
            <h3 style="margin:0; font-size: 16px; font-weight: 600;">Makv Invoice</h3>
            <p style="margin:0; color: var(--text-muted); font-size: 14px;">Generate premium invoices</p>
        </div>
        <div style="color: var(--text-muted);">
            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </div>
      </div>
      <div class="card" onclick="openTool('calc')" style="cursor: pointer; display: flex; align-items: center; gap: 16px;">
        <div style="background: var(--primary-light); color: var(--primary); padding: 12px; border-radius: 12px;">
            <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><line x1="8" y1="6" x2="16" y2="6"></line><line x1="16" y1="14" x2="16" y2="14.01"></line><line x1="12" y1="14" x2="12" y2="14.01"></line><line x1="8" y1="14" x2="8" y2="14.01"></line><line x1="16" y1="10" x2="16" y2="10.01"></line><line x1="12" y1="10" x2="12" y2="10.01"></line><line x1="8" y1="10" x2="8" y2="10.01"></line><line x1="16" y1="18" x2="16" y2="18.01"></line><line x1="12" y1="18" x2="12" y2="18.01"></line><line x1="8" y1="18" x2="8" y2="18.01"></line></svg>
        </div>
        <div style="flex: 1;">
            <h3 style="margin:0; font-size: 16px; font-weight: 600;">Makv Calculator</h3>
            <p style="margin:0; color: var(--text-muted); font-size: 14px;">Simple & fast calculations</p>
        </div>
        <div style="color: var(--text-muted);">
            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </div>
      </div>
      <div id="tool"></div>
    `;
    }

    setTimeout(() => {
        let input = document.querySelector("input, textarea");
        if (input && currentTab !== 'home' && currentTab !== 'tools') input.focus();
    }, 100);
}

function openTool(t) {
    let el = document.getElementById("tool");
    if (t === "invoice") { el.innerHTML = getInvoiceUI(); initInvoice(); }
    if (t === "calc") { el.innerHTML = getCalculatorUI(); initCalculator(); }
    setTimeout(() => { el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 50);
}


// --- NOTES FUNCTIONS ---
function getNotesUI() {
    return `
    <div style="margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center;">
        <div style="display: flex; align-items: center; gap: 12px;">
            <div style="width: 40px; height: 40px; background: var(--primary-light); color: var(--primary); border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            </div>
            <h2 style="margin: 0; font-size: 24px;">Notes</h2>
        </div>
        <div id="save-indicator" style="font-size: 12px; font-weight: 500; color: var(--text-muted); opacity: 0; transition: opacity 0.3s;">Saved to browser</div>
    </div>
    <div style="background: var(--card-bg); border-radius: var(--radius-lg); padding: 0; box-shadow: var(--shadow-md); border: 1px solid var(--border-color); height: calc(100vh - 240px); min-height: 400px; display: flex; flex-direction: column;">
      <textarea id="note" placeholder="Start typing your notes here..." style="flex: 1; border: none; border-radius: var(--radius-lg); padding: 32px; resize: none; background: transparent; font-size: 16px; line-height: 1.6; box-shadow: none; outline: none;">${notes}</textarea>
    </div>
  `;
}

function initNotes() {
    const el = document.getElementById("note");
    const indicator = document.getElementById("save-indicator");
    
    el.addEventListener("input", e => {
        notes = e.target.value;
        localStorage.setItem("notes", notes);
        if(indicator) { indicator.textContent = "Saving..."; indicator.style.opacity = "1"; }
        clearTimeout(saveTimeout);
        saveTimeout = setTimeout(() => {
            if(indicator) { indicator.textContent = "Saved"; setTimeout(() => { indicator.style.opacity = "0"; }, 2000); }
        }, 1000);
    });
}

// --- TASKS FUNCTIONS ---
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

function initTasks() { renderTasks(); }
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
function deleteTask(i) { tasks.splice(i, 1); saveTasks(); renderTasks(); if(window.showToast) showToast("Task deleted"); }
function saveTasks() { localStorage.setItem("tasks", JSON.stringify(tasks)); }


// --- INVOICE FUNCTIONS ---
function getInvoiceUI() {
    return `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; padding-top: 10px;">
        <div style="display: flex; align-items: center; gap: 12px;">
            <div style="width: 40px; height: 40px; background: var(--primary); color: white; border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            </div>
            <h2 style="margin: 0; font-size: 20px;">Invoice</h2>
        </div>
        <button class="btn-secondary" onclick="previewInvoice()" style="padding: 14px 24px; font-size: 15px; font-weight: 600;">
            <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
            Preview
        </button>
    </div>
    <div style="background: var(--card-bg); border-radius: var(--radius-lg); padding: 16px; margin-bottom: 24px; box-shadow: var(--shadow-sm); border: 1px solid var(--border-color);">
        <input id="mk-client" placeholder="Client Name" value="${mkClient}" oninput="saveClient(this.value)" style="border: none; background: transparent; padding: 4px; font-weight: 600; font-size: 16px; width: 100%; outline: none; box-shadow: none;">
    </div>
    <div id="mk-items"></div>
    <button onclick="mkAdd()" class="btn-secondary" style="width: 100%; margin-bottom: 24px; padding: 16px; border: 1px dashed var(--primary); background: transparent;">
        <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        Add Line Item
    </button>
    <div style="background: var(--card-bg); border-radius: var(--radius-lg); padding: 20px 24px; box-shadow: var(--shadow-sm); border: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center;">
        <span style="font-weight: 600; font-size: 16px; color: var(--text-muted);">Total</span>
        <span id="mk-total" style="font-weight: 700; font-size: 24px; color: var(--text-main);">$0</span>
    </div>
  `;
}
function initInvoice() { renderInvoice(); }
function saveClient(val) { mkClient = val; localStorage.setItem("mk_client", mkClient); }
function mkAdd() { mkItems.push({ name: "New Service", price: 0 }); saveInvoice(); renderInvoice(); }
function mkRemove(i) { mkItems.splice(i, 1); saveInvoice(); renderInvoice(); }
function mkUpdateName(i, val) { mkItems[i].name = val; saveInvoice(); }
function mkUpdatePrice(i, val) { mkItems[i].price = parseFloat(val) || 0; saveInvoice(); renderInvoice(); }
function renderInvoice() {
    let el = document.getElementById("mk-items");
    let total = 0; el.innerHTML = "";
    mkItems.forEach((item, i) => {
        total += item.price;
        el.innerHTML += `
      <div style="background: var(--card-bg); border-radius: var(--radius-lg); padding: 16px; margin-bottom: 16px; box-shadow: var(--shadow-sm); border: 1px solid var(--border-color); display: flex; align-items: center; gap: 12px;">
        <input value="${item.name}" oninput="mkUpdateName(${i},this.value)" style="flex:1; border: none; background: transparent; padding: 4px; font-size: 15px; font-weight: 500; outline: none; box-shadow: none;">
        <input type="number" value="${item.price}" oninput="mkUpdatePrice(${i},this.value)" style="width: 80px; border: none; background: var(--input-bg); border-radius: 6px; padding: 8px; font-size: 15px; text-align: right; font-weight: 600; outline: none; box-shadow: none;">
        <button class="btn-icon" onclick="mkRemove(${i})" style="padding: 8px; margin: 0; background: transparent; color: var(--text-muted);">
            <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>`;
    });
    document.getElementById("mk-total").innerText = "$" + total;
}
function saveInvoice() { localStorage.setItem("mk_items", JSON.stringify(mkItems)); }
function previewInvoice() {
    let total = mkItems.reduce((sum, item) => sum + item.price, 0);
    let modalHtml = `
    <div id="invoice-modal" class="modal-overlay">
        <div class="modal">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
                <h2 style="margin: 0; font-size: 20px;">Invoice Summary</h2>
                <button class="btn-icon" onclick="document.getElementById('invoice-modal').remove()">
                    <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
            </div>
            <div style="background: var(--input-bg); border-radius: var(--radius-md); padding: 16px; margin-bottom: 24px;">
                <div style="color: var(--text-muted); font-size: 12px; font-weight: 600; text-transform: uppercase; margin-bottom: 4px;">Billed To</div>
                <div style="color: var(--text-main); font-weight: 600; font-size: 16px;">${mkClient || 'Not specified'}</div>
            </div>
            <div style="max-height: 200px; overflow-y: auto; margin-bottom: 16px;">
                ${mkItems.map(item => `
                    <div style="display: flex; justify-content: space-between; margin-bottom: 16px; font-size: 15px;">
                        <span style="color: var(--text-muted);">${item.name}</span>
                        <span style="font-weight: 500;">$${item.price}</span>
                    </div>
                `).join("")}
            </div>
            <div style="border-top: 1px solid var(--border-color); padding-top: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; font-weight: bold; font-size: 18px;">
                <span>Total Due</span>
                <span style="color: var(--primary);">$${total}</span>
            </div>
            <button class="btn-secondary" style="width: 100%; padding: 14px 24px; font-size: 15px; font-weight: 600;" onclick="downloadInvoice()">
                <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                Download PDF
            </button>
        </div>
    </div>`;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}
function downloadInvoice() { document.getElementById('invoice-modal').remove(); if(window.showToast) showToast("Invoice generated"); }

// --- CALCULATOR FUNCTIONS ---
function getCalculatorUI() {
    return `
    <div style="margin-bottom: 24px; display: flex; align-items: center; gap: 12px;">
        <div style="width: 40px; height: 40px; background: var(--primary-light); color: var(--primary); border-radius: 12px; display: flex; align-items: center; justify-content: center;">
            <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><line x1="8" y1="6" x2="16" y2="6"></line><line x1="16" y1="14" x2="16" y2="14.01"></line><line x1="12" y1="14" x2="12" y2="14.01"></line><line x1="8" y1="14" x2="8" y2="14.01"></line><line x1="16" y1="10" x2="16" y2="10.01"></line><line x1="12" y1="10" x2="12" y2="10.01"></line><line x1="8" y1="10" x2="8" y2="10.01"></line><line x1="16" y1="18" x2="16" y2="18.01"></line><line x1="12" y1="18" x2="12" y2="18.01"></line><line x1="8" y1="18" x2="8" y2="18.01"></line></svg>
        </div>
        <h2 style="margin: 0; font-size: 24px;">Calculator</h2>
    </div>
    <div style="background: var(--card-bg); border-radius: var(--radius-lg); padding: 24px; box-shadow: var(--shadow-md); border: 1px solid var(--border-color);">
      <div style="margin-bottom: 24px; background: var(--input-bg); border-radius: var(--radius-md); padding: 16px;">
        <div id="history" style="height: 60px; font-size: 14px; color: var(--text-muted); text-align: right; display: flex; flex-direction: column; justify-content: flex-end; padding-bottom: 8px; overflow: hidden; opacity: 0.7;"></div>
        <input id="calc" readonly value="0" style="font-size: 40px; font-weight: 700; text-align: right; border: none; background: transparent; padding: 0; height: 50px; outline: none; box-shadow: none; color: var(--text-main);">
      </div>
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 16px;">
        ${["7", "8", "9", "/", "4", "5", "6", "*", "1", "2", "3", "-", "0", ".", "=", "+"].map(b => {
                let bg = "var(--input-bg)"; let color = "var(--text-main)";
                if (["/", "*", "-", "+"].includes(b)) { bg = "var(--primary-light)"; color = "var(--primary)"; } 
                else if (b === "=") { bg = "var(--primary)"; color = "white"; }
                return `<button onclick="press('${b}')" style="background: ${bg}; color: ${color}; font-size: 20px; font-weight: 600; padding: 18px 0; border-radius: var(--radius-md); border: 1px solid rgba(0,0,0,0.02); box-shadow: var(--shadow-sm);">${b}</button>`;
            }).join("")}
      </div>
      <button onclick="clearCalc()" style="width: 100%; background: transparent; border: 1px dashed #ef4444; color: #ef4444; box-shadow: none; padding: 18px; font-size: 18px; font-weight: 600;">
        Clear
      </button>
    </div>
  `;
}
function initCalculator() { calcValue = ""; calcHistory = []; updateCalc(); }
function press(v) {
    if (v === "=") {
        try {
            let expr = calcValue.replace(/x/g, '*');
            let res = Function("return " + expr)();
            calcHistory.unshift(calcValue + " = " + res);
            calcValue = res + "";
        } catch { calcValue = ""; }
    } else {
        if (calcValue === "Error" || calcValue === "0") calcValue = "";
        calcValue += v;
    }
    updateCalc(); renderHistory();
}
function updateCalc() { let el = document.getElementById("calc"); if (el) el.value = calcValue || "0"; }
function clearCalc() { calcValue = ""; updateCalc(); }
function renderHistory() {
    let el = document.getElementById("history"); if (!el) return;
    el.innerHTML = calcHistory.slice(0, 3).map(h => `<div>${h}</div>`).reverse().join("");
}

document.addEventListener("keydown", e => {
    if (!document.getElementById("calc") || document.activeElement.tagName === "INPUT" || document.activeElement.tagName === "TEXTAREA") return;
    if ("0123456789+-*/.".includes(e.key)) press(e.key);
    if (e.key === "Enter") { e.preventDefault(); press("="); }
    if (e.key === "Backspace" || e.key === "Escape") clearCalc();
});

// START
render();
