import { emailWorker } from "./worker.js";

export default {emailWorker}

// make only one Worker and target diff queue with job.name from worker 
// if else job.name 