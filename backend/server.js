const express = require("express");
const { engine } = require("express-handlebars");
const asyncHandler = require("express-async-handler");
const UserModel = require("./models/UserModel");
const RoleModel = require("./models/RoleModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

require("colors");

const path = require("path");
const connectDB = require("../config/connectDB");
const pageNotFound = require("./middlewares/pageNotFound");
const errorHandler = require("./middlewares/errorHandler");
const authMiddleWare = require("./middlewares/authMiddleWare");
const sendEmail = require("./services/sendEmail");

const configPath = path.join(__dirname, "..", "config", ".env");

require("dotenv").config({ path: configPath });

const app = express();

app.use(express.static('public'))

app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", "backend/views");

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/about", (req, res) => {
  res.render("about");
});

app.get("/contact", (req, res) => {
  res.render("contact");
});

app.post("/sended", async (req, res) => {
  try {
    await sendEmail(req.body);
    res.render("sended", {
      message: "Contact form send ok",
      name: req.body.userName,
      email: req.body.userEmail,
    });
  } catch (error) {
    res.status(400).json({ code: 400, message: error.message });
  }
});

//Registration - збереження користувача в базу даних

app.get('/register', (req, res) => res.render('register'))

app.post(
  "/register",
  asyncHandler(async (req, res) => {
    // 1. Отримуєм і валідуєм дані від користувача
    //2. Шукаєм користувача в базі
    //3. Якщо знайшли - повідомляєм помилку
    //4. Якщо не найшли - хешуєм пароль і видаємо роль
    //5. Зберігаєм користувача з захешованим паролем

    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400);
      throw new Error("Please provite all required fields");
    }

    const candidate = await UserModel.findOne({ email });
    if (candidate) {
      res.status(400);
      throw new Error("User already exists");
    }

    const hashPassword = bcrypt.hashSync(password, 5);
    const role = await RoleModel.findOne({
      value: "USER",
    });

    // console.log(role);

    const user = await UserModel.create({
      ...req.body,
      password: hashPassword,
      roles: [role.value],
    });

    // res.status(201).json({
    //   code: 201,
    //   msg: "OK",
    //   data: { email: user.email, name: user.name },
    // });
    res.status(201)
    res.render('registerOk')
  })
);

//Аутентифікація - перевірка введених даних з фактичними в базі даних
app.get('/login', (req, res) => res.render('login'))
app.post(
  "/login",
  asyncHandler(async (req, res) => {
    // 1. Отримуєм і валідуєм дані від користувача
    //2. Шукаєм користувача в базі  і розшифровуєм пароль
    //3. Якщо не найшли або не рошифрували пароль - повідомлення "Invalid login or password!"
    //4. Якщо знайшли і рошифрували пароль - видаєм токен
    //5. Додаєм токен користувачу

    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400);
      throw new Error("Please provite all required fields");
    }

    const candidate = await UserModel.findOne({ email });
    if (!candidate || !bcrypt.compareSync(password, candidate.password)) {
      res.status(400);
      throw new Error("Invalid login or password!");
    }

    const token = generateToken({
      students: ["Lesia", "Egor", "Max"],
      teacher: "Bob",
      id: candidate._id,
      roles: candidate.roles,
    });

    candidate.token = token;
    await candidate.save();

    // res.status(201).json({
    //   code: 201,
    //   msg: "OK",
    //   data: { email: candidate.email, token: candidate.token },
    // });
    res.status(200)
    res.render('loginOk')
  })
);

function generateToken(data) {
  const payload = { ...data };
  return jwt.sign(payload, "lviv", { expiresIn: "8h" });
}

//Авторизація - перевірка прав доступу

//Logout - вихід із системи

app.patch(
  "/logout",
  authMiddleWare,
  asyncHandler(async (req, res) => {
    //1. Отримуєм дані про користувача
    //2. Скидуєм токен
    // res.send(req.user)
    const { id } = req.user;
    const user = await UserModel.findById(id);
    user.token = null;
    await user.save();

    res.status(200).json({
      code: 200,
      msg: "Logout success",
    });
  })
);

app.use("/api/v1", require("./routes/carsRoutes"));

app.use("*", pageNotFound);

app.use(errorHandler);

const { PORT } = process.env;

connectDB();

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`.bold.green);
});
