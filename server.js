const express = require("express")
const mysql = require("mysql")
const BodyParser = require("body-parser")
const app = express();

const http = require("http")
const server = http.createServer(app)
const {Server} = require("socket.io")
const io = new Server(server)

app.use(BodyParser.urlencoded({ extended: true }))

app.set("view engine", "ejs")
app.set("views", "views")

const db = mysql.createConnection({
    host: "localhost",
    database: "db_siswa",
    user: "root",
    password: ""
})

//create db connection
db.connect((err) => {
    if (err) throw err
    console.log("Databse connected ...")

    //for get data from database
    app.get("/", (req, res) => {
        const sql = "SELECT * FROM siswa"
        db.query(sql, (err, result) => {
            const users = JSON.parse(JSON.stringify(result))
            res.render("index", {users: users, title:"Database Siswa"})
        })
    })

    //real-time chat  
    app.get("/chat", (req, res) => {
        res.render("chat", { 
            loginTitle: "MASUK FORUM", 
            chatroomTitle: "DISKUSI TERBUKA"
        })
    })

    //for insert data to database
    app.post("/tambah", (req, res) => {
        const insertSql = `INSERT INTO siswa (nama, kelas) VALUES ('${req.body.nama}', '${req.body.kelas}');`
        db.query(insertSql, (err, result) => {
            if (err) throw err
            res.redirect("/");
        })
    })

    //for delete data from database
    app.post("/hapus", (req, res) => {
        const deleteSql = `DELETE FROM siswa WHERE nama="${req.body.hapusnama}";`
        db.query(deleteSql, (err, result) => {
            if (err) throw err
            res.redirect("/");
        })
    })
})

//socket io connection and set id
io.on("connection", (socket) => {
    socket.on("message", (data) => {
        const { id, message } = data
        socket.broadcast.emit("message", id, message)
    })
})

server.listen(8000, () => {
    console.log("Server ready ....")
})