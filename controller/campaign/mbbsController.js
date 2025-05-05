import { addToSheet } from "../../config/sheetConfig.js";
import MBBS_InterestedUser from "../../models/campaign/mbbs.js";
import { sendEmail } from "../../utils/sendMail.js";

const newMBBS_InterestedUser = async (req, res) => {
  const {
    name,
    mobile,
    isWhatsappSameAsMobile,
    whatsappNumber,
    email,
    gender,
    city,
    state,
    pincode,
    qualification,
    percentage12,
    board,
    hasAppearedNeet,
    neetAttemptYears,
    neetRollNumber,
    expectedNeetMarks,
    selectedCountry,
    preferredIntakeYear,
    hasPassport,
    hasAppliedBefore,
    siblingsAbroad,
    interestedInScholarships,
    specificQuestions,
    agreement,
  } = req.body;

  const required = [
    name,
    mobile,
    email,
    gender,
    city,
    state,
    pincode,
    qualification,
    percentage12,
    board,
    hasAppearedNeet,
    selectedCountry,
    preferredIntakeYear,
    hasPassport,
    hasAppliedBefore,
    siblingsAbroad,
    interestedInScholarships,
    agreement,
  ];

  if (required.some((f) => f === undefined || f === null || f === "")) {
    return res.status(400).json({
      success: false,
      message: "All required fields must be provided",
    });
  }

  if (!isWhatsappSameAsMobile && !whatsappNumber) {
    return res.status(400).json({
      success: false,
      message: "WhatsApp number is required",
    });
  }

  if (
    hasAppearedNeet &&
    (!Array.isArray(neetAttemptYears) || neetAttemptYears.length === 0)
  ) {
    return res.status(400).json({
      success: false,
      message: "Provide NEET attempt year(s)",
    });
  }

  const newUser = new MBBS_InterestedUser({
    name,
    mobile,
    isWhatsappSameAsMobile,
    whatsappNumber: isWhatsappSameAsMobile ? mobile : whatsappNumber,
    email,
    gender,
    city,
    state,
    pincode,
    qualification,
    percentage12,
    board,
    hasAppearedNeet,
    neetAttemptYears,
    neetRollNumber,
    expectedNeetMarks,
    selectedCountry,
    preferredIntakeYear,
    hasPassport,
    hasAppliedBefore,
    siblingsAbroad,
    interestedInScholarships,
    specificQuestions,
    agreement,
  });

  try {
    await newUser.save();
  } catch (err) {
    if (err.name === "ValidationError") {
      const errors = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors,
      });
    }

    if (err.code === 11000 && err.keyPattern?.email) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    console.error("Save error:", err);
    return res.status(500).json({
      success: false,
      message: "Database error",
    });
  }

  // Send email (non-blocking)
  sendEmail (process.env.EMAIL_SEND_TO, newUser, "mbbs_Users").catch((err) =>
    console.error("Email send error:", err)
  );
  
  // Add to Google Sheet (non-blocking)
  const timestamp = new Date().toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
  });

  addToSheet(
    "mbbs",
    [
      name,
      email,
      mobile,
      isWhatsappSameAsMobile ? mobile : whatsappNumber,
      gender,
      city,
      state,
      pincode,
      qualification,
      percentage12,
      board,
      hasAppearedNeet,
      (neetAttemptYears || []).join(","),
      neetRollNumber,
      expectedNeetMarks,
      selectedCountry.join(","),
      preferredIntakeYear,
      hasPassport,
      hasAppliedBefore,
      siblingsAbroad,
      interestedInScholarships,
      specificQuestions,
      timestamp,
    ],
    [
      "Name",
      "Email",
      "Mobile",
      "WhatsApp",
      "Gender",
      "City",
      "State",
      "Pincode",
      "Qualification",
      "Percentage12",
      "Board",
      "HasAppearedNeet",
      "NeetAttemptYears",
      "NeetRollNumber",
      "ExpectedNeetMarks",
      "SelectedCountries",
      "PreferredIntakeYear",
      "HasPassport",
      "HasAppliedBefore",
      "SiblingsAbroad",
      "InterestedInScholarships",
      "SpecificQuestions",
      "Timestamp",
    ]
  ).catch((err) => console.error("Sheet add error:", err));

  res.status(201).json({
    success: true,
    message: "Entry created successfully",
    data: newUser,
  });
};

const getAllMbbsUsers = async (req, res) => {
  try {
    const users = await MBBS_InterestedUser.find({});
    res.status(200).json({
      success: true,
      totalUsers: users.length,
      data: users,
    });
  } catch (err) {
    console.error("Fetch error:", err);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export { newMBBS_InterestedUser, getAllMbbsUsers };
