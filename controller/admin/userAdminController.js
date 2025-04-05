import User from "../../models/users.js";

const allUsers = async (req, res) => {
  try {
    // const users = await User.find();
    // const verifiedUsers = users.filter((user) => user.isVerified);
    // const unverifiedUsers = users.filter((user) => !user.isVerified);

    // res.status(200).json({
    //   success: true,
    //   totalUsers: users.length,
    //   totalVerifiedUsers: verifiedUsers.length,
    //   totalUnverifiedUsers: unverifiedUsers.length,
    //   verifiedUsers,
    //   unverifiedUsers,
    // });

    // Get verified and unverified users in a single query using MongoDB aggregation
    const result = await User.aggregate([
      {
        $facet: {
          verifiedUsers: [
            { $match: { isVerified: true } },
            { $project: { password: 0, __v: 0 } }, // Exclude sensitive fields
          ],
          unverifiedUsers: [
            { $match: { isVerified: false } },
            { $project: { password: 0, __v: 0 } },
          ],
          totalCount: [{ $count: "count" }],
        },
      },
      {
        $project: {
          verifiedUsers: 1,
          unverifiedUsers: 1,
          totalUsers: { $arrayElemAt: ["$totalCount.count", 0] },
          totalVerifiedUsers: { $size: "$verifiedUsers" },
          totalUnverifiedUsers: { $size: "$unverifiedUsers" },
        },
      },
    ]);

    const data = result[0] || {
      verifiedUsers: [],
      unverifiedUsers: [],
      totalUsers: 0,
      totalVerifiedUsers: 0,
      totalUnverifiedUsers: 0,
    };

    return res.status(200).json({
      success: true,
      ...data,
    });
  } catch (error) {
    console.error("❌ Error fetching users:", error);
    return errorResponse(res, 500, "Error fetching users", error, "allUsers");
    // res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id, name, email, mobile, address, role } = req.body;

    if (!id) {
      return errorResponse(res, 400, "User ID is required");
      // return res
      //   .status(400)
      //   .json({ success: false, message: "User ID is required." });
    }

    const existingUser = await User.findOne({
      $or: [{ email }, { mobile }],
      _id: { $ne: id },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email or mobile number already exists.",
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { name, email, mobile, address, role },
      { new: true, select: "-password -__v" }
    );

    if (!updatedUser) {
      return errorResponse(res, 404, "User not found");
      // return res
      //   .status(404)
      //   .json({ success: false, message: "User not found." });
    }

    res.status(200).json({
      success: true,
      message: "User updated successfully.",
      user: updatedUser,
    });
  } catch (error) {
    console.error("❌ Error updating user:", error);
    return errorResponse(res, 500, "Error updating user", error, "updateUser");
    // res.status(500).json({
    //   success: false,
    //   message: "Internal Server Error",
    //   error: error.message,
    // });
  }
};

const removeUser = async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) {
      return errorResponse(res, 400, "User ID is required");
      // return res
      //   .status(400)
      //   .json({ success: false, message: "User ID is required." });
    }

    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    res.status(200).json({
      success: true,
      message: "User deleted successfully.",
      user: deletedUser,
    });
  } catch (error) {
    console.error("❌ Error deleting user:", error);
    return errorResponse(res, 500, "Error deleting user", error, "removeUser");
    // res.status(500).json({
    //   success: false,
    //   message: "Internal Server Error",
    //   error: error.message,
    // });
  }
};

export { allUsers, updateUser, removeUser };
