// ========================================
// CAISHEN
// 财神 · PERSONAL WEALTH SYSTEM
// ========================================


// ========================================
// STATE
// ========================================

let transactions =
    JSON.parse(
        localStorage.getItem(
            "caishen_transactions"
        )
    ) || [];


// ========================================
// DOM
// ========================================

const balanceElement =
    document.querySelector("#balance");

const incomeElement =
    document.querySelector("#income");

const expensesElement =
    document.querySelector("#expenses");

const savingsElement =
    document.querySelector("#savings");

const transactionList =
    document.querySelector("#transactions-list");

const transactionCount =
    document.querySelector("#transaction-count");

const emptyState =
    document.querySelector("#empty-state");

const searchInput =
    document.querySelector("#search");

const typeFilter =
    document.querySelector("#type-filter");

const categoryFilter =
    document.querySelector("#category-filter");

const modal =
    document.querySelector("#modal");

const openModalButton =
    document.querySelector("#open-modal");

const closeModalButton =
    document.querySelector("#close-modal");

const transactionForm =
    document.querySelector("#transaction-form");

const dateInput =
    document.querySelector("#date");


// ========================================
// CHARTS
// ========================================

let cashflowChart = null;
let categoryChart = null;


// ========================================
// INITIALIZATION
// ========================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        setCurrentDate();

        setDefaultDate();

        render();

    }
);


// ========================================
// DATE
// ========================================

function setCurrentDate() {

    const element =
        document.querySelector(
            "#current-date"
        );

    const now =
        new Date();

    element.textContent =
        now
            .toLocaleDateString(
                "en-US",
                {
                    month: "short",
                    day: "2-digit",
                    year: "numeric"
                }
            )
            .toUpperCase();

}


function setDefaultDate() {

    const today =
        new Date()
            .toISOString()
            .split("T")[0];

    dateInput.value =
        today;

}


// ========================================
// STORAGE
// ========================================

function saveTransactions() {

    localStorage.setItem(
        "caishen_transactions",
        JSON.stringify(
            transactions
        )
    );

}


// ========================================
// CALCULATIONS
// ========================================

function getIncome() {

    return transactions

        .filter(
            transaction =>
                transaction.type === "income"
        )

        .reduce(
            (total, transaction) =>
                total + transaction.amount,
            0
        );

}


function getExpenses() {

    return transactions

        .filter(
            transaction =>
                transaction.type === "expense"
        )

        .reduce(
            (total, transaction) =>
                total + transaction.amount,
            0
        );

}


function getBalance() {

    return (
        getIncome()
        -
        getExpenses()
    );

}


function getSavingsRate() {

    const income =
        getIncome();

    if (income === 0) {

        return 0;

    }

    return (
        (
            (
                income
                -
                getExpenses()
            )
            /
            income
        )
        * 100
    );

}


// ========================================
// FORMATTERS
// ========================================

function formatCurrency(value) {

    return new Intl.NumberFormat(
        "pt-BR",
        {
            style: "currency",
            currency: "BRL"
        }
    ).format(value);

}


function formatDate(date) {

    return new Date(
        `${date}T00:00:00`
    ).toLocaleDateString(
        "pt-BR"
    );

}


// ========================================
// DASHBOARD
// ========================================

function updateDashboard() {

    const income =
        getIncome();

    const expenses =
        getExpenses();

    const balance =
        getBalance();

    const savings =
        getSavingsRate();


    balanceElement.textContent =
        formatCurrency(balance);


    incomeElement.textContent =
        formatCurrency(income);


    expensesElement.textContent =
        formatCurrency(expenses);


    savingsElement.textContent =
        `${Math.max(
            0,
            savings
        ).toFixed(1)}%`;


    if (balance < 0) {

        balanceElement.classList.add(
            "negative"
        );

        balanceElement.classList.remove(
            "positive"
        );

    } else {

        balanceElement.classList.remove(
            "negative"
        );

        balanceElement.classList.add(
            "positive"
        );

    }

}


// ========================================
// FILTERING
// ========================================

function getFilteredTransactions() {

    const search =
        searchInput.value
            .toLowerCase()
            .trim();

    const type =
        typeFilter.value;

    const category =
        categoryFilter.value;


    return transactions.filter(
        transaction => {

            const matchesSearch =
                transaction.description
                    .toLowerCase()
                    .includes(search);


            const matchesType =
                type === "all"
                ||
                transaction.type === type;


            const matchesCategory =
                category === "all"
                ||
                transaction.category === category;


            return (
                matchesSearch
                &&
                matchesType
                &&
                matchesCategory
            );

        }
    );

}


// ========================================
// TRANSACTIONS
// ========================================

function renderTransactions() {

    const filtered =
        getFilteredTransactions();

    transactionList.innerHTML =
        "";

    transactionCount.textContent =
        `${filtered.length} RECORD${
            filtered.length === 1
                ? ""
                : "S"
        }`;


    if (filtered.length === 0) {

        emptyState.style.display =
            "block";

        return;

    }


    emptyState.style.display =
        "none";


    filtered

        .sort(
            (a, b) =>
                new Date(b.date)
                -
                new Date(a.date)
        )

        .forEach(
            transaction => {

                const row =
                    document.createElement(
                        "tr"
                    );


                const amountClass =
                    transaction.type === "income"
                        ? "amount-income"
                        : "amount-expense";


                const amountPrefix =
                    transaction.type === "income"
                        ? "+"
                        : "-";


                row.innerHTML = `

                    <td>
                        ${formatDate(
                            transaction.date
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            transaction.description
                        )}
                    </td>

                    <td>
                        <span class="category-badge">
                            ${transaction.category.toUpperCase()}
                        </span>
                    </td>

                    <td>
                        <span class="type-badge">
                            ${transaction.type.toUpperCase()}
                        </span>
                    </td>

                    <td class="${amountClass}">
                        ${amountPrefix}
                        ${formatCurrency(
                            transaction.amount
                        )}
                    </td>

                    <td>

                        <button
                            class="delete-button"
                            data-id="${transaction.id}"
                            title="Delete transaction"
                        >
                            ×
                        </button>

                    </td>

                `;


                transactionList.appendChild(
                    row
                );

            }
        );

}


// ========================================
// HTML SAFETY
// ========================================

function escapeHTML(value) {

    const div =
        document.createElement(
            "div"
        );

    div.textContent =
        value;

    return div.innerHTML;

}


// ========================================
// ADD TRANSACTION
// ========================================

transactionForm.addEventListener(
    "submit",
    event => {

        event.preventDefault();


        const description =
            document
                .querySelector(
                    "#description"
                )
                .value
                .trim();


        const amount =
            Number(
                document
                    .querySelector(
                        "#amount"
                    )
                    .value
            );


        const type =
            document
                .querySelector(
                    "#transaction-type"
                )
                .value;


        const category =
            document
                .querySelector(
                    "#category"
                )
                .value;


        const date =
            dateInput.value;


        if (
            !description ||
            !amount ||
            amount <= 0 ||
            !date
        ) {

            return;

        }


        const transaction = {

            id:
                Date.now(),

            description,

            amount,

            type,

            category,

            date

        };


        transactions.push(
            transaction
        );


        saveTransactions();

        render();

        transactionForm.reset();

        setDefaultDate();

        closeModal();

    }
);


// ========================================
// DELETE
// ========================================

transactionList.addEventListener(
    "click",
    event => {

        const button =
            event.target.closest(
                ".delete-button"
            );


        if (!button) {

            return;

        }


        const id =
            Number(
                button.dataset.id
            );


        transactions =
            transactions.filter(
                transaction =>
                    transaction.id !== id
            );


        saveTransactions();

        render();

    }
);


// ========================================
// FILTERS
// ========================================

searchInput.addEventListener(
    "input",
    renderTransactions
);


typeFilter.addEventListener(
    "change",
    renderTransactions
);


categoryFilter.addEventListener(
    "change",
    renderTransactions
);


// ========================================
// MODAL
// ========================================

openModalButton.addEventListener(
    "click",
    openModal
);


closeModalButton.addEventListener(
    "click",
    closeModal
);


modal.addEventListener(
    "click",
    event => {

        if (
            event.target === modal
        ) {

            closeModal();

        }

    }
);


function openModal() {

    modal.classList.add(
        "active"
    );

}


function closeModal() {

    modal.classList.remove(
        "active"
    );

}


document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Escape"
        ) {

            closeModal();

        }

    }
);


// ========================================
// CASH FLOW CHART
// ========================================

function updateCashflowChart() {

    const months = [];

    const incomeData = [];

    const expenseData = [];

    const now =
        new Date();


    for (
        let i = 5;
        i >= 0;
        i--
    ) {

        const date =
            new Date(
                now.getFullYear(),
                now.getMonth() - i,
                1
            );


        const month =
            date
                .toLocaleString(
                    "en-US",
                    {
                        month: "short"
                    }
                )
                .toUpperCase();


        months.push(month);


        const year =
            date.getFullYear();

        const monthNumber =
            date.getMonth();


        const monthTransactions =
            transactions.filter(
                transaction => {

                    const transactionDate =
                        new Date(
                            `${transaction.date}T00:00:00`
                        );


                    return (
                        transactionDate.getFullYear()
                        ===
                        year
                        &&
                        transactionDate.getMonth()
                        ===
                        monthNumber
                    );

                }
            );


        const income =
            monthTransactions

                .filter(
                    transaction =>
                        transaction.type
                        === "income"
                )

                .reduce(
                    (total, transaction) =>
                        total +
                        transaction.amount,
                    0
                );


        const expenses =
            monthTransactions

                .filter(
                    transaction =>
                        transaction.type
                        === "expense"
                )

                .reduce(
                    (total, transaction) =>
                        total +
                        transaction.amount,
                    0
                );


        incomeData.push(
            income
        );

        expenseData.push(
            expenses
        );

    }


    const context =
        document
            .querySelector(
                "#cashflow-chart"
            )
            .getContext("2d");


    if (cashflowChart) {

        cashflowChart.destroy();

    }


    cashflowChart =
        new Chart(
            context,
            {

                type: "bar",

                data: {

                    labels: months,

                    datasets: [

                        {

                            label: "Income",

                            data: incomeData,

                            backgroundColor:
                                "rgba(85,201,138,0.68)",

                            borderWidth: 0,

                            borderRadius: 4

                        },

                        {

                            label: "Expenses",

                            data: expenseData,

                            backgroundColor:
                                "rgba(200,16,46,0.72)",

                            borderWidth: 0,

                            borderRadius: 4

                        }

                    ]

                },


                options: {

                    responsive: true,

                    maintainAspectRatio:
                        false,

                    plugins: {

                        legend: {

                            labels: {

                                color:
                                    "#858585",

                                font: {

                                    family:
                                        "Montserrat",

                                    size: 10

                                }

                            }

                        }

                    },


                    scales: {

                        x: {

                            grid: {

                                color:
                                    "rgba(255,255,255,0.04)"

                            },

                            ticks: {

                                color:
                                    "#666",

                                font: {

                                    family:
                                        "Montserrat",

                                    size: 10

                                }

                            }

                        },


                        y: {

                            beginAtZero:
                                true,

                            grid: {

                                color:
                                    "rgba(255,255,255,0.04)"

                            },

                            ticks: {

                                color:
                                    "#666",

                                font: {

                                    family:
                                        "Montserrat",

                                    size: 10

                                },

                                callback:
                                    value =>
                                        `R$ ${value}`

                            }

                        }

                    }

                }

            }
        );

}


// ========================================
// EXPENSE CATEGORY CHART
// ========================================

function updateCategoryChart() {

    const categoryTotals = {};


    transactions

        .filter(
            transaction =>
                transaction.type === "expense"
        )

        .forEach(
            transaction => {

                if (
                    !categoryTotals[
                        transaction.category
                    ]
                ) {

                    categoryTotals[
                        transaction.category
                    ] = 0;

                }


                categoryTotals[
                    transaction.category
                ] +=
                    transaction.amount;

            }
        );


    const labels =
        Object.keys(
            categoryTotals
        );


    const values =
        Object.values(
            categoryTotals
        );


    const context =
        document
            .querySelector(
                "#category-chart"
            )
            .getContext("2d");


    if (categoryChart) {

        categoryChart.destroy();

    }


    if (labels.length === 0) {

        categoryChart =
            new Chart(
                context,
                {

                    type: "doughnut",

                    data: {

                        labels:
                            ["NO DATA"],

                        datasets: [{

                            data: [1],

                            backgroundColor: [
                                "rgba(255,255,255,0.08)"
                            ],

                            borderWidth: 0

                        }]

                    },


                    options: {

                        responsive: true,

                        maintainAspectRatio:
                            false,

                        plugins: {

                            legend: {

                                display:
                                    false

                            }

                        }

                    }

                }
            );

        return;

    }


    categoryChart =
        new Chart(
            context,
            {

                type: "doughnut",

                data: {

                    labels:
                        labels.map(
                            label =>
                                label.toUpperCase()
                        ),

                    datasets: [{

                        data:
                            values,

                        backgroundColor: [

                            "#c8102e",
                            "#ef3340",
                            "#8f1018",
                            "#d94b55",
                            "#aa1821",
                            "#ef6871",
                            "#751018",
                            "#c93843",
                            "#9e1b25"

                        ],

                        borderColor:
                            "#090909",

                        borderWidth:
                            3

                    }]

                },


                options: {

                    responsive: true,

                    maintainAspectRatio:
                        false,

                    cutout:
                        "68%",

                    plugins: {

                        legend: {

                            position:
                                "bottom",

                            labels: {

                                color:
                                    "#858585",

                                padding:
                                    16,

                                font: {

                                    family:
                                        "Montserrat",

                                    size: 10

                                }

                            }

                        }

                    }

                }

            }
        );

}


// ========================================
// RENDER
// ========================================

function render() {

    updateDashboard();

    renderTransactions();

    updateCashflowChart();

    updateCategoryChart();

}