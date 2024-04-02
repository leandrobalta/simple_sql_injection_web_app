const sqlite = require("better-sqlite3");
const express = require("express");
const path = require("path");
const app = express();
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

const db = new sqlite(path.resolve("main.db"), { fileMustExist: true });

function isSqlInjection(query) {
    // https://regexr.com/
    const blacklist = ['"',"'", ";", "--", "=", "%", "LIKE", "*", "(", ")","AND", "OR", "UNION", "SELECT", "FROM", "WHERE", "INSERT", "DELETE", "UPDATE", "DROP", "CREATE", "ALTER", "TABLE", "DATABASE"];

    for (let i = 0; i < blacklist.length; i++) {
        if (query.includes(blacklist[i]) || query.includes(blacklist[i].toLowerCase())){
            return true;
        }
    }

    return false;
}

app.get("/", function (req, res) {
    res.sendFile(path.join(__dirname, "public/index.html"));
});

app.post("/login", function (req, res) {

    const { username, password, injectionAllowed, useCustomVerification } = req.body;

    let query = `SELECT * FROM user WHERE username = '${username}' AND password = '${password}'`;

    if (!injectionAllowed) {
        if (useCustomVerification) {
            if (isSqlInjection(username) || isSqlInjection(password)) return res.json({ success: false, message: "Nice try | SQL Injection detected!!! | QUERY: " + query});
        }
        else{
            query = `SELECT * FROM user WHERE username = ? AND password = ?`;
        }
    }

    console.log("QUERY: " + query)

    const user = injectionAllowed ? db.prepare(query).get() : useCustomVerification ? db.prepare(query).get() : db.prepare(query).get(username, password);
    console.log(user);

    if (user) {
        res.json({ success: true, user, message: "Login successful | FLAG: flag{sql_injection_is_bad}"});
    } else {
        res.json({ success: false, message: "Invalid Credentials | QUERY: " + query});
    }    
});

app.listen(32000, () => console.log("Server is running on Port 32000"));
