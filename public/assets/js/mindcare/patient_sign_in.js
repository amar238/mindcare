document.addEventListener("DOMContentLoaded", function () {
  // Attach submit event listener to the patient sign-in form
  document.getElementById("patient-sign-in-form").addEventListener('submit', onClick);
});

function onClick(e) {
  // Prevent form submission
  e.preventDefault();

  // Initialize reCAPTCHA when the form is submitted
  grecaptcha.ready(function () {
      grecaptcha.execute("6LdukTcqAAAAADjnv-dv4OZ4GoffcT8oMqnlNQJ0", { action: "submit" })
          .then(function (token) {
              // Gather email and password values from the form
              const email = document.getElementById("login-email").value;
              const password = document.getElementById("login-password").value;

              // Email validation
              if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                  showErrorAlert("Invalid email id", "Please check your email address.");
                  return;
              }
          
              // Password validation
              if (password === "") {    
                  showErrorAlert("Empty Password", "Please enter a password.");
                  return;
              }
             
              // Prepare the user data to be sent to the backend
              const userData = {
                  email: email, 
                  password: password,
                  recaptchaToken: token, // Add the reCAPTCHA token to the data
              };

              // Make the POST request to create the session
              fetch("/authentication/create-patient-session", {
                  method: "POST",
                  headers: {
                      "Content-Type": "application/json",
                  },
                  body: JSON.stringify(userData), // Send the user data as JSON
              })
              .then((response) => response.json()) // Parse the JSON response
              .then((data) => {
                  // If the login is successful
                  if (data.success) {
                      // Optional: Redirect to home or another page after successful login
                      showSuccessAlert("Success!", "You have been signed in successfully.");
                  } else {
                      // If there’s an error with the login
                      showErrorAlert("Sign In Failure", data.error || "An unexpected error occurred.");
                      throw new Error("Sign-in failure");
                  }
              })
              .catch((error) => {
                  showErrorAlert(
                      "Sign In Failure",
                      "Check your credentials and try again!"
                  );
                  console.error(error); // Log error details
              });
          })
          .catch(error => {
              // Catch any error that occurs during reCAPTCHA verification
              console.error("reCAPTCHA error:", error);
              showErrorAlert("reCAPTCHA Error", "There was an issue verifying your reCAPTCHA. Please try again.");
          });
  });
}

function showSuccessAlert(title, message) {
  // Display a success alert using SweetAlert2
  Swal.fire({
      title: title,
      text: message,
      icon: "success",
      showConfirmButton: false,
      footer: '<a href="/" class="bg-green-500 text-black rounded">Proceed to Home</a>',
  });
}

function showErrorAlert(title, error) {
  // Display an error alert using SweetAlert2
  Swal.fire({
      title: title,
      text: error,
      icon: "error",
      confirmButtonText: "OK",
  });
}
