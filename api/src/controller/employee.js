const router = require("express").Router();
const ApiResponse = require("../model/ApiResponse");
const employeeService = require("../service/employee");

router.post("/save", (req, res, next) => {
  employeeService
    .save({ payload: req.body })
    .then((result) => {
      res.status(200).json(new ApiResponse("Employee saved!", result));
    })
    .catch((err) => next(err));
});

router.get("/search", (req, res, next) => {
  employeeService
    .search({ query: req.query.query })
    .then((result) => {
      res.status(200).json(new ApiResponse(null, result));
    })
    .catch((err) => next(err));
});

router.post("/verifyQrcode", (req, res, next) => {
  employeeService
    .verifyQrcode({ payload: req.body })
    .then((result) => {
      res.status(200).json(new ApiResponse(null, result));
    })
    .catch((err) => next(err));
});
module.exports = router;
