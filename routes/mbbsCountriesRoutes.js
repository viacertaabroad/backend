import express from "express";
import {
  getAllCountries,
  createCountry,
  getCountryById,
  updateCountryById,
  deleteCountryById,
} from "../controller/MbbsCountriesController.js";

const router = express.Router();

// RESTful API routes
router.get("/", getAllCountries);
router.post("/", createCountry);
router.get("/:id", getCountryById);
router.put("/:id", updateCountryById);
router.delete("/:id", deleteCountryById);

export default router;
