const loginButton = document.querySelector("[data-login-button]")
//event listener za pokretanje postupka dobivanja access tokena spotify api-a
loginButton.addEventListener("click", () => {
    window.location.href = "/login"
    loginButton.removeEventListener("click")
})