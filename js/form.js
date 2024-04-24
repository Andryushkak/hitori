window.onload = () => {
    const form = document.querySelector(".box-form");

    document.querySelector(".box-form h2").onclick = () =>
        form.classList.add("box-form-open");

    document.querySelector(".close").onclick = () =>
        form.classList.remove("box-form-open");

    const registrationForm = document.getElementById("registrationForm");
    const loginForm = document.getElementById("loginForm");

    registrationForm.addEventListener("submit", function (e) {
        e.preventDefault();
        sendData(this, "/register");
    });

    loginForm.addEventListener("submit", function (e) {
        e.preventDefault();
        sendData(this, "/login");
    });

    function sendData(form, endpoint) {
        const formData = new FormData(form);
        const xhr = new XMLHttpRequest();
        xhr.open("POST", endpoint);
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded"); // Змініть Content-Type на application/x-www-form-urlencoded

        xhr.onload = function () {
            if (xhr.status === 200) {
                console.log("Request successful");
                window.location.href = "/hello.html";
            } else {
                console.error("Request failed");
                console.log(xhr);
                console.log(xhr.responseText);
                console.log(formData);
                alert("Помилка сервера"); // Повідомлення про помилку сервера
            }
        };
        

        // Перетворення об'єкта formData на рядок URL-параметрів
        const urlEncodedData = new URLSearchParams(formData).toString();
        xhr.send(urlEncodedData);
    }
};
