const loginButton = document.querySelector(".btn-login");

loginButton.addEventListener("click", (e) => {
  e.preventDefault();
  var email = document.getElementById("email").value;
  var password = document.getElementById("password").value;
  console.log("login button clicked", email, password);

  if (email === "" || password === "") {
    document.querySelector(".error-text").innerHTML =
      "<p>Both email and password are required!</p>";
  } else {
    axios
      .post("http://localhost:3000/api/login", {
        email,
        password,
      })
      .then((response) => {
        console.log(response.data);
        sessionStorage.setItem('auth-token', response.data.token);
        window.location.href = "dashboard.html";
      })
      .catch((error) => {
        document.querySelector(".error-text").innerHTML =
          `<p>${error.response.data.error}</p>`;
      });
  }
});
