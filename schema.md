Users
    UserID (Primary Key)
    FullName
    Email
    PasswordHash
    Role (Patient, Psychologist, Admin)      

Patients
    PatientID (Primary Key)
    UserID (Foreign Key from Users)
    DateOfBirth
    Gender
    Address
    PhoneNumber
    PrimaryPsychologistID (Foreign Key from Psychologists)

Psycologist                                  
    PsychologistID (Primary Key)
    UserID (Foreign Key from Users)
    Specialization
    LicenseNumber
    PhoneNumber
    OfficeAddress 
6
Appointments
    Appointment5ID (Primary Key)
    PatientID (Foreign Key from Patients)
    PsychologistID (Foreign Key from Psychologists)
    AppointmentDate
    AppointmentTime
    Status (Scheduled, Completed, Missed)

MedicalHistory
    HistoryID (Primary Key)
    PatientID (Foreign Key from Patients)
    Condition
        Dosage
    otes

PsychologicalAssessments
    AssessmentID (Primary Key)
    PatientID (Foreign Key from Patients)
    AssessmentDate
    TypeOfAssessment
    Results
    PsychologistID (Foreign Key from Psychologists)

Treatments
    TreatmentID (Primary Key)
    PatientID (Foreign Key from Patients)
    PsychologistID (Foreign Key from Psychologists)
    TreatmentPlan
    StartDate
    EndDate
    Notes

Billing
    BillingID (Primary Key)
    PatientID (Foreign Key from Patients)
    AppointmentID (Foreign Key from Appointments)
    Amount
    PaymentStatus (Paid, Unpaid)
    PaymentDate

Consents(Not mandatory)
    ConsentID (Primary Key)
    PatientID (Foreign Key from Patients)
    ConsentType
    SignedDate
    DocumentPath

Prescrption online
(
    name, adr, age ,M/F, Phone number, Dignosis
)
    Note
    Medicine
    Medicine-Sceduleooio

___________________________________________________________________________________________________
****************************changes to be done before deploying***********************************
* email id to send emails
* recaptcha
* strong password validation
* fetching city, state, zipcode for address


___________________________________________________________________________________________________
****************************Long Term changes ***********************************
* Doctor signup Approval System 

