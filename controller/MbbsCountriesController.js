import MbbsCountry from "../models/mbbsCountries.js";

export const getAllCountries = async (req, res) => {
  try {
    const countries = await MbbsCountry.find();
    res.status(200).json({ success: true, total: countries.length, countries });
  } catch (error) {
    console.error("Error fetching countries:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const createCountry = async (req, res) => {
  try {
    const body = req.body;
    const country = new MbbsCountry(body);
    await country.save();
    res.status(201).json({ success: true, country });
  } catch (error) {
    console.error("Error creating country:", error);
    res.status(400).json({ success: false, message: "Bad Request" });
  }
};

export const getCountryById = async (req, res) => {
  try {
    const { id } = req.params;
    const country = await MbbsCountry.findById(id);
    if (!country) {
      return res.status(404).json({ success: false, message: "Country not found" });
    }
    res.status(200).json({ success: true, country });
  } catch (error) {
    console.error("Error fetching country by ID:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const updateCountryById = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const updatedCountry = await MbbsCountry.findByIdAndUpdate(id, updates, { new: true });
    if (!updatedCountry) {
      return res.status(404).json({ success: false, message: "Country not found" });
    }
    res.status(200).json({ success: true, country: updatedCountry });
  } catch (error) {
    console.error("Error updating country:", error);
    res.status(400).json({ success: false, message: "Bad Request" });
  }
};

export const deleteCountryById = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedCountry = await MbbsCountry.findByIdAndDelete(id);
    if (!deletedCountry) {
      return res.status(404).json({ success: false, message: "Country not found" });
    }
    res.status(200).json({ success: true, message: "Country deleted" });
  } catch (error) {
    console.error("Error deleting country:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
