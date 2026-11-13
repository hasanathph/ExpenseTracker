


let form = document.getElementById("loginForm");

let email = document.getElementById("email");
let password = document.getElementById("password");

let API = "http://localhost:3000";

form.addEventListener("submit", async function(event) {

    event.preventDefault();

    if (email.value.trim() === "") {
        alert("Please enter your email");
        return;
    }

    if (password.value.trim() === "") {
        alert("Please enter your password");
        return;
    }

    if (password.value.length < 6) {
        alert("Invalid password");
        return;
    }

    let user = {
        email: email.value.trim(),
        password: password.value
    };

    try {

        let response = await fetch(API + "/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(user)
        });

        let result = await response.json();

        if (!response.ok) {
            throw new Error(result.message);
        }

        // Save logged-in user details
        localStorage.setItem(
            "loggedInUser",
            JSON.stringify(result.user)
        );

        alert("Login successful!");

        window.location.href = "dashboard.html";

    } catch (error) {
        alert(error.message);
        console.log("Login Error:", error);
    }

});


