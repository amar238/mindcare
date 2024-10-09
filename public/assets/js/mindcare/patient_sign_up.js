document.addEventListener("DOMContentLoaded", function () {

    document.getElementById("patient-sign-up-form").addEventListener('submit', onClick);
});

function onClick(e) {

    e.preventDefault();

    grecaptcha.ready(function () {
        grecaptcha.execute("6LdukTcqAAAAADjnv-dv4OZ4GoffcT8oMqnlNQJ0", { action: "submit" })
            .then(function (token) {
                // Gather data and validate it
                const firstName = document.getElementById("first-name").value;
                const lastName = document.getElementById("last-name").value;
                const email = document.getElementById("login-email").value;
                const phone = document.getElementById("login-phone").value;
                const dob = document.getElementById("date-of-birth").value;
                const gender = document.getElementById("gender").value;
                const password = document.getElementById("login-password").value;
                const confirm_password = document.getElementById("login-password2").value;
                const street = document.getElementById("street").value;
                const city = document.getElementById("city").value;
                const state = document.getElementById("state").value;
                const zip_code = document.getElementById("zip-code").value;
                const country = document.getElementById("country").value;
                const emergency_name = document.getElementById("emergency-name").value;
                const relation = document.getElementById("emergency-relation").value;
                const emergency_phone = document.getElementById("emergency-phone").value;

                // Client-side validation
                if (!/^[a-zA-Z]{2,}$/.test(firstName)) {
                    showErrorAlert("First Name", "First Name should contain only alphabets and at least 2 characters!");
                    return;
                }
                if (!/^[a-zA-Z]{2,}$/.test(lastName)) {
                    showErrorAlert("Last Name", "Last Name should contain only alphabets and at least 2 characters!");
                    return;
                }
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                    showErrorAlert("Invalid email id", "Check your email again!");
                    return;
                }
                if (!/^[1-9][0-9]{9}$/.test(phone)) {
                    showErrorAlert("Phone Number", "Phone number should be 10 digits and should not start with 0!");
                    return;
                }
                if (dob === "") {
                    showErrorAlert("Date of Birth", "Select Date Of Birth!");
                    return;
                }
                if (gender === "") {
                    showErrorAlert("Gender", "Select Gender!");
                    return;
                }
                
                if (password === "") {
                    showErrorAlert("Empty Passwords", "Are you kidding?");
                    return;
                }
                if (password !== confirm_password) {
                    showErrorAlert("Confirm Passwords", "Passwords do not match!");
                    return;
                }
                if (street === "") {
                    showErrorAlert("Address", "Empty Street!");
                    return;
                }
                if (city === "") {
                    showErrorAlert("Address", "Empty City!");
                    return;
                }

                if (state === "") {
                    showErrorAlert("Address", "Empty State!");
                    return;
                }
                if (!/^[1-9][0-9]{5}$/.test(zip_code)) {
                    showErrorAlert("Zip Code", "Zip code should be 6 digits and should not start with 0!");
                    return;
                }
                if (country === "") {
                    showErrorAlert("Address", "Empty Country!");
                    return;
                }
                if (!/^[a-zA-Z]{2,}$/.test(emergency_name)) {
                    showErrorAlert("Emergency Contact Details", "Name should contain only alphabets and at least 2 characters!");
                    return;
                }
                if (!/^[a-zA-Z]{3,}$/.test(relation)) {
                    showErrorAlert("Emergency Contact Details", "Relation should contain only alphabets and at least 3 characters!");
                    return;
                }
                if (!/^[1-9][0-9]{9}$/.test(emergency_phone)) {
                    showErrorAlert("Emergency Contact Details", "Phone number should be 10 digits and should not start with 0!");
                    return;
                }
                if(phone === emergency_phone){
                    showErrorAlert("Emergency Contact Details", "Personal and emergency contact details should not be same! ");
                    return;
                }

                // Prepare user data
                const userData = {
                    first_name: firstName,
                    last_name: lastName,
                    email: email,
                    phone: phone,
                    dob: dob,
                    gender: gender,
                    password: password,
                    confirm_password: confirm_password,
                    street: street,
                    city: city,
                    state: state,
                    zip_code: zip_code,
                    country: country,
                    emergency_name: emergency_name,
                    relation: relation,
                    emergency_phone: emergency_phone, 
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
                        
                        if(data.includes('already exists')){
                            showErrorAlert("Sign Up Failure", data);
                            return;
                        }
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
            console.log(data)
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
        footer: '<a href="/sign_in" class="bg-green-500 text-white rounded">Sign In</a>',
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