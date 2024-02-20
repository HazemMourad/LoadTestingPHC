import http from 'k6/http';
import { sleep, check } from 'k6';

// Define the payload for the POST request
const payload = JSON.stringify({
  email: 'test@phc.com',
  password: '12345678'
});

// Define the HTTP options
const options_post_request = {
  headers: {
    'Content-Type': 'application/json',
  },
};

export let options = {
  stages: [
    { duration: '2m', target: 100 },  // Ramp up to 100 VUs over 2 minutes
    { duration: '5m', target: 100 },  // Stay at 100 VUs for 5 minutes (stress testing)
    { duration: '2m', target: 0 },    // Ramp down to 0 VUs over 2 minutes
  ],
  thresholds: {
    'http_req_duration{status:200}': ['p(95)<500', 'p(99)<1000'],  // Ensure 95% of requests are under 500ms and 99% under 1000ms
    'http_req_failed': ['rate<0.1'],  // Keep HTTP failures below 10%
  },
};

export default function () {
  let loginresponse= http.get('http://172.232.207.33/login');  // getting the login page 
  check(loginresponse, {
    'status is 200': (r) => r.status === 200,
    'transaction time is OK': (r) => r.timings.duration < 2000,
  })

  let res = http.post('http://172.232.207.33/login', payload, options); //post request to login 
  
  // Check if the response is successful
  check(res, {
    'Sign in successful': (r) => r.status === 200,
  });

  let response = http.get('http://172.232.207.33/patients');
  
  check(response, {
    'status is 200': (r) => r.status === 200,
    'transaction time is OK': (r) => r.timings.duration < 2000,
  });

  // Simulate user behavior by sleeping between requests
  sleep(1);
}

