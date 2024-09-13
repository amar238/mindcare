document.addEventListener("DOMContentLoaded", function() {
  
  document.getElementById("patient-sign-up-form").addEventListener('submit', onClick);
});

function onClick(e) {

  e.preventDefault();
  
  grecaptcha.ready(function () {
      grecaptcha.execute("6LdukTcqAAAAADjnv-dv4OZ4GoffcT8oMqnlNQJ0", { action: "submit" })
          .then(function (token) {
              // Gather data and validate it
              // const firstName = document.getElementById("first-name").value;
              // const lastName = document.getElementById("last-name").value;
              const email = document.getElementById("login-email").value;
        
              // const password = document.getElementById("password").value;
              // const confirmPassword = document.getElementById("confirm-password").value;

              // // Client-side validation
              // if (!/^[a-zA-Z]+$/.test(firstName)) {
              //     showErrorAlert("First Name", "Input field should contain only alphabets!");
              //     return;
              // }
              // if (!/^[a-zA-Z]+$/.test(lastName)) {
              //     showErrorAlert("Last Name", "Input field should contain only alphabets!");
              //     return;
              // }
              // if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
              //     showErrorAlert("Invalid email id", "Check your email again!");
              //     return;
              // }
              // if (password === "") {
              //     showErrorAlert("Empty Passwords", "Are you kidding?");
              //     return;
              // }
              // if (password !== confirmPassword) {
              //     showErrorAlert("Confirm Passwords", "Passwords do not match!");
              //     return;
              // }

              // Prepare user data
              const userData = {
                  // firstName: firstName,
                  // lastName: lastName,
                  email: email,
                  // password: password,
                  recaptchaToken: token,
              };

              // Send OTP
              fetch("/otp/send-otp-signup", {
                  method: "POST",
                  headers: {
                      "Content-Type": "application/json",
                  },
                  body: JSON.stringify({ email }),
              })
                  .then(response => response.text())
                  .then(async (data) => {
                    
                      const enteredOTP = await getOTP();
                      if (enteredOTP) {
                          verifyOTP(email, enteredOTP, userData);
                      }
                  })
                  .catch(error => {
                      console.error("Error:", error);
                  });
          })
          .catch(error => {
              console.log(error);
          });
  });
}

async function getOTP() {
  const { value: enteredOTP, isDismissed } = await Swal.fire({
      title: "Please enter the OTP sent to your email",
      input: "text",
      inputPlaceholder: "Enter OTP",
      showCancelButton: true,
      confirmButtonText: "Submit",
      cancelButtonText: "Cancel",
  });

  if (isDismissed) {
      console.log("User canceled OTP entry");
      return null;
  } else {
      console.log("Entered OTP:", enteredOTP);
      return enteredOTP;
  }
}

function verifyOTP(email, otp, userData) {
  fetch("/otp/verify-otp-signup", {
      method: "POST",
      headers: {
          "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, otp, userData }),
  })
      .then(response => response.text())
      .then(data => {
          if (data === "OTP verified successfully") {
            console.log(userData)
              signUp(userData);
          } else {
              showErrorAlert("OTP Verification Failed", "Invalid OTP.");
          }
      })
      .catch(error => {
          console.error("Error:", error);
      });
}

function signUp(userData) {
  fetch("/authentication/patient-sign-up", {
      method: "POST",
      headers: {
          "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
  })
      .then(response => response.json())
      .then(data => {
          if (data.success) {
              showSuccessAlert("Signed Up!", data.message);
          } else {
              showErrorAlert("Sign Up Failure", data.error);
          }
      })
      .catch(error => {
          console.log(error);
      });
}

function showSuccessAlert(title, message) {
  Swal.fire({
      title: title,
      text: message,
      icon: "success",
      showConfirmButton: false,
      footer: '<a href="/sign-in" class="bg-green-500 text-white py-2 px-4 rounded">Sign In</a>',
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