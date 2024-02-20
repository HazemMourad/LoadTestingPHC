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
    { duration: '1m', target: 10 },  // Ramp up to 10 VUs over 1 minute
    { duration: '1m', target: 100 }, // Spike up to 100 VUs over 1 minute
    { duration: '5m', target: 100 }, // Stay at 100 VUs for 5 minutes
    { duration: '1m', target: 10 },  // Ramp down to 10 VUs over 1 minute
    { duration: '1m', target: 0 },   // Ramp down to 0 VUs over 1 minute
  ],
  thresholds: {
    'http_req_duration{status:200}': ['p(95)<500'],  // Ensure 95% of requests are under 500ms
    'http_req_failed': ['rate<0.01'],  // Keep HTTP failures below 1%
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
  //sleep(1);
  sleep(10);
}