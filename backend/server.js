// server.js
// Entry point of the backend: creates the app, adds middleware,
// connects the routes, and starts listening for requests.

const express = require("express");
const cors = require("cors");
require("dotenv").config(); // loads the values from .env into process.env
const expensesRouter = require("./routes/expensesRoutes");

const app = express();
const PORT = 3000;

// Middleware runs on every request, in order, before it reaches a route.
// Because of that, these two lines must stay above the router line.

// Allows the front-end (a different origin, like Live Server) to call this API.
app.use(cors());

// Reads JSON request bodies and puts them in req.body (needed for POST and PUT).
app.use(express.json());

// Every route inside expensesRouter is mounted under /api/expenses.
// For example, router.get("/:id") becomes GET /api/expenses/:id.
app.use("/api/expenses", expensesRouter);

// Starts the server. Stop and restart it after changing any backend file.
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});