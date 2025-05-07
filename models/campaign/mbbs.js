import mongoose from "mongoose";
import validator from "validator";

const ALLOWED_COUNTRIES = [
  "Russia",
  "Kazakhstan",
  "Kyrgyzstan",
  "Philippines",
  "Uzbekistan",
  "Georgia",
  "Serbia",
  "Romania",
  "Poland",
  "Greece",
  "Italy",
];

const mbbsCampaignSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a name"],
      trim: true,
    },
    mobile: {
      type: String,
      required: [true, "Please enter your phone number"],
      validate: {
        validator: (v) => /^\d{10}$/.test(v),
        message: "Mobile number must be 10 digits",
      },
    },
    isWhatsappSameAsMobile: {
      type: Boolean,
      required: [true, "Please specify if WhatsApp number is same as mobile"],
    },
    whatsappNumber: {
      type: String,
      required: function () {
        return !this.isWhatsappSameAsMobile;
      },
      validate: {
        validator: (v) => /^\d{10}$/.test(v),
        message: "WhatsApp number must be 10 digits",
      },
    },
    email: {
      type: String,
      required: [true, "Please provide an email"],
      unique: true,
      lowercase: true,
      validate: {
        validator: validator.isEmail,
        message: "Not a valid email address",
      },
    },
    gender: {
      type: String,
      required: [true, "Please select your gender"],
      enum: ["Male", "Female", "Other"],
    },
    city: {
      type: String,
      required: [true, "Please provide city"],
      trim: true,
    },
    state: {
      type: String,
      required: [true, "Please provide state"],
      trim: true,
    },
    pincode: {
      type: String,
      required: [true, "Please provide pincode"],
      trim: true,
    },
    qualification: {
      type: String,
      required: [true, "Please provide your qualification"],
      enum: ["12th Exam", "NEET Dropper"],
    },
    percentage12: {
      type: Number,
      required: [true, "Please provide your 12th percentage/grades"],
      min: 0,
      max: 100,
    },
    board: {
      type: String,
      required: [true, "Please select board of education"],
      enum: ["CBSE", "ICSE", "State Board"],
    },
    hasAppearedNeet: {
      type: Boolean,
      required: [true, "Please specify if you have appeared for NEET"],
    },
    neetAttemptYears: {
      type: [Number],
      validate: {
        validator: function (arr) {
          if (!this.hasAppearedNeet) return true;
          return (
            Array.isArray(arr) &&
            arr.every((year) => [2024, 2025].includes(year))
          );
        },
        message: "NEET attempt year must be either 2024 or 2025",
      },
      required: function () {
        return this.hasAppearedNeet;
      },
    },
    neetRollNumber: {
      type: String,
      required: function () {
        return this.hasAppearedNeet;
      },
      validate: {
        validator: function () {
          if (this.hasAppearedNeet) return true;
        },
        message: "NEET Roll Number Required !",
      },
      trim: true,
    },
    expectedNeetMarks: {
      type: Number,
      min: 0,
      max: 720,
      required: function () {
        return this.hasAppearedNeet;
      },
    },
    selectedCountry: {
      type: [String],
      validate: {
        validator: function (value) {
          if (!Array.isArray(value) || value.length === 0 || value.length > 3)
            return false;
          return value.every((c) => ALLOWED_COUNTRIES.includes(c));
        },
        message: "Select 1 to 3 valid countries",
      },
    },
    preferredIntakeYear: {
      type: Number,
      required: [true, "Please select preferred intake year"],
      min: 2025,
      max: 2030,
    },
    hasPassport: {
      type: Boolean,
      required: [true, "Please specify if you have a passport"],
    },
    hasAppliedBefore: {
      type: Boolean,
      required: [true, "Please specify if you have applied abroad before"],
    },
    siblingsAbroad: {
      type: Boolean,
      required: [true, "Please specify if you have siblings or friends abroad"],
    },
    interestedInScholarships: {
      type: String,
      required: [true, "Please specify interest in scholarships or loans"],
      enum: ["Yes", "No", "Maybe"],
    },
    specificQuestions: {
      type: String,
    },
    agreement: {
      type: Boolean,
      required: [true, "Agreement is required"],
      validate: {
        validator: (v) => v === true,
        message: "You must agree to confirm authenticity",
      },
    },
  },
  { timestamps: true }
);

const MBBS_InterestedUser = mongoose.model("campaign_mbbs", mbbsCampaignSchema);

export default MBBS_InterestedUser;
