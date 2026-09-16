/**
 * ==========================================================================
 * EMBEDDED MINI-PROJECT: STUDENT EXPENSE & BUDGET TRACKER
 * --------------------------------------------------------------------------
 * VIVA DEFENSE GUIDE & ARCHITECTURE OVERVIEW:
 * 1. State Management: We maintain an array of transaction objects in memory.
 * 2. Data Persistence (localStorage): Every change saves to the browser's
 *    built-in storage using JSON.stringify() and JSON.parse().
 * 3. DOM Manipulation: Dynamic creation of HTML elements using template literals.
 * 4. High-Order Array Methods: .reduce(), .filter(), .forEach(), .find().
 * ==========================================================================
 */

// Monthly Budget Limit for 1st-Year College Student (in INR)
const MONTHLY_BUDGET = 8000;

// Category Emoji & Icon Map for Clean Visuals
const CATEGORY_ICONS = {
  'food': '🍔',
  'education': '📚',
  'tech': '💻',
  'transport': '🚌',
  'entertainment': '🎮',
  'other': '📦'
};

// Current active filter ('all', 'income', 'expense')
let currentFilter = 'all';

// Current active transaction type ('expense' or 'income')
let selectedType = 'expense';

// State array holding all transaction items
let transactions = [];

/**
 * ==========================================================================
 * VIVA DEFENSE NOTE #10: Window Load & State Initialization
 * WHY WE USE THIS:
 * - When the page finishes loading, we retrieve any saved data from localStorage.
 * - JSON.parse converts the stored JSON string back into a real JavaScript array.
 * ==========================================================================
 */
document.addEventListener('DOMContentLoaded', () => {
  initTracker();
});

function initTracker() {
  // 1. Retrieve data from browser's localStorage
  const savedData = localStorage.getItem('dhruv_portfolio_expenses');

  if (savedData) {
    try {
      transactions = JSON.parse(savedData);
    } catch (err) {
      console.error('Failed to parse local storage data', err);
      transactions = [];
    }
  } else {
    // If first visit ever, pre-populate with starter sample so professor sees data right away!
    loadInitialDemoData();
  }

  // 2. Set default date input to today's date (YYYY-MM-DD)
  const dateInput = document.getElementById('tx-date');
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;
  }

  // 3. Attach Event Listeners
  setupTrackerEventListeners();

  // 4. Perform First Render of UI
  refreshUI();
}

/**
 * ==========================================================================
 * VIVA DEFENSE NOTE #11: localStorage Persistence
 * WHY WE USE THIS:
 * - localStorage stores strings only. Therefore, we use `JSON.stringify(transactions)`
 *   to convert our array of JavaScript objects into a JSON text string.
 * ==========================================================================
 */
function saveTransactions() {
  localStorage.setItem('dhruv_portfolio_expenses', JSON.stringify(transactions));
}

/**
 * Attaches all event listeners for the Expense Tracker component.
 */
function setupTrackerEventListeners() {
  // Type Toggle Buttons (Expense vs Income)
  const btnExpense = document.getElementById('btn-type-expense');
  const btnIncome = document.getElementById('btn-type-income');

  if (btnExpense && btnIncome) {
    btnExpense.addEventListener('click', () => {
      selectedType = 'expense';
      btnExpense.classList.add('active');
      btnIncome.classList.remove('active');
    });

    btnIncome.addEventListener('click', () => {
      selectedType = 'income';
      btnIncome.classList.add('active');
      btnExpense.classList.remove('active');
    });
  }

  // Transaction Form Submission
  const form = document.getElementById('tracker-form');
  if (form) {
    form.addEventListener('submit', handleAddTransaction);
  }

  // Demo Data & Clear Buttons
  const btnDemo = document.getElementById('btn-load-demo');
  if (btnDemo) {
    btnDemo.addEventListener('click', () => {
      loadInitialDemoData();
      refreshUI();
      showToast('Loaded student demo budget items!', 'success');
    });
  }

  const btnClear = document.getElementById('btn-clear-all');
  if (btnClear) {
    btnClear.addEventListener('click', () => {
      if (confirm('Are you sure you want to clear all transactions?')) {
        transactions = [];
        saveTransactions();
        refreshUI();
        showToast('All transactions cleared.', 'error');
      }
    });
  }

  // Ledger Filter Buttons
  const filterButtons = document.querySelectorAll('.filter-btn');
  filterButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      filterButtons.forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      currentFilter = e.target.getAttribute('data-filter') || 'all';
      renderTransactions();
    });
  });
}

/**
 * ==========================================================================
 * VIVA DEFENSE NOTE #12: Event Handling & Form Validation
 * WHY WE USE THIS:
 * - `e.preventDefault()` stops the default browser action of reloading the page
 *   on form submission, allowing our Single Page App (SPA) logic to handle it.
 * ==========================================================================
 */
function handleAddTransaction(e) {
  e.preventDefault();

  const descInput = document.getElementById('tx-desc');
  const amountInput = document.getElementById('tx-amount');
  const categorySelect = document.getElementById('tx-category');
  const dateInput = document.getElementById('tx-date');

  const desc = descInput.value.trim();
  const amount = parseFloat(amountInput.value);
  const category = categorySelect.value;
  const date = dateInput.value || new Date().toISOString().split('T')[0];

  // Validation Check: ensure valid description and positive numerical amount
  if (!desc) {
    alert('Please enter a description for the transaction.');
    descInput.focus();
    return;
  }

  if (isNaN(amount) || amount <= 0) {
    alert('Please enter a valid amount greater than 0.');
    amountInput.focus();
    return;
  }

  // Construct new transaction object
  // Date.now() provides a guaranteed unique ID based on millisecond timestamp
  const newTx = {
    id: 'tx_' + Date.now(),
    desc: desc,
    amount: amount,
    type: selectedType, // 'expense' or 'income'
    category: category,
    date: date
  };

  // Add to top of transactions array (LIFO: newest first)
  transactions.unshift(newTx);

  // Persist to localStorage
  saveTransactions();

  // Reset form inputs
  descInput.value = '';
  amountInput.value = '';
  descInput.focus();

  // Re-render UI
  refreshUI();
  showToast(`Added ${newTx.type}: "${newTx.desc}" (₹${newTx.amount.toLocaleString('en-IN')})`, 'success');
}

/**
 * Deletes a transaction by its unique ID.
 */
function deleteTransaction(id) {
  transactions = transactions.filter(item => item.id !== id);
  saveTransactions();
  refreshUI();
  showToast('Transaction removed', 'error');
}

/**
 * ==========================================================================
 * VIVA DEFENSE NOTE #13: Array.reduce() for Financial Calculation
 * WHY WE USE THIS:
 * - Instead of writing a manual `for` loop with accumulator variables,
 *   `.reduce()` cleanly sums up values in functional JavaScript.
 * ==========================================================================
 */
function updateSummaryCards() {
  // Calculate total income
  const totalIncome = transactions
    .filter(tx => tx.type === 'income')
    .reduce((sum, tx) => sum + tx.amount, 0);

  // Calculate total expenses
  const totalExpense = transactions
    .filter(tx => tx.type === 'expense')
    .reduce((sum, tx) => sum + tx.amount, 0);

  // Total Balance = Income - Expenses
  const netBalance = totalIncome - totalExpense;

  // Format currency with Indian numbering system (e.g. ₹10,000)
  const formatCurrency = (val) => '₹' + Math.abs(val).toLocaleString('en-IN', {
    maximumFractionDigits: 2
  });

  const balanceEl = document.getElementById('metric-balance');
  const incomeEl = document.getElementById('metric-income');
  const expenseEl = document.getElementById('metric-expense');

  if (balanceEl) {
    balanceEl.textContent = (netBalance < 0 ? '- ' : '') + formatCurrency(netBalance);
    balanceEl.style.color = netBalance < 0 ? 'var(--accent-rose)' : 'var(--text-primary)';
  }

  if (incomeEl) {
    incomeEl.textContent = '+ ' + formatCurrency(totalIncome);
  }

  if (expenseEl) {
    expenseEl.textContent = '- ' + formatCurrency(totalExpense);
  }

  // Update Budget Progress Bar
  updateBudgetProgressBar(totalExpense);
}

/**
 * Calculates budget consumption and updates the dynamic visual meter.
 */
function updateBudgetProgressBar(totalExpense) {
  const percent = Math.min(Math.round((totalExpense / MONTHLY_BUDGET) * 100), 100);
  
  const barEl = document.getElementById('budget-progress-bar');
  const percentEl = document.getElementById('budget-percent-text');
  const spentEl = document.getElementById('budget-spent-text');

  if (barEl) {
    barEl.style.width = `${percent}%`;

    // Dynamic color coding based on threshold
    barEl.classList.remove('warning', 'danger');
    if (percent >= 100) {
      barEl.classList.add('danger');
    } else if (percent >= 75) {
      barEl.classList.add('warning');
    }
  }

  if (percentEl) {
    percentEl.textContent = `${percent}% of monthly limit used`;
  }

  if (spentEl) {
    spentEl.textContent = `₹${totalExpense.toLocaleString('en-IN')} / ₹${MONTHLY_BUDGET.toLocaleString('en-IN')}`;
  }
}

/**
 * ==========================================================================
 * VIVA DEFENSE NOTE #14: Dynamic HTML Rendering with Template Literals
 * WHY WE USE THIS:
 * - We filter the array according to the user's active filter tab.
 * - We then map each transaction object to an HTML template string and
 *   join them into the container's `.innerHTML`.
 * ==========================================================================
 */
function renderTransactions() {
  const container = document.getElementById('transactions-list');
  const emptyState = document.getElementById('empty-ledger');

  if (!container) return;

  // Filter items based on current tab
  let filtered = transactions;
  if (currentFilter === 'income') {
    filtered = transactions.filter(tx => tx.type === 'income');
  } else if (currentFilter === 'expense') {
    filtered = transactions.filter(tx => tx.type === 'expense');
  }

  if (filtered.length === 0) {
    container.innerHTML = '';
    if (emptyState) emptyState.style.display = 'flex';
    return;
  }

  if (emptyState) emptyState.style.display = 'none';

  container.innerHTML = filtered.map(tx => {
    const isIncome = tx.type === 'income';
    const sign = isIncome ? '+' : '-';
    const amountClass = isIncome ? 'income' : 'expense';
    const icon = CATEGORY_ICONS[tx.category] || '📦';
    const formattedAmount = `${sign} ₹${tx.amount.toLocaleString('en-IN')}`;

    return `
      <li class="transaction-item" data-id="${tx.id}">
        <div class="item-left">
          <div class="item-category-icon" title="${tx.category}">${icon}</div>
          <div class="item-details">
            <span class="item-desc">${escapeHTML(tx.desc)}</span>
            <div class="item-meta">
              <span class="item-cat">${capitalize(tx.category)}</span>
              <span>•</span>
              <span class="item-date">${tx.date}</span>
            </div>
          </div>
        </div>
        <div class="item-right">
          <span class="item-amount ${amountClass}">${formattedAmount}</span>
          <button class="btn-delete" onclick="deleteTransaction('${tx.id}')" title="Delete transaction" aria-label="Delete">
            🗑️
          </button>
        </div>
      </li>
    `;
  }).join('');
}

/**
 * Calculates expense distribution across categories and renders visual bars.
 */
function renderCategoryAnalytics() {
  const container = document.getElementById('category-bars');
  if (!container) return;

  const expenses = transactions.filter(tx => tx.type === 'expense');
  const totalExpense = expenses.reduce((sum, tx) => sum + tx.amount, 0);

  if (totalExpense === 0) {
    container.innerHTML = `<div style="grid-column: 1/-1; color: var(--text-muted); font-size: 0.85rem;">No expenses logged yet. Add expenses to view category analytics.</div>`;
    return;
  }

  // Group by category
  const categories = ['food', 'education', 'tech', 'transport', 'entertainment', 'other'];
  
  const categoryTotals = categories.map(cat => {
    const sum = expenses
      .filter(tx => tx.category === cat)
      .reduce((acc, tx) => acc + tx.amount, 0);
    const percentage = Math.round((sum / totalExpense) * 100);
    return { category: cat, sum, percentage, icon: CATEGORY_ICONS[cat] };
  }).filter(item => item.sum > 0); // only show active categories

  container.innerHTML = categoryTotals.map(item => `
    <div class="cat-bar-item">
      <div class="cat-bar-header">
        <span>${item.icon} ${capitalize(item.category)}</span>
        <strong>₹${item.sum.toLocaleString('en-IN')} (${item.percentage}%)</strong>
      </div>
      <div class="cat-progress-track">
        <div class="cat-progress-fill" style="width: ${item.percentage}%;"></div>
      </div>
    </div>
  `).join('');
}

/**
 * Re-computes metrics, lists, and analytics in one clean call.
 */
function refreshUI() {
  updateSummaryCards();
  renderTransactions();
  renderCategoryAnalytics();
}

/**
 * Populates realistic college student demo expenses.
 */
function loadInitialDemoData() {
  const today = new Date().toISOString().split('T')[0];

  transactions = [
    {
      id: 'tx_demo_1',
      desc: 'Monthly College Allowance',
      amount: 6000,
      type: 'income',
      category: 'other',
      date: today
    },
    {
      id: 'tx_demo_2',
      desc: 'C++ & DSA Textbook',
      amount: 750,
      type: 'expense',
      category: 'education',
      date: today
    },
    {
      id: 'tx_demo_3',
      desc: 'Campus Canteen Lunch & Chai',
      amount: 140,
      type: 'expense',
      category: 'food',
      date: today
    },
    {
      id: 'tx_demo_4',
      desc: 'Hackathon 1st Runner Up Prize',
      amount: 2500,
      type: 'income',
      category: 'tech',
      date: today
    },
    {
      id: 'tx_demo_5',
      desc: 'Hostel High-Speed Wi-Fi Plan',
      amount: 499,
      type: 'expense',
      category: 'tech',
      date: today
    }
  ];

  saveTransactions();
}

/**
 * Helper: Escapes HTML strings to prevent XSS vulnerabilities in user inputs.
 */
function escapeHTML(str) {
  return str.replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  );
}

/**
 * Helper: Capitalizes the first letter of a string.
 */
function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}
