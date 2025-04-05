import errorResponse from "../../helpers/errorHandler.js";
import Course from "../../models/courses.js";

const newCourse = async (req, res) => {
  try {
    const {
      name,
      admissionClosingDate,
      universityName,
      destinationCountry,
      postStudyWorkVisaEligibility,
      tuitionFeesOnCampus,
      durationOnCampus,
      imageUrl,
    } = req.body;

    // Validate required fields
    if (
      !name ||
      !admissionClosingDate ||
      !universityName ||
      !destinationCountry ||
      !postStudyWorkVisaEligibility ||
      !tuitionFeesOnCampus ||
      !durationOnCampus
    ) {
      // return res.status(400).json({
      //   success: false,
      //   message: "All fields are required except imageUrl.",
      // });
      return errorResponse(
        res,
        400,
        "All fields are required except imageUrl."
      );
    }

    const existingCourse = await Course.findOne({ name, universityName });

    if (existingCourse) {
      return errorResponse(res, 409, "Course already exists.");
      // return res
      //   .status(409)
      //   .json({ success: false, message: "Course already exists." });
    }

    // const newCourse = new Course({
    //   name,
    //   admissionClosingDate,
    //   universityName,
    //   destinationCountry,
    //   postStudyWorkVisaEligibility,
    //   tuitionFeesOnCampus,
    //   durationOnCampus,
    //   imageUrl,
    // });

    // await newCourse.save();

    const newCourse = await Course.create({
      name,
      admissionClosingDate,
      universityName,
      destinationCountry,
      postStudyWorkVisaEligibility,
      tuitionFeesOnCampus,
      durationOnCampus,
      imageUrl,
    });

    res.status(201).json({
      success: true,
      message: "Course created successfully.",
      course: newCourse,
    });
  } catch (error) {
    console.error("❌ Error creating course:", error);
    return errorResponse(
      res,
      500,
      "Internal Server Error",
      error,
      "creating course"
    );
     // res.status(500).json({
  //   success: false,
  //   message: "Internal Server Error.",
  //   error: error.message,
  // });
  // }
  }
 
};

const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find().lean();
    res
      .status(200)
      .json({ success: true, totalCourses: courses.length, courses });
  } catch (error) {
    console.error("❌ Error fetching courses:", error);
    return errorResponse(res, 500, "Internal Server Error", error, "fetching courses");
    // res.status(500).json({ success: false, message: "Internal Server Error." });
  }
};

const updateCourses = async (req, res) => {
  try {
    const { id, ...updateData } = req.body;

    if (!id) {
      // return res
      //   .status(400)
      //   .json({ success: false, message: "Course ID is required." });
        return errorResponse(res, 400, "Course ID is required.");
    }

    const updatedCourse = await Course.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!updatedCourse) {
      return errorResponse(res, 404, "Course not found.");
      // return res
      //   .status(404)
      //   .json({ success: false, message: "Course not found." });
    }

    res.status(200).json({
      success: true,
      message: "Course updated successfully.",
      course: updatedCourse,
    });
  } catch (error) {
    console.error("❌ Error updating course:", error);
    return errorResponse(res, 500, "Internal Server Error", error, "updating course");
    // res.status(500).json({ success: false, message: "Internal Server Error." });
  }
};

const deleteCourse = async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) {
      return errorResponse(res, 400, "Course ID is required.");
      // return res
      //   .status(400)
      //   .json({ success: false, message: "Course ID is required." });
    }

    const deletedCourse = await Course.findByIdAndDelete(id);

    if (!deletedCourse) {
      return errorResponse(res, 404, "Course not found.");
      // return res
      //   .status(404)
      //   .json({ success: false, message: "Course not found." });
    }

    res.status(200).json({
      success: true,
      message: "Course deleted successfully.",
      course: deletedCourse,
    });
  } catch (error) {
    console.error("❌ Error deleting course:", error);
    return errorResponse(res, 500, "Internal Server Error", error, "deleting course");
    // res.status(500).json({ success: false, message: "Internal Server Error." });
  }
};

export { newCourse, getAllCourses, updateCourses, deleteCourse };
