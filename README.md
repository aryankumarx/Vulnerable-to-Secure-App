## Vulnerability: SQL Injection in POST /auth/login
- **OWASP mapping**: A1 - Injection
- **Severity**: Critical
- **Date documented**: 2025-09-29

**1) Summary:**
The login endpoint in the application was highly vulnerable to SQL Injection (SQLi). The code used **raw string concatenation** to build the authentication query, allowing an attacker to manipulate the database logic by injecting commands through the user input fields.

**2) Threat Model and Impact**

The impact of this flaw is severe because the vulnerability exists in the primary authentication mechanism.

- **Attack Vector**: Remote, unauthenticated attacker using standard HTTP POST requests.

- **Attack Goal**: Authentication bypass and initial data reconnaissance.

### **Impact:**

  - **Full User Account Takeover (Login Bypass):** The PoC demonstrated logging in as the first user (`alice`) without knowing the password.

   - **Data Exfiltration:** An attacker could potentially use advanced SQLi techniques (e.g., UNION attacks) to dump the entire users table or sensitive data from other tables.

  - **Database Integrity Compromise:** Could be pivoted to other DB-level attacks (e.g., updating or deleting data or escalating privileges).

**3) Affected Components**

- **Service**: Node.js Express App

- **Endpoint**: ```POST /auth/login```

- **File**: ``index.js`` (Vulnerable lines were in the ``app.post('/auth/login', ...)`` handler)

- **DB**: users table (Postgres)


**4) Proof of Concept (PoC)**
The following payload successfully exploited the vulnerability by injecting an unconditional TRUE statement and commenting out the rest of the query.

Payload: ```' OR '1'='1' --  ```

### **Execution Commands**

To execute the PoC, run the appropriate command for your terminal environment:

❖ **Standard Shell (Bash/Cmd/Linux)**
```
curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"anything' OR '1'='1' -- \",\"password\":\"whatever\"}"
```
❖ **PowerShell (Windows)**
```
Invoke-WebRequest -Method Post -Uri http://localhost:3000/auth/login -Headers @{"Content-Type"="application/json"} -Body '{"email":"anything'' OR ''1''=''1'' -- ","password":"whatever"}'
```

***Expected result***: The server returns status code 200 and a JSON object for the user ``alice``, bypassing all authentication checks.

**Screenshots / output**

- docs/screenshots/sqli-1.png (Screenshot of successful login)

- docs/screenshots/sqli-output.txt (Raw JSON output)

**5) Mitigation and Fix:**

The vulnerability was permanently fixed by rewriting the query using ***parameterized queries*** (prepared statements) with the `pg` driver.

### **Remediation Plan**

**1. Stop using string concatenation for building SQL queries.**

**2. Replace dynamic values (`${email}`, `${password}`) with numbered placeholders (`$1`, `$2`).**

**3. Pass user input as a separate array of values to the pool.query() function.**

**Secure Code Snippet (from ``index.js``):**
```
// The fix uses placeholders ($1, $2) and passes input as an array of values.

const query = `
    SELECT username, role 
    FROM users 
    WHERE username = $1 AND password = $2
`;
const values = [email, password]; 
const result = await pool.query(query, values);
```

**Verification**: When the PoC command is run against the secure version, the server returns status code 401 and the message "Invalid credentials."
