const jwt = require("jsonwebtoken");
const CustomError = require("../model/CustomError");
const { sql } = require("../db");
const { hash, compare } = require("bcrypt");
const { generatePassResetContent, appInfo } = require("../others/util");
const { VUE_BASE_URL } = process.env;
const { v4: uuidv4 } = require("uuid");
const { sendMail } = require("./sendMail");

const generateAuthData = (result) => {
  let token = "";
  let currentUser = {};
  if (result) {
    currentUser = {
      id: result.id,
      role: Number(result.role), // role 10 = admin, 20 = manager
      name: result.name,
    };
    token = jwt.sign({ currentUser }, process.env.TOKEN_SECRET);
  }
  return { token, currentUser };
};

exports.save = async ({ payload }) => {
  const hashedPassword = await hash(payload.password, 10);
  const user = {
    ...payload,
    password: hashedPassword,
    role: payload.role || 20,
    createdAt: new Date(),
  };
  let savedUser = null;
  try {
    [savedUser] = await sql`
            insert into users ${sql(user)} on conflict(id) do
            update set ${sql(user)} returning *`;
  } catch (err) {
    if (err.code === "23505")
      throw new CustomError("Email already taken!", 409);
    else throw err;
  }
  return savedUser;
};

exports.signin = async ({ payload: { email, password } }) => {
  const result = await sql`
        select *
        from users
        where email = ${email}`;
  if (result.length === 0) {
    throw new CustomError("Incorrect email/password!", 401);
  }
  const user = result[0];
  const isPasswordValid = await compare(password, user.password); // Compare hashed password
  if (!isPasswordValid) {
    throw new CustomError("Incorrect email/password!", 401);
  }
  return generateAuthData(user);
};

exports.getUserByEmail = async ({ email }) => {
  const [user] = await sql`
        select *
        from users
        where email = ${email}`;
  return user;
};

exports.getUserById = async ({ id }) => {
  const [user] = await sql`
        select *
        from users
        where id = ${id}`;
  return user;
};

exports.requestResetPass = async ({ payload: { resetEmail } }) => {
  const fetchedUser = await exports.getUserByEmail({ email: resetEmail });
  if (!fetchedUser) throw new CustomError("User doesn't exist!");

  const reset = {
    userId: fetchedUser.id,
    email: resetEmail,
    token: uuidv4(),
    createdAt: new Date(),
  };
  const [savedReq] = await sql`
        insert into password_reset ${sql(reset)} on conflict(id) do
        update set ${sql(reset)}
            returning *`;

  const html = generatePassResetContent(savedReq.token, VUE_BASE_URL);
  return sendMail(resetEmail, `${appInfo.name} Password reset link`, html);
};

exports.submitResetPass = async ({ payload: { token, newPass } }) => {
  const [reset] = await sql`
        select *
        from password_reset
        where token = ${token}`;
  if (!reset) throw new CustomError("Invalid request!");

  const expirationMillis = reset.createdAt.getTime() + 3600000; // 1 hour in milliseconds
  if (expirationMillis < Date.now())
    throw new CustomError("Password reset link expired!");

  const fetchedUser = await exports.getUserById({ id: reset.userId });

  const savedUser = await exports.save({
    payload: { ...fetchedUser, password: newPass },
  });
  return savedUser;
};
