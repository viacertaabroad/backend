import OurStudents from "../../models/ourStudents.js";

const newStudent = async (req, res) => {
  try {
    const {
      name,
      university,
      country,
      scholarship,
      scholarshipAmount,
      course,
      description,
    } = req.body;

    const newStudent = await OurStudents.create({
      name,
      university,
      country,
      scholarship,
      scholarshipAmount,
      course,
      description,
    });

    res.status(201).json({
      success: true,
      message: "Student added successfully",
      data: newStudent,
    });
  } catch (error) {
    console.error("❌ Error adding student:", error);
    return errorResponse(res, 500, "Error adding student", error, "newStudent");
  }
};

const getStudents = async (req, res) => {
  try {
    const students = await OurStudents.find().lean();
    res
      .status(200)
      .json({ success: true, totalStudents: students.length, students });
  } catch (error) {
    console.error("❌ Error fetching students:", error);
    return errorResponse(
      res,
      500,
      "Error fetching students",
      error,
      "getStudents"
    );
  }
};

const updateStudent = async (req, res) => {
  try {
    const {
      id,
      name,
      university,
      country,
      scholarship,
      scholarshipAmount,
      course,
      description,
    } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Student ID is required for update.",
      });
    }

    const updatedStudent = await OurStudents.findByIdAndUpdate(
      id,
      {
        name,
        university,
        country,
        scholarship,
        scholarshipAmount,
        course,
        description,
      },
      { new: true }
    );

    if (!updatedStudent) {
      return errorResponse(res, 404, "Student not found");
    }

    res.status(200).json({
      success: true,
      message: "Student updated successfully",
      data: updatedStudent,
    });
  } catch (error) {
    console.error("❌ Error updating student:", error);
    return errorResponse(
      res,
      500,
      "Error updating student",
      error,
      "updateStudent"
    );
  }
};

const removeStudent = async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) {
      return errorResponse(res, 400, "Student ID is required to delete");
    }

    const deletedStudent = await OurStudents.findByIdAndDelete(id);

    if (!deletedStudent) {
      return errorResponse(res, 404, "Student not found");
    }

    res.status(200).json({
      success: true,
      message: "Student deleted successfully",
      data: deletedStudent,
    });
  } catch (error) {
    console.error("❌ Error deleting student:", error);
    return errorResponse(
      res,
      500,
      "Error deleting student",
      error,
      "removeStudent"
    );
  }
};

export { newStudent, getStudents, updateStudent, removeStudent };
