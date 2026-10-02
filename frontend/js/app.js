//comments were added by AI and code enhanced by AI
const API_URL = "http://localhost:3000/api/expenses";

// =========================
// HTML ELEMENTS
// =========================

const loading = document.getElementById("loading");
const errorAlert = document.getElementById("errorAlert");

const tableBody = document.getElementById("expensesTableBody");

const totalAmount = document.getElementById("totalAmount");
const expenseCount = document.getElementById("expenseCount");
const highestExpense = document.getElementById("highestExpense");

const expenseForm = document.getElementById("expenseForm");

const categoryFilter = document.getElementById("categoryFilter");
const searchInput = document.getElementById("searchInput");

const darkModeToggle = document.getElementById("darkModeToggle");
const exportCsvButton = document.getElementById("exportCsv");

const editForm = document.getElementById("editForm");
const editId = document.getElementById("editId");
const editTitle = document.getElementById("editTitle");
const editAmount = document.getElementById("editAmount");
const editCategory = document.getElementById("editCategory");
const editDate = document.getElementById("editDate");

// =========================
// VARIABLES
// =========================

let expenses = [];

let currentSort = {
  field: null,
  direction: "asc",
};

let categoryChart = null;

// =========================
// GET EXPENSES
// =========================

async function getExpenses() {
  try {
    loading.classList.remove("d-none");
    errorAlert.classList.add("d-none");

    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error("Failed to load expenses.");
    }

    expenses = await response.json();

    displayExpenses();
    updateSummary();
    updateChart();
  } catch (error) {
    console.error(error);

    showError(error.message);
  } finally {
    loading.classList.add("d-none");
  }
}

// =========================
// DISPLAY EXPENSES
// =========================

function displayExpenses() {
  tableBody.innerHTML = "";

  let filteredExpenses = [...expenses];

  // -------------------------
  // CATEGORY FILTER
  // -------------------------

  const selectedCategory = categoryFilter.value;

  if (selectedCategory !== "All") {
    filteredExpenses = filteredExpenses.filter(
      (expense) => expense.category === selectedCategory,
    );
  }

  // -------------------------
  // SEARCH
  // -------------------------

  const searchText = searchInput.value.trim().toLowerCase();

  if (searchText !== "") {
    filteredExpenses = filteredExpenses.filter((expense) =>
      expense.title.toLowerCase().includes(searchText),
    );
  }

  // -------------------------
  // SORT
  // -------------------------

  if (currentSort.field) {
    filteredExpenses.sort((a, b) => {
      let valueA = a[currentSort.field];
      let valueB = b[currentSort.field];

      if (currentSort.field === "amount") {
        valueA = Number(valueA);
        valueB = Number(valueB);
      } else {
        valueA = String(valueA).toLowerCase();
        valueB = String(valueB).toLowerCase();
      }

      if (valueA < valueB) {
        return currentSort.direction === "asc" ? -1 : 1;
      }

      if (valueA > valueB) {
        return currentSort.direction === "asc" ? 1 : -1;
      }

      return 0;
    });
  }

  // -------------------------
  // NO EXPENSES
  // -------------------------

  if (filteredExpenses.length === 0) {
    tableBody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center">
                    No expenses found.
                </td>
            </tr>
        `;

    return;
  }

  // -------------------------
  // CREATE TABLE ROWS
  // -------------------------

  filteredExpenses.forEach((expense) => {
    const row = document.createElement("tr");

    row.innerHTML = `
            <td>${expense.title}</td>

            <td>
                $${Number(expense.amount).toFixed(2)}
            </td>

            <td>
                <span class="badge bg-secondary">
                    ${expense.category}
                </span>
            </td>

            <td>${expense.date}</td>

            <td>
                <button
                    class="btn btn-sm btn-primary me-1"
                    onclick="openEditModal(${expense.id})">
                    Edit
                </button>

                <button
                    class="btn btn-sm btn-danger"
                    onclick="deleteExpense(${expense.id})">
                    Delete
                </button>
            </td>
        `;

    tableBody.appendChild(row);
  });
}

// =========================
// UPDATE SUMMARY
// =========================

function updateSummary() {
  expenseCount.textContent = expenses.length;

  if (expenses.length === 0) {
    totalAmount.textContent = "$0.00";
    highestExpense.textContent = "$0.00";

    return;
  }

  // Total

  const total = expenses.reduce(
    (sum, expense) => sum + Number(expense.amount),
    0,
  );

  // Highest

  const highest = Math.max(
    ...expenses.map((expense) => Number(expense.amount)),
  );

  totalAmount.textContent = `$${total.toFixed(2)}`;

  highestExpense.textContent = `$${highest.toFixed(2)}`;
}

// =========================
// ADD EXPENSE
// =========================

expenseForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  const title = document.getElementById("title").value.trim();

  const amount = Number(document.getElementById("amount").value);

  const category = document.getElementById("category").value;

  const date = document.getElementById("date").value;

  // Basic validation

  if (!title || amount <= 0 || !category || !date) {
    showError("Please fill in all fields correctly.");

    return;
  }

  try {
    const response = await fetch(API_URL, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        title: title,
        amount: amount,
        category: category,
        date: date,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();

      throw new Error(errorData.message || "Failed to add expense.");
    }

    // Clear form

    expenseForm.reset();

    // Get updated data

    await getExpenses();
  } catch (error) {
    console.error(error);

    showError(error.message);
  }
});

// =========================
// OPEN EDIT MODAL
// =========================

function openEditModal(id) {
  const expense = expenses.find((expense) => expense.id === id);

  if (!expense) {
    return;
  }

  editId.value = expense.id;

  editTitle.value = expense.title;

  editAmount.value = expense.amount;

  editCategory.value = expense.category;

  editDate.value = expense.date;

  const modalElement = document.getElementById("editModal");

  const modal = bootstrap.Modal.getOrCreateInstance(modalElement);

  modal.show();
}

// =========================
// UPDATE EXPENSE
// =========================

editForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  const id = editId.value;

  const title = editTitle.value.trim();

  const amount = Number(editAmount.value);

  const category = editCategory.value;

  const date = editDate.value;

  if (!title || amount <= 0 || !category || !date) {
    showError("Please fill in all fields correctly.");

    return;
  }

  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "PUT",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        title: title,
        amount: amount,
        category: category,
        date: date,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();

      throw new Error(errorData.message || "Failed to update expense.");
    }

    // Close modal

    const modalElement = document.getElementById("editModal");

    const modal = bootstrap.Modal.getOrCreateInstance(modalElement);

    modal.hide();

    // Refresh data

    await getExpenses();
  } catch (error) {
    console.error(error);

    showError(error.message);
  }
});

// =========================
// DELETE EXPENSE
// =========================

let expenseIdToDelete = null;

function deleteExpense(id) {
    expenseIdToDelete = id;

    const modalElement = document.getElementById("deleteModal");
    const modal = bootstrap.Modal.getOrCreateInstance(modalElement);
    modal.show();
}

document.getElementById("confirmDeleteBtn").addEventListener("click", async function () {

    const modalElement = document.getElementById("deleteModal");
    const modal = bootstrap.Modal.getOrCreateInstance(modalElement);
    modal.hide();

    try {
        const response = await fetch(`${API_URL}/${expenseIdToDelete}`, {
            method: "DELETE"
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Failed to delete expense.");
        }

        await getExpenses();

    } catch (error) {
        console.error(error);
        showError(error.message);
    }
});

// =========================
// CATEGORY FILTER
// =========================

categoryFilter.addEventListener("change", function () {
  displayExpenses();
});

// =========================
// SEARCH
// =========================

searchInput.addEventListener("input", function () {
  displayExpenses();
});

// =========================
// SORTING
// =========================

document.querySelectorAll("[data-sort]").forEach((header) => {
  header.addEventListener("click", function () {
    const field = header.dataset.sort;

    if (currentSort.field === field) {
      currentSort.direction = currentSort.direction === "asc" ? "desc" : "asc";
    } else {
      currentSort.field = field;
      currentSort.direction = "asc";
    }

    displayExpenses();
  });
});

// =========================
// DARK MODE
// =========================

darkModeToggle.addEventListener("click", function () {
  document.body.classList.toggle("dark-mode");

  if (document.body.classList.contains("dark-mode")) {
    darkModeToggle.textContent = "Light mode";
  } else {
    darkModeToggle.textContent = "Dark mode";
  }
});

// =========================
// CHART
// =========================

function updateChart() {
  const categoryTotals = {};

  expenses.forEach((expense) => {
    const category = expense.category;

    const amount = Number(expense.amount);

    if (!categoryTotals[category]) {
      categoryTotals[category] = 0;
    }

    categoryTotals[category] += amount;
  });

  const labels = Object.keys(categoryTotals);

  const data = Object.values(categoryTotals);

  const canvas = document.getElementById("categoryChart");

  if (categoryChart) {
    categoryChart.destroy();
  }

  categoryChart = new Chart(canvas, {
    type: "bar",

    data: {
      labels: labels,

      datasets: [
        {
          label: "Expenses",

          data: data,
        },
      ],
    },

    options: {
      responsive: true,

      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });
}

// =========================
// EXPORT CSV
// =========================

exportCsvButton.addEventListener("click", function () {
  if (expenses.length === 0) {
    showError("There are no expenses to export.");

    return;
  }

  let csv = "ID,Title,Amount,Category,Date\n";

  expenses.forEach((expense) => {
    csv += `${expense.id},"${expense.title}",${expense.amount},"${expense.category}",${expense.date}\n`;
  });

  const blob = new Blob([csv], { type: "text/csv" });

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");

  link.href = url;

  link.download = "expenses.csv";

  link.click();

  URL.revokeObjectURL(url);
});

// =========================
// ERROR MESSAGE
// =========================

function showError(message) {
  errorAlert.textContent = message;

  errorAlert.classList.remove("d-none");
}

// =========================
// START APPLICATION
// =========================

getExpenses();
