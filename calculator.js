let calcValue = "";
let history = [];

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
        ${["7", "8", "9", "/",
            "4", "5", "6", "*",
            "1", "2", "3", "-",
            "0", ".", "=", "+"]
            .map(b => {
                let bg = "var(--input-bg)";
                let color = "var(--text-main)";
                if (["/", "*", "-", "+"].includes(b)) {
                    bg = "var(--primary-light)";
                    color = "var(--primary)";
                } else if (b === "=") {
                    bg = "var(--primary)";
                    color = "white";
                }
                
                return `<button onclick="press('${b}')" style="background: ${bg}; color: ${color}; font-size: 20px; font-weight: 600; padding: 18px 0; border-radius: var(--radius-md); border: 1px solid rgba(0,0,0,0.02); box-shadow: var(--shadow-sm);">${b}</button>`;
            }).join("")}
      </div>

      <button onclick="clearCalc()" style="width: 100%; background: transparent; border: 1px dashed #ef4444; color: #ef4444; box-shadow: none; padding: 18px; font-size: 18px; font-weight: 600;">
        Clear
      </button>
    </div>
  `;
}

function initCalculator() {
    calcValue = "";
    history = [];
    updateCalc();
}

function press(v) {
    if (v === "=") {
        try {
            let expr = calcValue.replace(/x/g, '*');
            let res = Function("return " + expr)();
            history.unshift(calcValue + " = " + res);
            calcValue = res + "";
        } catch {
            calcValue = "";
        }
    } else {
        if (calcValue === "Error" || calcValue === "0") calcValue = "";
        calcValue += v;
    }

    updateCalc();
    renderHistory();
}

function updateCalc() {
    let el = document.getElementById("calc");
    if (el) el.value = calcValue || "0";
}

function clearCalc() {
    calcValue = "";
    updateCalc();
}

function renderHistory() {
    let el = document.getElementById("history");
    if (!el) return;

    el.innerHTML = history.slice(0, 3).map(h => `<div>${h}</div>`).reverse().join("");
}

document.addEventListener("keydown", e => {
    if (!document.getElementById("calc") || document.activeElement.tagName === "INPUT" || document.activeElement.tagName === "TEXTAREA") return;

    if ("0123456789+-*/.".includes(e.key)) press(e.key);
    if (e.key === "Enter") {
        e.preventDefault();
        press("=");
    }
    if (e.key === "Backspace" || e.key === "Escape") clearCalc();
});