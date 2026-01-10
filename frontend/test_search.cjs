const http = require("http");

const options = {
  hostname: "localhost",
  port: 8000,
  path: "/api/products?search=phone",
  method: "GET",
  headers: {
    Accept: "application/json",
  },
};

const req = http.request(options, (res) => {
  let data = "";
  res.on("data", (chunk) => {
    data += chunk;
  });
  res.on("end", () => {
    console.log(`Status: ${res.statusCode}`);
    console.log(`Body: ${data.substring(0, 500)}...`); // Print first 500 chars
  });
});

req.on("error", (e) => {
  console.error(`problem with request: ${e.message}`);
});

req.end();
