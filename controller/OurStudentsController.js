import errorResponse from "../helpers/errorHandler.js";
import OurStudents from "../models/ourStudents.js";

const allStudents = async (req, res) => {
  try {
    const ourStudent = await OurStudents.find().lean();
    // if (ourStudent.length === 0) {
    //   return res.status(204).end();
    // }
    res.status(200).json({
      success: true,
      totalStudents: ourStudent.length,
      ourStudent,
      // data: ourStudent.map(student => ({
      //   id: student._id,
      //   name: student.name,
      //   program: student.program,
      //   country: student.country,
      //   testimonial: student.testimonial,
      //   image: student.image,
      //   createdAt: student.createdAt
      // }))
    });
  } catch (error) {
  
    return errorResponse(res, 400, "An error occurred");
  }
};

export { allStudents };
