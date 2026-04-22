let notes = localStorage.getItem("notes") || "";
let saveTimeout;

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
        
        // Show saving...
        if(indicator) {
            indicator.textContent = "Saving...";
            indicator.style.opacity = "1";
        }
        
        clearTimeout(saveTimeout);
        saveTimeout = setTimeout(() => {
            if(indicator) {
                indicator.textContent = "Saved";
                setTimeout(() => {
                    indicator.style.opacity = "0";
                }, 2000);
            }
        }, 1000);
    });
    
    setTimeout(() => el.focus(), 100);
}