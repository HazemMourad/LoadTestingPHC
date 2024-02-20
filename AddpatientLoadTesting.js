import http from 'k6/http';
import { sleep, check } from 'k6';
// options for load testing 
export let options = {
  stages: [
    { duration: '2m', target: 50 },  // Ramp up to 50 VUs over 2 minutes
    { duration: '6m', target: 50 },  // Stay at 50 VUs for 5 minutes
    { duration: '2m', target: 0 },   // Ramp down to 0 VUs over 2 minutes
  ],
  thresholds: {
    'http_req_duration{status:200}': ['p(95)<500'],  // Ensure 95% of requests are under 500ms
    'http_req_failed': ['rate<0.01'],  // Keep HTTP failures below 1%
  },
};


// Function to handle login
function login() {
  const payload_login = JSON.stringify({
   email: 'test@phc.com',
   password: '12345678'
  });

  const options_post_request = {
    headers: {
      'Content-Type': 'application/json',
    },
  };
  
let loginresponse= http.get('http://172.232.207.33/login');  // getting the login page 
  check(loginresponse, {
    'status is 200': (r) => r.status === 200,
    'transaction time is OK': (r) => r.timings.duration < 2000,
  })
  
  let loginResponse = http.post('http://172.232.207.33/login', payload_login, options,options_post_request);
  check(loginResponse, {
    'Login successful': (r) => r.status === 200,
  });

  return loginResponse.cookies;
}

// function to generate random name 
function generateRandomName() {
  
  let firstName = ['John', 'Jane', 'David', 'Emily', 'Michael', 'Sophia','Joon', 'Jade', 'David', 'Eily', 'Michel', 'Sopia']; // Sample list of first names
  let lastName = ['Smith', 'Johnson', 'Brown', 'Lee', 'Garcia', 'Martinez','Smth',
   'Johson', 'Brwn', 'Lez', 'Gacia', 'Martine','John', 'Jane', 'David', 'Emily', 'Michael', 'Sophia','Joon', 'Jade', 'David', 'Eily', 'Michel', 'Sopia'];
  var randomFirstName = firstName[Math.floor(Math.random() * firstName.length)];
  var randomLastName = lastName[Math.floor(Math.random() * lastName.length)];

  return randomFirstName + ' ' + randomLastName;
}
// Function to generate a random email
function generateRandomEmail() {
  const domains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'example.com']; // Sample list of email domains

  const randomName = generateRandomName().toLowerCase().replace(' ', ''); // Generate a random name and convert to lowercase
  const randomDomain = domains[Math.floor(Math.random() * domains.length)];
  return randomName + '@' + randomDomain;
}

function generateRandomPhoneNumber() {
  const countryCode = '0'; // Sample country code (change as needed)
  let phoneNumber = countryCode;

  // Generate the rest of the phone number digits randomly
  for (let i = 0; i < 15; i++) {
    phoneNumber += Math.floor(Math.random() * 10);
  }

  return phoneNumber;
}
function generateInsuranceNumber() {
  // Generate a random number with at least 6 digits
  return Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;
}

const nationalityOptions = ['Egyptian', 'Non-Egyptian', 'Saudi'];
const nationality_ = nationalityOptions[Math.floor(Math.random() * nationalityOptions.length)];
const genderOptions = ['male', 'female', 'both'];
const gender_ = genderOptions[Math.floor(Math.random() * genderOptions.length)];
let generateRandomName_ =generateRandomName();
let generateRandomEmail_= generateRandomEmail();
let PhoneNumber_ =generateRandomPhoneNumber();
let generateInsuranceNumber_=generateInsuranceNumber();



// Function to add a patient
function addPatient(cookies) {
const payload_patient = JSON.stringify({
    name: generateRandomName_ ,
    insuranceNumber: generateInsuranceNumber_, // Randomly generated insurance number
    age: Math.floor(Math.random() * 100) + 1, // Random age between 1 and 100
    gender: gender_, // Change to 'Female' if needed
    nationality: nationality_, // Change to an appropriate value
    firstMobile:PhoneNumber_ , // Change to a valid phone number
    secondMobile:PhoneNumber_ , // Change to a valid phone number
    mail: generateRandomEmail_, // Change to a valid email address
  });
  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
    cookies: cookies,
  };
 

  let addPatientResponse = http.post('http://172.232.207.33/patients', payload_patient,params,options);
  check(addPatientResponse, {
    'Patient added successfully': (r) => r.status === 200,
  });
}
export default function () {
  let cookies = login(); // Login and obtain cookies
  addPatient(cookies); // Add a patient
  sleep(5);
}


