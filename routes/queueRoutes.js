const express = require('express');
const router = express.Router();
const queueController = require('../controllers/queueController');

// Get queue statistics
router.get('/stats', queueController.getQueueStats);

// Get jobs by status (waiting, active, completed, failed, delayed)
router.get('/jobs/:status', queueController.getJobsByStatus);

// Get specific job details
router.get('/job/:jobId', queueController.getJobDetails);

// Retry a failed job
router.post('/job/:jobId/retry', queueController.retryJob);

// Remove a job
router.delete('/job/:jobId', queueController.removeJob);

// Clean old jobs
router.post('/clean', queueController.cleanQueue);

// Pause queue
router.post('/pause', queueController.pauseQueue);

// Resume queue
router.post('/resume', queueController.resumeQueue);

module.exports = router;