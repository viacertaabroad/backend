import errorResponse from "../helpers/errorHandler.js";
import Blog from "../models/blog.js";

const getBlogs = async (req, res) => {
  try {
    // const allBlogs = await Blog.find({});
    const allBlogs = await Blog.find({})
      .lean()
      .select("title intro author image country date headline")
      .sort({ createdAt: -1 }); // Newest first

    if (allBlogs.length === 0) {
      // return res.status(200).json({
      //   success: true,
      //   message: "No blogs found.",
      //   totalBlogs: 0,
      //   blogs: [],
      // });
      return errorResponse(res, 200, "No blogs found", error);
    }

    res.status(200).json({
      success: true,
      totalBlogs: allBlogs.length,
      blogs: allBlogs,
    });
  } catch (error) {
    console.error("Error:", error);

    // res.status(500).json({
    //   success: false,
    //   message: "An error occurred.",
    //   error: error.message,
    // });
    return errorResponse(res, 500, "Failed to fetch blogs", error);
  }
};

// Get a single blog by ID
const getBlogById = async (req, res) => {
  try {
    const { blogId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(blogId)) {
      return errorResponse(res, 400, "Invalid blog ID format");
    }

    if (!blogId) {
      // return res.status(400).json({
      //   success: false,
      //   message: "Blog ID is required.",
      // });
      return errorResponse(res, 200, "Blog id required");
    }

    const blog = await Blog.findById(blogId).lean();

    if (!blog) {
      // return res.status(404).json({
      //   success: false,
      //   message: "Blog not found.",
      // });
      return errorResponse(res, 404, "Blog not found");
    }

    res.status(200).json({
      success: true,
      blog,
    });
  } catch (error) {
    console.error("Error:", error);

    // res.status(500).json({
    //   success: false,
    //   message: "An error occurred.",
    //   error: error.message,
    // });
    return errorResponse(res, 500, "Failed to fetch blog", error);
  }
};

const createBlog = async (req, res) => {
  try {
    const {
      title,
      intro,
      author,
      image,
      country,
      date,

      headline,
      headlineintro,
      subtopics,
      meta,
    } = req.body;

    const newBlog = new Blog({
      title,
      intro,
      author,
      image,
      country,
      date,
      headline,
      headlineintro,
      subtopics,
      meta,
    });

    const savedBlog = await newBlog.save();
    console.log("Blog Created.");

    res.status(201).json(savedBlog);
  } catch (error) {
    console.error("Error creating blog:", error);

    if (error.name === "ValidationError") {
      return errorResponse(res, 400, "Validation Error", error);
    }
    return errorResponse(res, 500, "Failed to create blog", error);
  }
  //   res.status(500).json({ message: "Internal Server Error" });
  // }
};

const updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse(res, 400, "Invalid blog ID format");
    }
    const {
      title,
      intro,
      author,
      image,
      country,
      date,
      headline,
      headlineintro,
      subtopics,
      meta,
    } = req.body;

    // const existingBlog = await Blog.findById(id);
    // if (!existingBlog) {
    //   return res.status(404).json({ message: "Blog not found" });
    // }

    const updatedBlog = await Blog.findByIdAndUpdate(
      id,
      {
        title,
        intro,
        author,
        image,
        country,
        date,
        headline,
        headlineintro,
        subtopics,
        meta,
      },
      { new: true }
    ).lean();
    if (!updatedBlog) {
      return errorResponse(res, 404, "Blog not found");
    }
    console.log("Blog Updated.");
    return res.status(200).json({
      success: true,
      data: updatedBlog,
    });

  } catch (error) {
    console.error("Error updating blog:", error);
    // res.status(500).json({ message: "Internal Server Error" });
    return errorResponse(res, 500, 'Failed to update blog', error);
  }
};

export { createBlog, getBlogs, getBlogById, updateBlog };
