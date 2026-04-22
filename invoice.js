let mkItems = JSON.parse(localStorage.getItem("mk_items") || "[]");
let mkClient = localStorage.getItem("mk_client") || "";

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

function initInvoice() {
    renderInvoice();
}

function saveClient(val) {
    mkClient = val;
    localStorage.setItem("mk_client", mkClient);
}

function mkAdd() {
    mkItems.push({ name: "New Service", price: 0 });
    saveInvoice();
    renderInvoice();
}

function mkRemove(i) {
    mkItems.splice(i, 1);
    saveInvoice();
    renderInvoice();
}

function mkUpdateName(i, val) {
    mkItems[i].name = val;
    saveInvoice();
}

function mkUpdatePrice(i, val) {
    mkItems[i].price = parseFloat(val) || 0;
    saveInvoice();
    renderInvoice();
}

function renderInvoice() {
    let el = document.getElementById("mk-items");
    let total = 0;

    el.innerHTML = "";

    mkItems.forEach((item, i) => {
        total += item.price;

        el.innerHTML += `
      <div style="background: var(--card-bg); border-radius: var(--radius-lg); padding: 16px; margin-bottom: 16px; box-shadow: var(--shadow-sm); border: 1px solid var(--border-color); display: flex; align-items: center; gap: 12px;">
        <input value="${item.name}" oninput="mkUpdateName(${i},this.value)" style="flex:1; border: none; background: transparent; padding: 4px; font-size: 15px; font-weight: 500; outline: none; box-shadow: none;">
        <input type="number" value="${item.price}" oninput="mkUpdatePrice(${i},this.value)" style="width: 80px; border: none; background: var(--input-bg); border-radius: 6px; padding: 8px; font-size: 15px; text-align: right; font-weight: 600; outline: none; box-shadow: none;">
        <button class="btn-icon" onclick="mkRemove(${i})" style="padding: 8px; margin: 0; background: transparent; color: var(--text-muted);">
            <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>
    `;
    });

    document.getElementById("mk-total").innerText = "$" + total;
}

function saveInvoice() {
    localStorage.setItem("mk_items", JSON.stringify(mkItems));
}

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
    </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

function downloadInvoice() {
    document.getElementById('invoice-modal').remove();
    if(window.showToast) showToast("Invoice generated");
}