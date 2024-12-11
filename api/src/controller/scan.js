const router = require("express").Router();
const ApiResponse = require("../model/ApiResponse");
const scanService = require("../service/scan");

router.post("/save", (req, res, next) => {
  scanService
    .save({ payload: req.body })
    .then((result) => {
      res.status(200).json(new ApiResponse("Scan saved!", result));
    })
    .catch((err) => next(err));
});

router.get("/getCoreDashboardData", (req, res, next) => {
  scanService
    .getCoreDashboardData({})
    .then((result) => {
      res.status(200).json(new ApiResponse(null, result));
    })
    .catch((err) => next(err));
});

router.get("/getEmployeeListWScanCount", (req, res, next) => {
  scanService
    .getEmployeeListWScanCount({
      query: req.query,
    })
    .then((result) => {
      res.status(200).json(new ApiResponse(null, result));
    })
    .catch((err) => next(err));
});

router.get("/getBusListWScanCount", (req, res, next) => {
  scanService
    .getBusListWScanCount({ query: req.query })
    .then((result) => {
      res.status(200).json(new ApiResponse(null, result));
    })
    .catch((err) => next(err));
});

module.exports = router;
