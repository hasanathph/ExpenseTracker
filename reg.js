
let form = document.getElementById("registerForm");

let name = document.getElementById("name");
let email = document.getElementById("email");
let password = document.getElementById("password");
let confirm = document.getElementById("confirm");

let API = "http://localhost:3000";

form.addEventListener("submit", async function(event) {

    event.preventDefault();

    if (name.value.trim() === "") {
        alert("Please enter your name");
        return;
    }

    if (email.value.trim() === "") {
        alert("Please enter your email");
        return;
    }

    if (password.value.length < 6) {
        alert("Password must contain at least 6 characters");
        return;
    }

    if (password.value !== confirm.value) {
        alert("Passwords do not match");
        return;
    }

    // SEND DATA TO BACKEND
    let user = {
        name: name.value.trim(),
        email: email.value.trim(),
        password: password.value
    };

    try {

        let response = await fetch(API + "/register", {
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

        alert("Registration successful!");

window.location.href = "login.html";

    } catch (error) {

        alert(error.message);
        console.log("Registration Error:", error);

    }

});
