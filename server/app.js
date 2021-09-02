const colors = require("colors");
var cors = require('cors');
const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const { notFound, errorHandler } = require("./middleware/error");
const connectDB = require("./db");
const { join } = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const { cloudinary } = require('./utils/cloudinary');
require("dotenv").config({ path: "./sample.env"});

const authRouter = require("./routes/auth");
const userRouter = require("./routes/user");
const boardsRouter = require("./routes/boards");
const calendarRouter = require('./routes/calendar')

const agendaStart = require("./utils/agenda");
let deadLineUsers;

const { json, urlencoded } = express;

connectDB();
const app = express();
const server = http.createServer(app);

const io = socketio(server, {
  cors: {
    origin: '*',
  },
});

io.on("connection", (socket) => {
  console.log("connected");
});

if (process.env.NODE_ENV === "development") {
  app.use(logger("dev"));
}
/* app.use(json()); */
/* app.use(urlencoded({ extended: false })); */
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.use(cors({origin: 'http://localhost:3000'}))
app.use(json());
app.use(urlencoded({ extended: false }));

app.use(cookieParser());
app.use(express.static(join(__dirname, "public")));

app.post("/api/upload", async (req, res) => {
  try {
    const fileStr = req.body.data;
    const username = req.body.username;
    console.log(username);
    const uploadedResponse = await cloudinary.uploader.upload(fileStr, {
      upload_preset: "KanbanCloud",
      public_id: `${username}`,
      invalidate: true,
    });
    console.log(uploadedResponse);
    res.json({ msg: "Uploaded" });
  } catch (error) {
    res.status(500).json({ err: "Something went wrong" });
  }
});



app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use("/auth", authRouter);
app.use("/users", userRouter);
app.use("/boards", boardsRouter);
app.use("/calendar", calendarRouter);

agendaStart(deadLineUsers);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "/client/build")));

  app.get("*", (req, res) =>
    res.sendFile(path.resolve(__dirname), "client", "build", "index.html")
  );
} else {
  app.get("/", (req, res) => {
    res.send("API is running");
  });
}
app.use(notFound);
app.use(errorHandler);

// Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`.red);
  // Close server & exit process
  server.close(() => process.exit(1));
});

function FindDeadlineUsers(db){
  let currDate = new Date(); 
  deadLineUsers = db.collections.find({
    "cardDetails":{
      "Deadline" : `${currDate}`
    }
  })
}

module.exports = { app, server };
