//comments were added by AI code was written by me 
// some code enhancements been added by AI without effecting the code written by me
// the enhancements are the code shape and sql query written in better way

// controllers/expensesController.js
// Contains the logic for every /api/expenses route: validation, SQL, and responses.
// The routes file decides which URL calls which function; this file does the work.

const pool = require("../db");

// ---------------------------------------------------------------
// Constants
// ---------------------------------------------------------------

// Columns returned to the client. TO_CHAR formats the date as YYYY-MM-DD
// so pg does not hand us a JavaScript Date object (which can shift by a day).
const SELECT_COLUMNS =
  "id, title, amount, category, TO_CHAR(date, 'YYYY-MM-DD') AS date";

// The only categories the API accepts.
const ALLOWED_CATEGORIES = [
  "Food",
  "Transport",
  "Bills",
  "Entertainment",
  "Other",
];

// ---------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------

// Sends a generic 500 response and logs the real error in the terminal.
// Used in every catch block, because a caught error is always unexpected.
const sendServerError = (res, error) => {
  console.error(error);
  res.status(500).json({ message: "Server error" });
};

// An id is valid only if it is a whole number greater than 0.
// This runs before the query so Postgres never receives text like "abc".
const isValidId = (id) => Number.isInteger(id) && id > 0;

// pg returns NUMERIC columns as strings (for example "4.50").
// This converts amount to a real number before sending it to the client.
const formatRow = (row) => ({ ...row, amount: Number(row.amount) });

// Checks the body of a POST or PUT request.
// Returns an error message string if something is wrong, or null if all is fine.
// It only answers; the controller decides to return the 400 response,
// so the return statement actually stops the controller function.
const validateExpense = ({ title, amount, category, date } = {}) => {
  if (typeof title !== "string" || title.trim() === "") {
    return "Title is required";
  }

  const amountNumber = Number(amount);
  if (Number.isNaN(amountNumber) || amountNumber <= 0) {
    return "Amount must be a number greater than 0";
  }

  if (!ALLOWED_CATEGORIES.includes(category)) {
    return "Category must be one of: Food, Transport, Bills, Entertainment, Other";
  }

  // The date must be present and written as YYYY-MM-DD.
  if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return "Date is required and must be in YYYY-MM-DD format";
  }

  return null;
};

// ---------------------------------------------------------------
// GET /api/expenses
// Returns all expenses, newest first.
// ---------------------------------------------------------------
const getExpenses = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT ${SELECT_COLUMNS} FROM expenses ORDER BY date DESC, id DESC`,
    );
    res.json(result.rows.map(formatRow));
  } catch (error) {
    sendServerError(res, error);
  }
};

// ---------------------------------------------------------------
// GET /api/expenses/:id
// Returns one expense, or 404 if the id is invalid or does not exist.
// ---------------------------------------------------------------
const getExpensesById = async (req, res) => {
  const id = Number(req.params.id);

  // Reject bad ids before touching the database.
  if (!isValidId(id)) {
    return res.status(404).json({ message: "Expense not found" });
  }

  try {
    const result = await pool.query(
      `SELECT ${SELECT_COLUMNS} FROM expenses WHERE id = $1`,
      [id],
    );

    // The query worked but no row matched this id.
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Expense not found" });
    }

    res.json(formatRow(result.rows[0]));
  } catch (error) {
    sendServerError(res, error);
  }
};

// ---------------------------------------------------------------
// POST /api/expenses
// Validates the body, inserts a new row, and returns it with status 201.
// ---------------------------------------------------------------
const createExpense = async (req, res) => {
  // req.body can be undefined if the client sent no JSON, so fall back to {}.
  const body = req.body || {};

  const error = validateExpense(body);
  if (error) {
    return res.status(400).json({ message: error });
  }

  const { title, amount, category, date } = body;

  try {
    // Values go in as $1..$4 so user input is never joined into the SQL text.
    // RETURNING sends back the saved row, including the id created by the database.
    const result = await pool.query(
      `INSERT INTO expenses (title, amount, category, date)
       VALUES ($1, $2, $3, $4)
       RETURNING ${SELECT_COLUMNS}`,
      [title.trim(), Number(amount), category, date],
    );

    res.status(201).json(formatRow(result.rows[0]));
  } catch (error) {
    sendServerError(res, error);
  }
};

// ---------------------------------------------------------------
// PUT /api/expenses/:id
// Validates the id and the body, updates the row, and returns it.
// Returns 404 if no row has this id.
// ---------------------------------------------------------------
const updateExpense = async (req, res) => {
  const id = Number(req.params.id);

  // A bad id is a 404 no matter what the body contains, so check it first.
  if (!isValidId(id)) {
    return res.status(404).json({ message: "Expense not found" });
  }

  const body = req.body || {};

  const error = validateExpense(body);
  if (error) {
    return res.status(400).json({ message: error });
  }

  const { title, amount, category, date } = body;

  try {
    // The order of the array must match the $ numbers: $1 is title, $5 is id.
    const result = await pool.query(
      `UPDATE expenses
       SET title = $1, amount = $2, category = $3, date = $4
       WHERE id = $5
       RETURNING ${SELECT_COLUMNS}`,
      [title.trim(), Number(amount), category, date, id],
    );

    // UPDATE on a missing id succeeds but changes nothing, so check the result.
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Expense not found" });
    }

    res.json(formatRow(result.rows[0]));
  } catch (error) {
    sendServerError(res, error);
  }
};

// ---------------------------------------------------------------
// DELETE /api/expenses/:id
// Deletes one expense, or returns 404 if the id is invalid or does not exist.
// ---------------------------------------------------------------
const deleteExpense = async (req, res) => {
  const id = Number(req.params.id);

  if (!isValidId(id)) {
    return res.status(404).json({ message: "Expense not found" });
  }

  try {
    // RETURNING id lets us tell whether a row was actually deleted.
    // A plain DELETE returns no rows either way.
    const result = await pool.query(
      "DELETE FROM expenses WHERE id = $1 RETURNING id",
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Expense not found" });
    }

    res.json({ message: "Expense deleted" });
  } catch (error) {
    sendServerError(res, error);
  }
};

module.exports = {
  getExpenses,
  getExpensesById,
  createExpense,
  updateExpense,
  deleteExpense,
};