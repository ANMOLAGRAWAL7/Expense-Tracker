// public/main.js

document.addEventListener("DOMContentLoaded", () => {
    fetchExpenses();
});

async function fetchExpenses() {
    try {
        const response = await fetch("/fetchdata");
        const data = await response.json();
        renderExpenses(data);
    } catch (error) {
        console.error("Error fetching expenses:", error);
    }
}

function renderExpenses(expenses) {
    const expenseList = document.getElementById("addedexpenselist");
    expenseList.innerHTML = "";

    expenses.forEach(expense => {
        const row = document.createElement("tr");

        const expenseCell = document.createElement("td");
        expenseCell.classList.add("py-3", "px-1", "border-b", "border-gray-400");
        expenseCell.textContent = expense.amount >= 0 ? expense.amount : "";
        row.appendChild(expenseCell);

        const descriptionCell = document.createElement("td");
        descriptionCell.classList.add("py-3", "px-1", "border-b", "border-gray-400");
        descriptionCell.textContent = expense.description;
        row.appendChild(descriptionCell);

        const categoryCell = document.createElement("td");
        categoryCell.classList.add("py-3", "px-1", "border-b", "border-gray-400");
        categoryCell.textContent = expense.category;
        row.appendChild(categoryCell);

        const dateCell = document.createElement("td");
        dateCell.classList.add("py-3", "px-1", "border-b", "border-gray-400");
        dateCell.textContent = new Date(expense.date).toLocaleDateString();
        row.appendChild(dateCell);

        const actionsCell = document.createElement("td");
        actionsCell.classList.add("py-3", "px-1", "border-b", "border-gray-400");
        // Add any action buttons (e.g., edit, delete) here
        actionsCell.innerHTML = `
        <button onclick="editExpense(${expense.id})" class="bg-green-500 text-white px-2 py-1 rounded">Edit</button>
        <button onclick="deleteExpense(${expense.id})" class="bg-red-500 text-white px-2 py-1 rounded">Delete</button>
        `;
        row.appendChild(actionsCell);

        expenseList.appendChild(row);
    });
}

async function deleteExpense(id) {
    try {
        const response = await fetch(`/deleteexpense/${id}`, {
            method: "DELETE",
        });
        if (response.ok) {
            fetchExpenses();
        } else {
            console.error("Error deleting expense");
        }
    } catch (error) {
        console.error("Error deleting expense:", error);
    }
}

function editExpense(id) {
    const modal = document.getElementById("editModal");
    modal.classList.remove("hidden");

    // Fetch the expense details to pre-fill the form
    fetch(`/fetchdata`)
        .then(response => response.json())
        .then(data => {
            const expense = data.find(exp => exp.id === id);
            document.getElementById("editExpenseId").value = expense.id;
            document.getElementById("editExpenseInput").value = expense.amount;
            document.getElementById("editExpenseDescription").value = expense.description;
            document.getElementById("editExpenseCategory").value = expense.category;
        })
        .catch(error => console.error("Error fetching expense details:", error));
}

async function updateExpense(event) {
    event.preventDefault();
    const id = document.getElementById("editExpenseId").value;
    const amount = document.getElementById("editExpenseInput").value;
    const description = document.getElementById("editExpenseDescription").value;
    const category = document.getElementById("editExpenseCategory").value;
    console.log("Sending update request with data:", { amount, description, category });
    try {
        const response = await fetch(`/editexpense/${id}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ amount, description, category })
        });
        console.log("Server response:", response); // Debugging statement
        if (response.ok) {
            closeEditModal();
            fetchExpenses();
        } else {
            console.error("Error updating expense");
        }
    } catch (error) {
        console.error("Error updating expense:", error);
    }
}

function closeEditModal() {
    const modal = document.getElementById("editModal");
    modal.classList.add("hidden");
}