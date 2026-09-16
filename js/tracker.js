/* ==========================================================================
   PERSONAL EXPENSE TRACKER (TERMINAL BUDGET ENGINE v1.0)
   Student: Dhruv Gupta (1st Year B.Tech CSE)
   Viva Explanation:
   This file implements the embedded mini-project using Vanilla JavaScript:
   1. In-Memory State: An array of transaction objects holding our records.
   2. LocalStorage API: Saves data in the browser's persistent key-value store.
   3. DOM Manipulation: Dynamically generates HTML list items based on data.
   4. Array Operations: Uses .reduce() for totals, .filter() for categories and deletion.
   5. Event Listeners: Handles form submission, clicks, and category toggles.
   ========================================================================== */

// Wrap in an Immediately Invoked Function Expression (IIFE) or DOMContentLoaded
// to avoid polluting global variable namespace.
document.addEventListener("DOMContentLoaded", function () {

  /* ------------------------------------------------------------------------
     1. DOM ELEMENT REFERENCES
     Viva Note: We cache document elements in const variables so we don't
     have to query the DOM multiple times, which improves runtime performance.
     ------------------------------------------------------------------------ */
  const balanceElement = document.getElementById("tracker-balance");
  const incomeElement = document.getElementById("tracker-income");
  const expenseElement = document.getElementById("tracker-expense");
  const transactionListElement = document.getElementById("tracker-list");
  const transactionForm = document.getElementById("tracker-form");
  const descriptionInput = document.getElementById("tracker-desc");
  const amountInput = document.getElementById("tracker-amount");
  const typeSelect = document.getElementById("tracker-type");
  const categorySelect = document.getElementById("tracker-category");
  const filterButtons = document.querySelectorAll(".filter-btn");
  const btnResetData = document.getElementById("tracker-reset-btn");
  const btnClearAll = document.getElementById("tracker-clear-btn");

  // LocalStorage Key Name
  const STORAGE_KEY = "dhruv_portfolio_tracker_v1";

  /* ------------------------------------------------------------------------
     2. DEFAULT SAMPLE DATA
     Viva Note: Pre-populates realistic student budget records if the user
     opens the website for the first time. Demonstrates immediate functionality
     to the viva examiner.
     ------------------------------------------------------------------------ */
  const defaultTransactions = [
    {
      id: 1700000001,
      text: "Monthly Student Allowance",
      amount: 6000,
      type: "income",
      category: "Allowance",
      date: "12 Sep 2026"
    },
    {
      id: 1700000002,
      text: "Data Structures & C++ Textbook",
      amount: 850,
      type: "expense",
      category: "College",
      date: "13 Sep 2026"
    },
    {
      id: 1700000003,
      text: "Hostel Canteen & Coffee",
      amount: 240,
      type: "expense",
      category: "Food",
      date: "14 Sep 2026"
    },
    {
      id: 1700000004,
      text: "Annual College Hackathon Pass",
      amount: 450,
      type: "expense",
      category: "Tech",
      date: "15 Sep 2026"
    },
    {
      id: 1700000005,
      text: "Freelance Bug Fix (HTML/JS)",
      amount: 1200,
      type: "income",
      category: "Allowance",
      date: "16 Sep 2026"
    }
  ];

  /* ------------------------------------------------------------------------
     3. APPLICATION STATE
     Viva Note: 'transactions' stores all records loaded from localStorage or defaults.
     'activeCategoryFilter' tracks which category button is currently highlighted.
     ------------------------------------------------------------------------ */
  let transactions = loadTransactionsFromStorage();
  let activeCategoryFilter = "All";

  /* ------------------------------------------------------------------------
     4. STORAGE FUNCTIONS (LOCALSTORAGE API)
     Viva Note:
     - localStorage.getItem(key): Reads stringified data from browser disk.
     - JSON.parse(str): Converts JSON string back into a usable JavaScript array.
     - JSON.stringify(obj): Serializes JavaScript objects into a JSON string for storage.
     ------------------------------------------------------------------------ */
  function loadTransactionsFromStorage() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error("Failed to parse localStorage data:", error);
    }
    // If no saved data, save and return default seed data
    saveTransactionsToStorage(defaultTransactions);
    return [...defaultTransactions];
  }

  function saveTransactionsToStorage(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error("Failed to save to localStorage:", error);
    }
  }

  /* ------------------------------------------------------------------------
     5. UTILITY FORMATTERS
     Viva Note: Currency formatting ensures amounts look professional (e.g. ₹1,200.00).
     ------------------------------------------------------------------------ */
  function formatCurrency(amount) {
    return "₹" + Number(amount).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  function getCurrentFormattedDate() {
    const options = { day: "numeric", month: "short", year: "numeric" };
    return new Date().toLocaleDateString("en-IN", options);
  }

  /* ------------------------------------------------------------------------
     6. CALCULATE & UPDATE SUMMARY METRICS
     Viva Note:
     - Uses JavaScript's Array.prototype.reduce() method.
     - .reduce((acc, curr) => ..., initialValue) iterates through all transactions,
       accumulating total income and total expenses in a single pass (O(N) time).
     ------------------------------------------------------------------------ */
  function updateSummaryMetrics() {
    // Calculate total income
    const totalIncome = transactions
      .filter(item => item.type === "income")
      .reduce((sum, item) => sum + item.amount, 0);

    // Calculate total expense
    const totalExpense = transactions
      .filter(item => item.type === "expense")
      .reduce((sum, item) => sum + item.amount, 0);

    // Net balance = Income - Expenses
    const netBalance = totalIncome - totalExpense;

    // Update DOM text contents
    incomeElement.textContent = `+${formatCurrency(totalIncome)}`;
    expenseElement.textContent = `-${formatCurrency(totalExpense)}`;

    // Set net balance with sign indicator
    if (netBalance >= 0) {
      balanceElement.textContent = formatCurrency(netBalance);
      balanceElement.style.color = "var(--accent-cyan)";
    } else {
      balanceElement.textContent = `-${formatCurrency(Math.abs(netBalance))}`;
      balanceElement.style.color = "var(--accent-red)";
    }
  }

  /* ------------------------------------------------------------------------
     7. RENDER TRANSACTIONS LIST
     Viva Note:
     - Applies active category filter if specified.
     - Clears the <ul> innerHTML and loops through records.
     - Injects list items with corresponding color-coded borders and delete buttons.
     ------------------------------------------------------------------------ */
  function renderTransactions() {
    // Filter by active category if not 'All'
    const displayedItems = activeCategoryFilter === "All"
      ? transactions
      : transactions.filter(t => t.category.toLowerCase() === activeCategoryFilter.toLowerCase());

    // Check for empty list state
    if (displayedItems.length === 0) {
      transactionListElement.innerHTML = `
        <li class="empty-state">
          <div class="empty-icon">[ ! ]</div>
          <p>No transactions found for filter: <strong>"${activeCategoryFilter}"</strong></p>
          <small>Add a transaction using the form on the left.</small>
        </li>
      `;
      updateSummaryMetrics();
      return;
    }

    // Build HTML string for items
    let listHTML = "";
    displayedItems.forEach(item => {
      const isIncome = item.type === "income";
      const sign = isIncome ? "+" : "-";
      const typeClass = isIncome ? "income" : "expense";

      listHTML += `
        <li class="transaction-item ${typeClass}" data-id="${item.id}">
          <div class="item-left">
            <span class="item-name">${escapeHTML(item.text)}</span>
            <div class="item-meta">
              <span class="item-category-tag">${escapeHTML(item.category)}</span>
              <span class="item-date">${item.date}</span>
            </div>
          </div>
          <div class="item-right">
            <span class="item-amount ${typeClass}">${sign}${formatCurrency(item.amount)}</span>
            <button class="btn-delete" title="Delete transaction" onclick="window.deleteTransaction(${item.id})">
              &times;
            </button>
          </div>
        </li>
      `;
    });

    transactionListElement.innerHTML = listHTML;
    updateSummaryMetrics();
  }

  /* ------------------------------------------------------------------------
     8. SECURITY HELPER: HTML SANITIZATION
     Viva Note: Escaping special characters (&, <, >, ", ') prevents Cross-Site
     Scripting (XSS) attacks when rendering user-submitted text inside innerHTML.
     ------------------------------------------------------------------------ */
  function escapeHTML(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  /* ------------------------------------------------------------------------
     9. ADD NEW TRANSACTION (FORM HANDLER)
     Viva Note:
     - e.preventDefault() stops standard browser HTTP form submission reload.
     - Validates that description is not blank and amount is > 0.
     - Date.now() produces a unique integer timestamp used as item ID.
     ------------------------------------------------------------------------ */
  transactionForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const text = descriptionInput.value.trim();
    const amountVal = parseFloat(amountInput.value);
    const type = typeSelect.value;
    const category = categorySelect.value;

    // Validation checks
    if (!text) {
      showToast("Error: Description cannot be empty!", "error");
      descriptionInput.focus();
      return;
    }

    if (isNaN(amountVal) || amountVal <= 0) {
      showToast("Error: Please enter a valid positive amount!", "error");
      amountInput.focus();
      return;
    }

    // Create new transaction object
    const newTransaction = {
      id: Date.now(), // Unique ID using current millisecond timestamp
      text: text,
      amount: amountVal,
      type: type,
      category: category,
      date: getCurrentFormattedDate()
    };

    // Prepend to top of array
    transactions.unshift(newTransaction);

    // Save to persistent storage and re-render
    saveTransactionsToStorage(transactions);
    renderTransactions();

    // Reset form inputs
    transactionForm.reset();

    // Show visual confirmation toast
    showToast(`Added: ${text} (${type === "income" ? "+" : "-"}${formatCurrency(amountVal)})`, "success");
  });

  /* ------------------------------------------------------------------------
     10. DELETE TRANSACTION
     Viva Note: Attached to window so the inline onclick="window.deleteTransaction(id)"
     can invoke it. Uses .filter() to retain all items except the targeted ID.
     ------------------------------------------------------------------------ */
  window.deleteTransaction = function (id) {
    const itemToDelete = transactions.find(t => t.id === id);
    transactions = transactions.filter(t => t.id !== id);
    saveTransactionsToStorage(transactions);
    renderTransactions();

    if (itemToDelete) {
      showToast(`Removed: "${itemToDelete.text}"`, "info");
    }
  };

  /* ------------------------------------------------------------------------
     11. CATEGORY FILTER LOGIC
     Viva Note: Clicking a category button updates the active filter state
     and triggers a fast DOM re-render showing only matching records.
     ------------------------------------------------------------------------ */
  filterButtons.forEach(button => {
    button.addEventListener("click", function () {
      filterButtons.forEach(btn => btn.classList.remove("active"));
      this.classList.add("active");
      activeCategoryFilter = this.getAttribute("data-filter");
      renderTransactions();
    });
  });

  /* ------------------------------------------------------------------------
     12. RESET & CLEAR ALL BUTTONS
     Viva Note: Provides examiners with the ability to reset to default sample
     data or wipe all entries to test blank state behavior.
     ------------------------------------------------------------------------ */
  if (btnResetData) {
    btnResetData.addEventListener("click", function () {
      transactions = [...defaultTransactions];
      saveTransactionsToStorage(transactions);
      renderTransactions();
      showToast("Restored initial student sample data.", "info");
    });
  }

  if (btnClearAll) {
    btnClearAll.addEventListener("click", function () {
      if (transactions.length === 0) {
        showToast("Ledger is already empty.", "info");
        return;
      }
      transactions = [];
      saveTransactionsToStorage(transactions);
      renderTransactions();
      showToast("All transaction entries cleared.", "info");
    });
  }

  // Initial render when the page loads
  renderTransactions();
});
