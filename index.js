import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import env from "dotenv";
import cookieparser from "cookie-parser";
import { jwtAuthMiddleware, generateToken } from "./jwt.js";
const app = express();
const port = 3000;
env.config();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cookieparser());
const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: process.env.data_base,
    password: process.env.data_base_password,
    port: process.env.data_port,
  });
db.connect();

app.get("/",(req,res)=>{
    res.render("homepage.ejs");
})
app.get("/register",(req,res)=>{
    res.render("register.ejs");
})
app.get("/login",(req,res)=>{
    res.render("register.ejs");
})
app.post("/register", async (req, res) => {
    const email = req.body.username;
    const password = req.body.password;
    try {
        const checkResult = await db.query("SELECT * FROM users WHERE email = $1", [email]);
        if (checkResult.rows.length > 0) {
            res.send("Email already exists. Try logging in.");
        } else {
            const result = await db.query(
                "INSERT INTO users (email, password) VALUES ($1, $2)",
                [email, password]
            );
            res.render("homepage.ejs");
        }
    } catch (err) {
        console.log(err);
    }
});

app.post("/login", async (req, res) => {
    const email = req.body.username;
    const password = req.body.password;
    const payload={
        email:email,
        password:password
    }
    console.log("Login request received with email:", email);
    try {
        const ans = await db.query("SELECT * FROM users WHERE email = $1", [email]);
        if (ans.rows.length > 0) {
            const user = ans.rows[0];
            console.log("User found:", user);
            const storedPassword = user.password;
            if (password === storedPassword) {
                const token = generateToken(payload);
                console.log("token is:",token);
                res.cookie("token",token);
                res.redirect("/dashboard");
            } else {
                res.send("Incorrect Password");
            }
        } else {
            res.send("User not found");
        }
    } catch (err) {
        console.error("Error during login process:", err);
        res.status(500).send("An error occurred during the login process");
    }
});
app.post("/logout", jwtAuthMiddleware, (req,res)=>{
    res.redirect("/login");
});
app.get("/dashboard",jwtAuthMiddleware,(req,res)=>{
    res.render("index.ejs");
});
app.post("/adddata", jwtAuthMiddleware,async(req,res)=>{
    const expenseamt= req.body.expenseamt;
    const description = req.body.expdescription;
    const category=req.body.option;
    try{
        const result = await db.query("INSERT INTO expenses (amount,description,category,date) VALUES ($1,$2,$3,NOW())",[expenseamt, description, category]);
        res.redirect("/dashboard");
    }
    catch(err){
        console.log(err);
        res.status(500).send("An error occurred while adding the data");
    }
});
app.get("/fetchdata", jwtAuthMiddleware, async (req, res) => {
    try {
        const result = await db.query("SELECT * FROM expenses ORDER BY date DESC");
        res.json(result.rows);
    } catch (err) {
        console.error("Error fetching data:", err);
        res.status(500).send("An error occurred while fetching data");
    }
});
app.delete("/deleteexpense/:id",jwtAuthMiddleware, async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query("DELETE FROM expenses WHERE id = $1", [id]);
        res.status(200).send("Expense deleted successfully");
    } catch (err) {
        console.error("Error deleting expense:", err);
        res.status(500).send("An error occurred while deleting the expense");
    }
});
app.patch("/editexpense/:id",jwtAuthMiddleware, async(req, res) => {
    const { id } = req.params;
    console.log(id);
    const { amount, description, category } = req.body;
    const query = 'UPDATE expenses SET amount = $1, description = $2, category = $3, date = NOW() WHERE id = $4 RETURNING *';
    const values = [amount, description, category, id];
    console.log("Received data for updating expense:", req.body);
    try {
      const result = await db.query(query, values);
      res.status(200).json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).send('Server Error');
    }
  });
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
  