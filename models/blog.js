import mongoose from "mongoose";

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    intro: {
      type: String,
    },
    author: {
      name: {
        type: String,
      },
      image: {
        type: String,
      },
    },
    image: {
      type: String,
    },
    country: {
      type: String,
    },
    date: {
      type: String,
    },
    headline: {
      type: String,
    },
    headlineintro: {
      type: String,
    },
    subtopics: [
      {
        title: {
          type: String,
        },
        intro: {
          type: String,
        },
        info: {
          type: String,
        },
        bulletpoints: [
          {
            title: {
              type: String,
            },
            info: {
              type: String,
            },
          },
        ],
        endline: {
          type: String,
        },
      },
    ],
    meta: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Blog = mongoose.model("blogs", blogSchema);

export default Blog;
