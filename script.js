
// ELEMENTS
let add=document.getElementById("add");
let modal=document.getElementById("modal");
let close=document.getElementById("close");
let form=document.getElementById("myform");

let cat=document.getElementById("cat");
let date=document.getElementById("date");
let num=document.getElementById("num");
let type=document.getElementById("type");
let methd=document.getElementById("methd");
let js=document.getElementById("js");

let savingsPercent=document.getElementById("savingsPercent");
let groceriesPercent=document.getElementById("groceriesPercent");
let travelPercent=document.getElementById("travelPercent");
let othersPercent=document.getElementById("othersPercent");

let totalt=document.getElementById("totalt");
let totalin=document.getElementById("totalin");
let totalexp=document.getElementById("totalexp");

let totalchange=document.getElementById("totalchange");
let incomechange=document.getElementById("incomechange");
let expensechange=document.getElementById("expensechange");

let search=document.getElementById("search");
let filter=document.getElementById("filter");
let fldte=document.getElementById("fldte");

let monthlyPage=document.getElementById("monthlyPage");
let monthlyList=document.getElementById("monthlyList");
let monthlyDetails=document.getElementById("monthlyDetails");

let dashboard=document.querySelector(".dashboard");
let month=document.getElementById("month");
let overview=document.getElementById("overview");
let transactionsMenu=document.getElementById("Transactions");
let backBtn=document.getElementById("backBtn");


// HELPER FUNCTIONS

function pad(n){
    return String(n).padStart(2,"0");
}

function normalizeDate(value){
    if(!value) return "";

    let s=String(value).trim();

    let m=s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);

    if(m){
        return m[1]+"-"+pad(m[2])+"-"+pad(m[3]);
    }

    m=s.match(/^(\d{1,2})[-\/.](\d{1,2})[-\/.](\d{4})$/);

    if(m){
        return m[3]+"-"+pad(m[2])+"-"+pad(m[1]);
    }

    let d=new Date(s);

    if(!isNaN(d.getTime())){
        return d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate());
    }

    return "";
}

function parseISODate(str){
    if(!str) return null;

    let parts=str.split("-");

    if(parts.length!==3) return null;

    let d=new Date(
        Number(parts[0]),
        Number(parts[1])-1,
        Number(parts[2])
    );

    return isNaN(d.getTime()) ? null : d;
}

function formatDisplayDate(str,options){
    let d=parseISODate(str);

    if(!d) return "—";

    return d.toLocaleDateString("en-GB",options || {
        day:"2-digit",
        month:"short",
        year:"numeric"
    });
}

function cleanAmount(value){
    let cleaned=String(value===undefined || value===null ? "" : value)
        .replace(/[^0-9.\-]/g,"");

    let n=parseFloat(cleaned);

    return isNaN(n) ? 0 : n;
}

function isIncome(item){
    return String(item.type || "").trim().toLowerCase()==="income";
}

function isExpense(item){
    return String(item.type || "").trim().toLowerCase()==="expense";
}




const API = "http://localhost:3000";

let transactions = [];
let loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));

if (!loggedInUser || !loggedInUser.id) {
    window.location.href = "login.html";
}
let editingIndex = null;

function refreshAll() {
    displayTransactions();
    calculateTotal();
    calculateChanges();
    calculateBreakdown();
    renderOverview();
}
// OVERVIEW PAGE

function renderOverview() {

    let income = 0;
    let expense = 0;

    transactions.forEach(function(item) {

        let amount = cleanAmount(item.amount);

        if (isIncome(item)) {
            income += amount;
        }
        else if (isExpense(item)) {
            expense += amount;
        }

    });

    let balance = income - expense;

    document.getElementById("overviewBalance").textContent =
        formatMoney(balance);

    document.getElementById("overviewIncome").textContent =
        formatMoney(income);

    document.getElementById("overviewExpense").textContent =
        formatMoney(expense);

    document.getElementById("overviewSavings").textContent =
        formatMoney(balance);

    // RECENT 5 TRANSACTIONS

    let tbody = document.getElementById("overviewTransactions");

    tbody.innerHTML = "";

    let recent = [...transactions]
        .sort(function(a, b) {
            return b.date.localeCompare(a.date);
        })
        .slice(0, 5);

    if (recent.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align:center;padding:20px;">
                    No transactions yet
                </td>
            </tr>
        `;
        return;
    }

    recent.forEach(function(item) {

        let tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${item.category}</td>
            <td>${formatDisplayDate(item.date)}</td>
            <td>${formatMoney(item.amount)}</td>
            <td>${item.type}</td>
            <td>${item.method}</td>
        `;

        tbody.appendChild(tr);

    });
}

async function loadTransactions() {
    try {
let response = await fetch(API + "/transactions?userId=" + loggedInUser.id);
        if (!response.ok) {
            throw new Error("Failed to load transactions");
        }

        let data = await response.json();

        transactions = data.map(function(item) {
            return {
                ...item,
                category: String(item.category || "Others").trim(),
                date: normalizeDate(item.date),
                amount: cleanAmount(item.amount).toFixed(2),
                type: String(item.type || "").trim(),
                method: String(item.method || "cash").trim()
            };
        });

        refreshAll();

    } catch (error) {
        console.log("Error loading transactions:", error);
    }
}

// MODAL

add.addEventListener("click", function() {
    editingIndex = null;
    form.reset();
    clearErrors();

    document.querySelector(".cntnt h3").textContent = "Add Transaction";
    document.getElementById("submit").textContent = "Save Transaction";

    modal.style.display = "flex";
});

close.addEventListener("click", function() {
    modal.style.display = "none";
    editingIndex = null;
});
// VALIDATION

function clearErrors(){
    document.getElementById("catError").textContent="";
    document.getElementById("dateError").textContent="";
    document.getElementById("numError").textContent="";
    document.getElementById("typeError").textContent="";
    document.getElementById("methdError").textContent="";
}

function validateForm(){
    clearErrors();

    let valid=true;

    if(cat.value===""){
        document.getElementById("catError").textContent="Please select category";
        valid=false;
    }

    if(date.value===""){
        document.getElementById("dateError").textContent="Please select date";
        valid=false;
    }

    if(num.value===""){
        document.getElementById("numError").textContent="Please enter amount";
        valid=false;
    }
    else if(Number(num.value)<=0){
        document.getElementById("numError").textContent="Amount must be greater than zero";
        valid=false;
    }

    if(type.value===""){
        document.getElementById("typeError").textContent="Please select type";
        valid=false;
    }

    if(methd.value.trim()===""){
        document.getElementById("methdError").textContent="Please enter payment method";
        valid=false;
    }

    return valid;
}


// ADD / UPDATE TRANSACTION

form.addEventListener("submit", async function(event) {
    event.preventDefault();

    if (!validateForm()) {
        return;
    }

    let transaction = {
        userId: loggedInUser.id,
        category: cat.value,
        date: normalizeDate(date.value),
        amount: Number(num.value).toFixed(2),
        type: type.value,
        method: methd.value.trim()
    };

    let url = API + "/add-transaction";
    let httpMethod = "POST";

    if (editingIndex !== null) {
        url = API + "/update-transaction/" + transactions[editingIndex]._id;
        httpMethod = "PUT";
    }

    try {
        let response = await fetch(url, {
            method: httpMethod,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(transaction)
        });

        let result = await response.json().catch(function() {
            return {};
        });

        if (!response.ok) {
            throw new Error(result.message || "Request failed");
        }

        editingIndex = null;
        modal.style.display = "none";
        form.reset();
        clearErrors();

        await loadTransactions();

    } catch (error) {
        console.log("Error:", error);
        alert("Unable to save transaction!");
    }
});


// CLEAR VALIDATION ERRORS

cat.addEventListener("change",function(){
    document.getElementById("catError").textContent="";
});

date.addEventListener("change",function(){
    document.getElementById("dateError").textContent="";
});

num.addEventListener("input",function(){
    document.getElementById("numError").textContent="";
});

type.addEventListener("change",function(){
    document.getElementById("typeError").textContent="";
});

methd.addEventListener("input",function(){
    document.getElementById("methdError").textContent="";
});


// DISPLAY TRANSACTIONS

function displayTransactions(){

    js.innerHTML="";

    if(transactions.length===0){
        let tr=document.createElement("tr");
        let td=document.createElement("td");

        td.colSpan=6;
        td.textContent="No transactions yet";
        td.style.textAlign="center";
        td.style.padding="25px";
        td.style.color="gray";

        tr.appendChild(td);
        js.appendChild(tr);

        return;
    }

    transactions.forEach(function(item,index){

        let tr=document.createElement("tr");
        tr.dataset.index=index;

        let td=document.createElement("td");
        td.textContent=item.category;
        tr.appendChild(td);

        let td1=document.createElement("td");
        td1.dataset.date=item.date;
        td1.textContent=formatDisplayDate(item.date);
        tr.appendChild(td1);

        let td3=document.createElement("td");
        td3.textContent="₹"+Number(item.amount).toFixed(2);

        if(isIncome(item)){
            td3.className="income-amount";
        }
        else{
            td3.className="expense-amount";
        }

        tr.appendChild(td3);

        let td4=document.createElement("td");

        if(isIncome(item)){
            td4.innerHTML=`<span class="income-badge">Income</span>`;
        }
        else{
            td4.innerHTML=`<span class="expense-badge">Expense</span>`;
        }

        tr.appendChild(td4);

        let td5=document.createElement("td");
        td5.textContent=item.method;
        tr.appendChild(td5);

        let td6=document.createElement("td");
        td6.className="action-cell";

        let action=document.createElement("button");
        action.textContent="⋮";
        action.className="action";

        td6.appendChild(action);
        tr.appendChild(td6);

        js.appendChild(tr);

    });

    applyFilters();
}


// ACTION MENU: EDIT AND DELETE

js.addEventListener("click", async function(event) {

    event.stopPropagation();

    let actionButton=event.target.closest(".action");
    let menuButton=event.target.closest(".menu button");

    if(actionButton){

        let td6=actionButton.parentElement;

        document.querySelectorAll(".menu").forEach(function(menu){
            if(menu.parentElement!==td6){
                menu.remove();
            }
        });

        let oldMenu=td6.querySelector(".menu");

        if(oldMenu){
            oldMenu.remove();
            return;
        }

        let menu=document.createElement("div");
        menu.className="menu";

        let edit=document.createElement("button");
        edit.innerHTML='<span class="edit-icon">✎</span> Update';

        let del=document.createElement("button");
        del.innerHTML='<span class="delete-icon">🗑</span> Delete';

        menu.appendChild(edit);
        menu.appendChild(del);
        td6.appendChild(menu);

        return;
    }


    if(menuButton && menuButton.closest(".menu")){

        let tr=menuButton.closest("tr");
        let index=Number(tr.dataset.index);

        let isEdit=menuButton.textContent.trim().includes("Update");

        document.querySelectorAll(".menu").forEach(function(menu){
            menu.remove();
        });

        if(isEdit){

            editingIndex=index;

            let item=transactions[index];

            cat.value=item.category;
            date.value=item.date;
            num.value=Number(item.amount);
            type.value=item.type;
            methd.value=item.method;

            clearErrors();

            document.querySelector(".cntnt h3").textContent="Update Transaction";
            document.getElementById("submit").textContent="Update Transaction";

            modal.style.display="flex";
        }

       else {
    try {
        let id = transactions[index]._id;

       let response = await fetch(
    API + "/delete-transaction/" + id + "?userId=" + loggedInUser.id,
    {
        method: "DELETE"
    }
);

        if (!response.ok) {
            throw new Error("Delete failed");
        }

        await loadTransactions();

    } catch (error) {
        console.log("Error:", error);
        alert("Unable to delete transaction!");
    }
}
    }
});


// CLOSE MENU WHEN CLICKING OUTSIDE

document.addEventListener("click",function(){
    document.querySelectorAll(".menu").forEach(function(menu){
        menu.remove();
    });
});


// SEARCH, CATEGORY AND DATE FILTER

function applyFilters(){

    let searchValue=search.value.toLowerCase();
    let categoryValue=filter.value.toLowerCase();
    let dateValue=fldte.value;

    let rows=js.querySelectorAll("tr");

    rows.forEach(function(row){

        if(row.dataset.index===undefined){
            return;
        }

        let index=Number(row.dataset.index);
        let item=transactions[index];

        let matchesSearch=row.textContent.toLowerCase().includes(searchValue);

        let matchesCategory=
            categoryValue==="all" ||
            item.category.toLowerCase()===categoryValue;

        let matchesDate=
            dateValue==="" ||
            item.date===dateValue;

        row.style.display=
            matchesSearch && matchesCategory && matchesDate ? "" : "none";

    });
}

search.addEventListener("input",applyFilters);
filter.addEventListener("change",applyFilters);
fldte.addEventListener("change",applyFilters);


// TOTAL TRANSACTIONS, INCOME AND EXPENSE

function calculateTotal(){

    let income=0;
    let expense=0;

    transactions.forEach(function(item){

        let amount=cleanAmount(item.amount);

        if(isIncome(item)){
            income+=amount;
        }
        else if(isExpense(item)){
            expense+=amount;
        }

    });

    totalt.textContent=transactions.length;
    totalin.textContent="₹"+income.toFixed(2);
    totalexp.textContent="₹"+expense.toFixed(2);
}


// MONTHLY COMPARISON

function calculateChanges(){

    let currentIncome=0;
    let currentExpense=0;

    let previousIncome=0;
    let previousExpense=0;

    let today=new Date();

    let currentMonth=today.getMonth();
    let currentYear=today.getFullYear();

    let previousDate=new Date(currentYear,currentMonth-1,1);

    let previousMonth=previousDate.getMonth();
    let previousYear=previousDate.getFullYear();

    transactions.forEach(function(item){

        let transactionDate=parseISODate(item.date);

        if(!transactionDate){
            return;
        }

        let m=transactionDate.getMonth();
        let y=transactionDate.getFullYear();

        let amount=cleanAmount(item.amount);

        if(m===currentMonth && y===currentYear){

            if(isIncome(item)){
                currentIncome+=amount;
            }
            else if(isExpense(item)){
                currentExpense+=amount;
            }
        }

        if(m===previousMonth && y===previousYear){

            if(isIncome(item)){
                previousIncome+=amount;
            }
            else if(isExpense(item)){
                previousExpense+=amount;
            }
        }

    });

    let currentTotal=currentIncome+currentExpense;
    let previousTotal=previousIncome+previousExpense;

    function showChange(element,current,previous,hidePlus=false){

    if(!element) return;

    let difference=current-previous;

    


        if(difference===0){
            element.textContent="No change";
            element.style.color="#9CA3AF";
            return;
        }

        let sign;

        if(hidePlus){
            sign=difference<0 ? "-" : "";
            element.style.color="#DC2626";
        }
        else{
            sign=difference>0 ? "+" : "-";
            element.style.color=difference>0 ? "#16A34A" : "#DC2626";
        }

        element.textContent=sign+"₹"+Math.abs(difference).toFixed(2);
    }
    showChange(totalchange, currentTotal, previousTotal);
    showChange(incomechange,currentIncome,previousIncome);
    showChange(expensechange,currentExpense,previousExpense,true);

}


// EXPENSE BREAKDOWN



function calculateBreakdown() {

    let savingsAmount = 0;
    let groceriesAmount = 0;
    let travelAmount = 0;
    let othersAmount = 0;

    let categoryTotals = {};

    transactions.forEach(function(item) {

        let amount = cleanAmount(item.amount);
        let category = String(item.category || "Others").trim();
        let categoryName = category.toLowerCase();
        let typeName = String(item.type || "").trim().toLowerCase();

        // Savings: Income and Expense both
        if (categoryName === "savings") {
            savingsAmount += amount;
        }

        // Other categories: Expense only
        else if (typeName === "expense") {

            if (categoryName === "groceries") {
                groceriesAmount += amount;
            }
            else if (
                categoryName === "travel" ||
                categoryName === "transportation"
            ) {
                travelAmount += amount;
            }
            else {
                othersAmount += amount;

                if (!categoryTotals[category]) {
                    categoryTotals[category] = 0;
                }

                categoryTotals[category] += amount;
            }
        }
    });

    let totalExpense =
        savingsAmount + groceriesAmount + travelAmount + othersAmount;

    let otherCategories = document.getElementById("otherCategories");
    otherCategories.innerHTML = "";

    for (let category in categoryTotals) {

        let percentage = totalExpense > 0
            ? Math.round(categoryTotals[category] / totalExpense * 100)
            : 0;

        let div = document.createElement("div");
        div.className = "category";

        div.innerHTML = `
            <p>${category}</p>
            <span>${percentage}%</span>
        `;

        otherCategories.appendChild(div);
    }

    document.getElementById("savingsPercent").textContent =
        totalExpense > 0 ? Math.round(savingsAmount / totalExpense * 100) + "%" : "0%";

    document.getElementById("groceriesPercent").textContent =
        totalExpense > 0 ? Math.round(groceriesAmount / totalExpense * 100) + "%" : "0%";

    document.getElementById("travelPercent").textContent =
        totalExpense > 0 ? Math.round(travelAmount / totalExpense * 100) + "%" : "0%";

    document.getElementById("othersPercent").textContent =
        totalExpense > 0 ? Math.round(othersAmount / totalExpense * 100) + "%" : "0%";
}



// MONTHLY SUMMARY

function renderMonthlySummary(){

    let monthlyData={};

    transactions.forEach(function(item){

        if(!item.date){
            return;
        }

        let key=item.date.slice(0,7);

        if(!monthlyData[key]){
            monthlyData[key]={
                income:0,
                expense:0
            };
        }

        let amount=cleanAmount(item.amount);

        if(isIncome(item)){
            monthlyData[key].income+=amount;
        }
        else if(isExpense(item)){
            monthlyData[key].expense+=amount;
        }

    });

    monthlyList.innerHTML="";

    let months=Object.keys(monthlyData).sort().reverse();

    if(months.length===0){
        monthlyList.innerHTML="<p>No transactions available.</p>";
        return;
    }

    months.forEach(function(key){

        let data=monthlyData[key];

        let d=new Date(key+"-01T00:00:00");

        let monthName=d.toLocaleString("en-US",{
            month:"long",
            year:"numeric"
        });

        let balance=data.income-data.expense;

        let div=document.createElement("div");
        div.className="monthly-card";

        div.innerHTML=`
            <h3>${monthName}</h3>
            <p>Income: ₹${data.income.toFixed(2)}</p>
            <p>Expense: ₹${data.expense.toFixed(2)}</p>
            <h4>Balance: ₹${balance.toFixed(2)}</h4>
        `;

        div.addEventListener("click",function(){
            showMonthDetails(key);
        });

        monthlyList.appendChild(div);

    });

}


// MONTHLY TRANSACTION DETAILS

function showMonthDetails(key){

    monthlyList.style.display="none";
    monthlyDetails.style.display="block";

    let monthTransactions=transactions.filter(function(item){
        return item.date && item.date.slice(0,7)===key;
    });

    monthlyDetails.innerHTML=`
        <button id="monthBack">← Back</button>
        <h2>Monthly Transactions</h2>

        <table>
            <thead>
                <tr>
                    <th>Category</th>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Type</th>
                    <th>Method</th>
                </tr>
            </thead>
            <tbody id="monthRows"></tbody>
        </table>
    `;

    let monthRows=document.getElementById("monthRows");

    monthTransactions.forEach(function(item){

        let tr=document.createElement("tr");

        let formattedDate=formatDisplayDate(item.date,{
            day:"2-digit",
            month:"2-digit",
            year:"numeric"
        });

        tr.innerHTML=`
            <td>${item.category}</td>
            <td>${formattedDate}</td>
            <td>₹${cleanAmount(item.amount).toFixed(2)}</td>
            <td>${item.type}</td>
            <td>${item.method}</td>
        `;

        monthRows.appendChild(tr);

    });

    document.getElementById("monthBack").addEventListener("click",function(){
        monthlyDetails.style.display="none";
        monthlyList.style.display="block";
    });

}


// PAGE NAVIGATION

function showMonthly(){

    dashboard.style.display="none";
    monthlyPage.style.display="block";

    monthlyList.style.display="block";
    monthlyDetails.style.display="none";

    renderMonthlySummary();
}

function showDashboard(){

    monthlyPage.style.display="none";
    dashboard.style.display="grid";
}

month.addEventListener("click",showMonthly);

transactionsMenu.addEventListener("click",showDashboard);
backBtn.addEventListener("click",showDashboard);


// INITIAL DISPLAY

loadTransactions();

// SIDEBAR NAVIGATION

let overviewBtn = document.getElementById("overview");
let transactionBtn = document.getElementById("Transactions");

let overviewPage = document.getElementById("overviewPage");
let transactionsContent = document.getElementById("transactionsContent");
let transactionsRight = document.getElementById("transactionsRight");



transactionBtn.addEventListener("click", function () {

    overviewPage.style.display = "none";
    transactionsContent.style.display = "block";
    transactionsRight.style.display = "block";

});
function formatMoney(amount) {
    return "₹" + Number(amount || 0).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}
let logoutBtn = document.getElementById("logoutBtn");

logoutBtn.addEventListener("click", function() {
    localStorage.removeItem("loggedInUser");
    window.location.href = "login.html";
});