import http from 'k6/http';
import { sleep, check } from 'k6';

export let options = {
  stages: [
    { duration: '2m', target: 50 },  // Ramp up to 50 VUs over 2 minutes
    { duration: '5m', target: 50 },  // Stay at 50 VUs for 5 minutes
    { duration: '2m', target: 0 },   // Ramp down to 0 VUs over 2 minutes
  ],
  thresholds: {
    'http_req_duration{status:200}': ['p(95)<500'],  // Ensure 95% of requests are under 500ms
    'http_req_failed': ['rate<0.01'],  // Keep HTTP failures below 1%
  },
};

export default function () {
  let response = http.get('http://172.232.207.33/patients');
  
  check(response, {
    'status is 200': (r) => r.status === 200,
    'transaction time is OK': (r) => r.timings.duration < 2000,
  });

  // Simulate user behavior by sleeping between requests
  sleep(1);
}