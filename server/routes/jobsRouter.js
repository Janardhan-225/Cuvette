import express from "express";
const router = express.Router();

import {
  createJob,
  deleteJob,
  getAllJobs,
  updateJob,
  showStats,
} from "../controllers/jobsController.js";

router.route("/").post(createJob).get(getAllJobs);
router.route("/stats").get(showStats); // must be before the dynamic-route (:id)
router.route("/:id").delete(deleteJob).patch(updateJob);
// get all jobs
router.get("/", getAllJobs);
// Example Express route in your backend
router.get('/api/v1/jobs', async (req, res) => {
  try {
    const jobs = await Jobs.find({});
    res.status(200).json({ jobs });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});



export default router;
