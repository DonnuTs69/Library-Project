const { Op, where } = require("sequelize")
const fs = require("fs")
const db = require("../models")
const handlebars = require("handlebars")
const User = db.User
const bcrypt = require("bcrypt")
const emailer = require("../lib/emailer")
const otpGenerator = require("otp-generator")
const { object } = require("yup")

const authController = {
  registerUser: async (req, res) => {
    try {
      const { email, username, password, gender } = req.body
      //GENERATE OTP
      // const otp = otpGenerator.generate(6, {
      //   alphabets: false,
      //   upperCase: false,
      //   specialChars: false,
      // })
      function generateRandomNumber() {
        var minm = 10000
        var maxm = 99999
        return Math.floor(Math.random() * (maxm - minm + 1)) + minm
      }
      const otp = generateRandomNumber()

      function AddMinutesToDate(date, minutes) {
        return new Date(date.getTime() + minutes * 60 * 1000)
      }
      const now = new Date()
      const expiration_time = AddMinutesToDate(now, 10)

      const findUserByEmail = await User.findOne({
        where: { email },
      })

      if (findUserByEmail) {
        return res.status(400).json({
          message: "Your email has been used",
        })
      }
      const hashedPassword = bcrypt.hashSync(password, 5)

      await User.create({
        email,
        username,
        password: hashedPassword,
        gender,
        otp: otp,
        expiration_time: expiration_time,
        verified: false,
      })
      // SENDING EMAIL
      const rawHTML = fs.readFileSync("templates/register_user.html", "utf-8")
      const compiledHTML = handlebars.compile(rawHTML)
      const htmlResult = compiledHTML({
        username,
        otp,
      })
      await emailer({
        to: email,
        html: htmlResult,
        subject: "Verify your account",
        text: "Please verify your account",
      })

      return res.status(200).json({
        message: "User registered",
      })
    } catch (err) {
      console.log(err)
    }
  },
  verifyOtp: async (req, res) => {
    try {
      const currentDate = new Date()
      const { otpInput } = req.body
      const timeLimitInMs = 5 * 60 * 1000
      const latestVerificationTime = new Date(Date.now() - timeLimitInMs)

      const otpExist = await User.findOne({
        where: {
          id: req.params.id,
        },
        attributes: ["id", "otp", "verified", "expiration_time"],
      })
      if (!otpExist || otpInput !== otpExist.otp) {
        return res.status(401).json({
          message: "Kode yang kamu masukkan salah.",
        })
      }
      if (currentDate > otpExist.expiration_time) {
        return res.status(401).json({
          message: "Kode yang kamu masukkan sudah tidak berlaku.",
        })
      }
      if (otpExist.verified) {
        return res.status(200).json({
          message: "user sudah diverifikasi",
        })
      }
      await db.User.update(
        { verified: true, otp: null, expiration_time: null },
        {
          where: {
            id: req.params.id,
          },
        }
      )
      return res.status(200).json({
        message: "User verified",
      })
    } catch (err) {
      console.log(err)
    }
  },
}

module.exports = authController
