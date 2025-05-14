import Blog from "../models/blog.js"


 const getBlogs = async()=> {
  try {
    const data = await Blog.find();
    console.log(data);
    
  } catch (error) {
    console.log(error);
    
  }  
 }