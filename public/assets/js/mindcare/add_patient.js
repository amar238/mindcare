document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("add-patient").addEventListener("submit", onPatientSubmit);
});

function onPatientSubmit(e) {
    e.preventDefault();

    // Gather data and validate it
    const firstName = document.getElementById("first-name").value;
    const lastName = document.getElementById("last-name").value;
    const email = document.getElementById("login-email").value;
    const phone = document.getElementById("login-phone").value;
    const dateOfBirth = document.getElementById("date-of-birth").value;
    const gender = document.getElementById("gender").value;
    const street = document.getElementById("street").value;
    const city = document.getElementById("city").value;
    const state = document.getElementById("state").value;
    const zipCode = document.getElementById("zip-code").value;
    const country = document.getElementById("country").value;
    const emergencyName = document.getElementById("emergency-name").value;
    const relation = document.getElementById("emergency-relation").value;
    const contactNumber = document.getElementById("emergency-phone").value;

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
        showErrorAlert("Invalid email", "Please provide a valid email address!");
        return;
    }
    if (!/^[1-9][0-9]{9}$/.test(phone)) {
        showErrorAlert("Phone Number", "Phone number should be 10 digits and should not start with 0!");
        return;
    }
    if (!dateOfBirth) {
        showErrorAlert("Date of Birth", "Date of Birth is required!");
        return;
    }
    if (!gender) {
        showErrorAlert("Gender", "Please select a gender!");
        return;
    }
    if (street === "") {
        showErrorAlert("Address", "Street address cannot be empty!");
        return;
    }
    if (city === "") {
        showErrorAlert("Address", "City cannot be empty!");
        return;
    }
    if (state === "") {
        showErrorAlert("Address", "State cannot be empty!");
        return;
    }
    if (!/^[1-9][0-9]{5}$/.test(zipCode)) {
        showErrorAlert("Zip Code", "Zip code should be 6 digits and should not start with 0!");
        return;
    }
    if (country === "") {
        showErrorAlert("Address", "Country cannot be empty!");
        return;
    }
    if (!/^[a-zA-Z]{2,}$/.test(emergencyName)) {
        showErrorAlert("Emergency Contact Name", "Emergency contact name should only contain alphabets!");
        return;
    }
    if (relation === "") {
        showErrorAlert("Relation", "Relation cannot be empty!");
        return;
    }
    if (!/^[1-9][0-9]{9}$/.test(contactNumber)) {
        showErrorAlert("Emergency Contact Number", "Emergency contact number should be 10 digits and not start with 0!");
        return;
    }

    // Prepare patient data
    const patientData = {
        firstName,
        lastName,
        email,
        phone,
        dateOfBirth,
        gender,
        street,
        city,
        state,
        zipCode,
        country,
        emergencyName,
        relation,
        contactNumber,
    };

    // Send data to server
    submitPatientData(patientData);
}

function submitPatientData(patientData) {
    fetch("/patient/create", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(patientData),
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showSuccessAlert("Patient Record Created", "The patient record has been successfully added!");
            } else {
                showErrorAlert("Error", data.message || "An error occurred while adding the patient record.");
            }
        })
        .catch(error => {
            console.error("Error:", error);
        });
}

function showSuccessAlert(title, message) {
    Swal.fire({
        title: title,
        text: message,
        icon: "success",
        confirmButtonText: "OK",
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
