function viewPatient(button) {
    const patientId = button.getAttribute("data-patient-id");
    window.location.href = `/patient/view/${patientId}`;
}
