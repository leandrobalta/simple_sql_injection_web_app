const sqlite = require("better-sqlite3");
const express = require("express");
const path = require("path");
const app = express();
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

const db = new sqlite(path.resolve("main.db"), { fileMustExist: true });

app.get("/", function (req, res) {
    res.sendFile(path.join(__dirname, "public/index.html"));
});

app.post("/login", function (req, res) {

    const { username, password, injectionAllowed } = req.body;

    const query = injectionAllowed
        ? `SELECT * FROM user WHERE username = '${username}' AND password = '${password}'`
        : `SELECT * FROM user WHERE username = ? AND password = ?`;

    const user = injectionAllowed ? db.prepare(query).get() : db.prepare(query).get(username, password);
    if (user) {
        res.json({ success: true, user, message: "Login successful | FLAG: flag{sql_injection_is_bad}"});
    } else {
        res.json({ success: false, message: "Invalid credentials | QUERY: " + query});
    }    
});

app.listen(32000, () => console.log("Server is running on Port 32000"));
