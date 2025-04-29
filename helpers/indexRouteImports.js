import userRoutes from "../routes/usersRoute.js";
import blogRoutes from "../routes/blogRoute.js";
import coursesRoutes from "../routes/coursesRoute.js";
import mbbsRoutes from "../routes/campaignRoute.js";
import ourStudentsRoutes from "../routes/ourStudentsRoute.js";
import enquiryRoutes from "../routes/enquiryRoute.js";
import adminRoutes from "../routes/adminRoute.js";
import googleAuthRoute from "../routes/googleAuthRoute.js";
import ticketRoutes from "../routes/ticketRoute.js";
import checkRoutes from "../routes/check.js";
// -- 
import sseRoute from "../routes/serverSideEventsRoute.js"
import whatsAppRoute from "../whatsapp/routes/whatsappRoutes.js";


export default{
  checkRoutes,
  userRoutes,
  blogRoutes,
  coursesRoutes,
  mbbsRoutes,
  ourStudentsRoutes,
  enquiryRoutes,
  adminRoutes,
  googleAuthRoute,
  ticketRoutes,
  sseRoute,
  whatsAppRoute
};
