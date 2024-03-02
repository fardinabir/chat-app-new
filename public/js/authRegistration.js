const regButton = document.querySelector(".btn-register");

regButton.addEventListener("click", (e) => {
  e.preventDefault();
  var email = document.getElementById("email").value;
  var password = document.getElementById("password").value;
  console.log("button clicked", email, password);

  if (email === "" || password === "") {
    document.querySelector(".error-text").innerHTML =
      "<p>Both email and password are required!</p>";
  } else {
    axios
      .post("http://localhost:3000/auth/register", {
        email,
        password,
      })
      .then((response) => {
        console.log(response.data);
        window.location.href = "login.html";
      })
      .catch((error) => {
        document.querySelector(".error-text").innerHTML =
          `<p>${error.response.data.error}</p>`;
      });
  }
});
