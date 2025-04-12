import errorResponse from "../helpers/errorHandler.js";
import Course from "../models/courses.js";

const getCourses = async (req, res) => {
  try {
 
    const courses = await Course.find().lean();
    if (courses.length === 0) {
      return res
        .status(204) 
        .end();
    }
    return res.status(200).json({
      success: true,
      count: courses.length,
      data: courses,
    });
  } catch (error) {
    console.error("Error fetching courses:", error);
  
    return errorResponse(res, 500, "Failed to fetch courses", error);
  }
};

export { getCourses };
