let currentTab = "home";

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
    
    // Update active state in nav
    document.querySelectorAll(".nav-buttons button").forEach(btn => {
        btn.classList.remove("active");
    });
    
    // Find the button that calls switchTab with the current tab
    const activeBtn = Array.from(document.querySelectorAll(".nav-buttons button")).find(btn => btn.getAttribute("onclick").includes(`'${tab}'`));
    if(activeBtn) activeBtn.classList.add("active");

    render();
}

function render() {
    const el = document.getElementById("content");

    if (currentTab === "home") {
        // Read data for Dashboard
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

    if (t === "invoice") {
        el.innerHTML = getInvoiceUI();
        initInvoice();
    }

    if (t === "calc") {
        el.innerHTML = getCalculatorUI();
        initCalculator();
    }
    
    setTimeout(() => {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
}

render();