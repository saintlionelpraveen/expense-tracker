// Get DOM elements
const transactionForm = document.getElementById('transactionForm');
const descriptionInput = document.getElementById('description');
const amountInput = document.getElementById('amount');
const categorySelect = document.getElementById('category');
const transactionsList = document.getElementById('transactionsList');
const totalBalanceEl = document.getElementById('totalBalance');
const totalIncomeEl = document.getElementById('totalIncome');
const totalExpenseEl = document.getElementById('totalExpense');
const clearAllBtn = document.getElementById('clearAll');

// Transactions array
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    displayTransactions();
    updateSummary();
});

// Handle form submission
transactionForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const description = descriptionInput.value.trim();
    const amount = parseFloat(amountInput.value);
    const category = categorySelect.value;
    const type = document.querySelector('input[name="type"]:checked').value;
    
    if (!description || !amount || !category) {
        return;
    }
    
    // Create transaction object
    const transaction = {
        id: Date.now(),
        description,
        amount,
        category,
        type,
        date: new Date().toISOString()
    };
    
    // Add to transactions array
    transactions.unshift(transaction);
    
    // Save to localStorage
    saveToLocalStorage();
    
    // Update UI
    displayTransactions();
    updateSummary();
    
    // Reset form
    transactionForm.reset();
    
    // Add success animation
    const submitBtn = transactionForm.querySelector('.btn-primary');
    submitBtn.textContent = '✓ Added!';
    setTimeout(() => {
        submitBtn.textContent = 'Add Transaction';
    }, 1500);
});

// Display transactions
function displayTransactions() {
    if (transactions.length === 0) {
        transactionsList.innerHTML = `
            <div class="empty-state">
                <p>No transactions yet</p>
                <span>Start by adding your first transaction!</span>
            </div>
        `;
        return;
    }
    
    transactionsList.innerHTML = transactions.map(transaction => {
        const sign = transaction.type === 'income' ? '+' : '-';
        const categoryEmoji = getCategoryEmoji(transaction.category);
        
        return `
            <div class="transaction-item ${transaction.type}" data-id="${transaction.id}">
                <div class="transaction-info">
                    <div class="transaction-description">${categoryEmoji} ${transaction.description}</div>
                    <div class="transaction-category">${formatCategory(transaction.category)} • ${formatDate(transaction.date)}</div>
                </div>
                <div class="transaction-amount ${transaction.type}">
                    ${sign}₹${transaction.amount.toFixed(2)}
                </div>
                <button class="btn-delete" onclick="deleteTransaction(${transaction.id})">Delete</button>
            </div>
        `;
    }).join('');
}

// Update summary
function updateSummary() {
    const income = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const expense = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const balance = income - expense;
    
    totalBalanceEl.textContent = `₹${balance.toFixed(2)}`;
    totalIncomeEl.textContent = `₹${income.toFixed(2)}`;
    totalExpenseEl.textContent = `₹${expense.toFixed(2)}`;
    
    // Add color to balance based on positive/negative
    if (balance >= 0) {
        totalBalanceEl.style.color = '#43e97b';
    } else {
        totalBalanceEl.style.color = '#f5576c';
    }
}

// Delete transaction
function deleteTransaction(id) {
    transactions = transactions.filter(t => t.id !== id);
    saveToLocalStorage();
    displayTransactions();
    updateSummary();
}

// Clear all transactions
clearAllBtn.addEventListener('click', () => {
    if (transactions.length === 0) return;
    
    if (confirm('Are you sure you want to delete all transactions?')) {
        transactions = [];
        saveToLocalStorage();
        displayTransactions();
        updateSummary();
    }
});

// Save to localStorage
function saveToLocalStorage() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
}

// Get category emoji
function getCategoryEmoji(category) {
    const emojis = {
        food: '🍔',
        transport: '🚗',
        entertainment: '🎮',
        shopping: '🛍️',
        bills: '💳',
        health: '⚕️',
        salary: '💼',
        other: '📦'
    };
    return emojis[category] || '📦';
}

// Format category
function formatCategory(category) {
    return category.charAt(0).toUpperCase() + category.slice(1);
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
        return 'Today';
    } else if (diffDays === 1) {
        return 'Yesterday';
    } else if (diffDays < 7) {
        return `${diffDays} days ago`;
    } else {
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
        });
    }
}

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Alt + N to focus on description input
    if (e.altKey && e.key === 'n') {
        e.preventDefault();
        descriptionInput.focus();
    }
    
    // Alt + C to clear all (with confirmation)
    if (e.altKey && e.key === 'c') {
        e.preventDefault();
        clearAllBtn.click();
    }
});

// Add visual feedback for form inputs
[descriptionInput, amountInput, categorySelect].forEach(input => {
    input.addEventListener('focus', function() {
        this.parentElement.style.transform = 'scale(1.02)';
    });
    
    input.addEventListener('blur', function() {
        this.parentElement.style.transform = 'scale(1)';
    });
});
