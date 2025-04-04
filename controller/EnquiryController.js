import Enquiry_Form from "../models/enquiryForm.js";
import { addToSheet } from "../config/sheetConfig.js";
import errorResponse from "../helpers/errorHandler.js";
import { sendEmail } from "../utils/sendMail.js";

const createEnquiry = async (req, res) => {
  try {
    const { name, email, mobile } = req.body;

    if (!name || !email || !mobile) {
      // return res.status(400).json({
      //   success: false,
      //   message: "All fields are required",
      // });

      return errorResponse(res, 400, "Name, email and mobile are required");
    }

    const existingUser = await Enquiry_Form.findOne({ email });
    if (existingUser) {
      // return res.status(409).json({
      //   success: false,
      //   message: "User has already booked counseling.",
      // });
      return errorResponse(res, 409, "User has already booked counseling");
    }

    // const user = new Enquiry_Form({ name, email, mobile });
    // await user.save();

    const newEnquiry = await Enquiry_Form.create({ name, email, mobile });

    sendEmail(process.env.EMAIL_SEND_TO, newEnquiry, "counselingForm");

    const currentDate = new Date().toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
    });

    addToSheet(
      "enquiry",
      [name, email, mobile, currentDate],
      ["Name", "Email", "Mobile", "Timestamp"]
    );
    console.log("New Enqiry Created");

    return res.status(201).json({
      success: true,
      data: {
        id: newEnquiry._id,
        name: newEnquiry.name,
        email: newEnquiry.email,
        mobile: newEnquiry.mobile,
        createdAt: newEnquiry.createdAt,
      },
    });
  } catch (error) {
    console.error("Server error:", error);
    // res.status(500).json({
    //   success: false,
    //   message: "Internal Server Error",
    // });
    return errorResponse(res, 500, "Failed to create enquiry", error);
  }
};

const getAllEnquires = async (req, res) => {
  try {
    // const users = await Enquiry_Form.find({});

    // res.status(200).json({
    //   success: true,
    //   totalUsers: users.length,
    //   users,
    // });

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Get enquiries with pagination

    const [enquiries, total] = await Promise.all([
      Enquiry_Form.find({})
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Enquiry_Form.countDocuments(),
    ]);

    return res.status(200).json({
      success: true,
      total,
      page,
      count: enquiries.length,
      pages: Math.ceil(total / limit),
      data: enquiries.map((enquiry) => ({
        id: enquiry._id,
        name: enquiry.name,
        email: enquiry.email,
        mobile: enquiry.mobile,
        createdAt: enquiry.createdAt,
      })),
    });
  } catch (error) {
    console.error("Server error:", error);
    // res.status(500).json({
    //   success: false,
    //   message: "Internal Server Error",
    // });
    return errorResponse(res, 500, "Failed to fetch enquiries", error);
  }
};

export { createEnquiry, getAllEnquires };
