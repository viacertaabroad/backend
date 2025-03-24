import Blog from "../models/blog.js";

const getBlogs = async (req, res) => {
  try {
    const allBlogs = await Blog.find({});

    if (allBlogs.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No blogs found.",
        totalBlogs: 0,
        blogs: [],
      });
    }

    res.status(200).json({
      success: true,
      totalBlogs: allBlogs.length,
      blogs: allBlogs,
    });
  } catch (error) {
    console.error("Error:", error);

    res.status(500).json({
      success: false,
      message: "An error occurred.",
      error: error.message,
    });
  }
};

// Get a single blog by ID
const getBlogById = async (req, res) => {
  try {
    const { blogId } = req.params;

    if (!blogId) {
      return res.status(400).json({
        success: false,
        message: "Blog ID is required.",
      });
    }

    const blog = await Blog.findById(blogId);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found.",
      });
    }

    res.status(200).json({
      success: true,
      blog,
    });
  } catch (error) {
    console.error("Error:", error);

    res.status(500).json({
      success: false,
      message: "An error occurred.",
      error: error.message,
    });
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
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const updateBlog = async (req, res) => {
  try {
    const { id } = req.params;  
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

 
    const existingBlog = await Blog.findById(id);
    if (!existingBlog) {
      return res.status(404).json({ message: "Blog not found" });
    }

     
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
    );

    console.log("Blog Updated.");
    res.status(200).json(updatedBlog);
  } catch (error) {
    console.error("Error updating blog:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export { createBlog, getBlogs, getBlogById ,updateBlog};
