document.addEventListener("DOMContentLoaded", function () {

    document.getElementById("dr-sign-in-form").addEventListener('submit', onClick);
});

function onClick(e) {

    e.preventDefault();

    grecaptcha.ready(function () {
        grecaptcha.execute("6LdukTcqAAAAADjnv-dv4OZ4GoffcT8oMqnlNQJ0", { action: "submit" })
            .then(function (token) {
                // Gather data and validate it
                const email = document.getElementById("login-email").value;
                const password = document.getElementById("login-password").value;

                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                    showErrorAlert("Invalid email id", "Check your email again!");
                    return;
                }
            
                if (password === "") {
                    showErrorAlert("Empty Passwords", "Are you kidding?");
                    return;
                }
               
                // Prepare user data
                const userData = {
                    email: email, 
                    password: password,
                    recaptchaToken: token,
                };

                // Send OTP
                fetch("/dr/create-dr-session", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(userData),
                })
                .then((response) => response.json())
                .then((data) => {
                  if (data.success) {
                    fetch("/",{
                      method:"GET",
                    });
                  } else {
                    showErrorAlert("Sign In Failure", data.error);
                    throw new Error();
                  }
                })
                .catch((error) => {
                  showErrorAlert(
                    "Sign In Failure",
                    "Cheack your credientials and try again!"
                  );
                  throw new Error();
                });
            })
            .catch(error => {
                console.log(error);
            });
    });
}


function showSuccessAlert(title, message) {
    Swal.fire({
      title: title,
      text: message,
      icon: "success",
      showConfirmButton: false,
      footer:
        '<a href="/" class="bg-green-500 text-white py-2 px-4 rounded">Proceed to Home</a>',
    });
  }
  
  function showErrorAlert(title, error) {
    Swal.fire({
      title: title,
      text: error,
      icon: "error",
      confirmButtonText: "OK",
    });
  }