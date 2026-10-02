const express =  require("express");

const router = express.Router();

const {
    getExpenses,
    getExpensesById,
    createExpense,
    updateExpense,
    deleteExpense
} = require("../controllers/expensesController");

router.get("/", getExpenses);

router.get("/:id", getExpensesById);

router.post("/", createExpense);

router.put("/:id", updateExpense);

router.delete("/:id", deleteExpense);

module.exports = router;