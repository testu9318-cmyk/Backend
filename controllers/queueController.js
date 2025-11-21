const emailQueue = require("../config/queue/emailQueue");

// Get queue stats
exports.getQueueStats = async (req, res) => {
  try {
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      emailQueue.getWaitingCount(),
      emailQueue.getActiveCount(),
      emailQueue.getCompletedCount(),
      emailQueue.getFailedCount(),
      emailQueue.getDelayedCount()
    ]);

    return res.status(200).json({
      success: true,
      data: {
        waiting,
        active,
        completed,
        failed,
        delayed,
        total: waiting + active + completed + failed + delayed
      }
    });
  } catch (error) {
    console.error("Error fetching queue stats:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch queue stats",
      error: error.message
    });
  }
};

// Get jobs by status
exports.getJobsByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const { start = 0, end = 10 } = req.query;

    const jobs = await emailQueue.getJobs([status], parseInt(start), parseInt(end));
    
    const jobDetails = await Promise.all(
      jobs.map(async (job) => {
        // Calculate scheduled time for delayed jobs
        let scheduledTime = null;
        if (status === 'delayed' && job.opts?.delay) {
          scheduledTime = job.timestamp + job.opts.delay;
        }

        // Calculate time remaining for delayed jobs
        let timeRemaining = null;
        if (scheduledTime) {
          timeRemaining = Math.max(0, scheduledTime - Date.now());
        }

        return {
          id: job.id,
          data: job.data,
          progress: job.progress(),
          attemptsMade: job.attemptsMade,
          failedReason: job.failedReason,
          stacktrace: job.stacktrace,
          returnvalue: job.returnvalue,
          finishedOn: job.finishedOn,
          processedOn: job.processedOn,
          timestamp: job.timestamp,
          opts: job.opts,
          scheduledTime: scheduledTime, // When the job is scheduled to run
          timeRemaining: timeRemaining, // Milliseconds until job runs
          delay: job.opts?.delay // Original delay in milliseconds
        };
      })
    );

    return res.status(200).json({
      success: true,
      data: {
        status,
        count: jobs.length,
        jobs: jobDetails
      }
    });
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch jobs",
      error: error.message
    });
  }
};

// Get specific job details
exports.getJobDetails = async (req, res) => {
  try {
    const { jobId } = req.params;
    const job = await emailQueue.getJob(jobId);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found"
      });
    }

    const state = await job.getState();
    const logs = await job.getLogs();

    // Calculate scheduled time for delayed jobs
    let scheduledTime = null;
    let timeRemaining = null;
    if (state === 'delayed' && job.opts?.delay) {
      scheduledTime = job.timestamp + job.opts.delay;
      timeRemaining = Math.max(0, scheduledTime - Date.now());
    }

    return res.status(200).json({
      success: true,
      data: {
        id: job.id,
        state,
        data: job.data,
        progress: job.progress(),
        attemptsMade: job.attemptsMade,
        failedReason: job.failedReason,
        stacktrace: job.stacktrace,
        returnvalue: job.returnvalue,
        finishedOn: job.finishedOn,
        processedOn: job.processedOn,
        timestamp: job.timestamp,
        logs: logs,
        opts: job.opts,
        scheduledTime: scheduledTime,
        timeRemaining: timeRemaining,
        delay: job.opts?.delay
      }
    });
  } catch (error) {
    console.error("Error fetching job details:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch job details",
      error: error.message
    });
  }
};

// Get all jobs by status
// exports.getJobsByStatus = async (req, res) => {
//   try {
//     const { status } = req.params; // waiting, active, completed, failed, delayed
//     const { start = 0, end = 10 } = req.query;

//     const jobs = await emailQueue.getJobs([status], parseInt(start), parseInt(end));
    
//     const jobDetails = await Promise.all(
//       jobs.map(async (job) => ({
//         id: job.id,
//         data: job.data,
//         progress: job.progress(),
//         attemptsMade: job.attemptsMade,
//         failedReason: job.failedReason,
//         stacktrace: job.stacktrace,
//         returnvalue: job.returnvalue,
//         finishedOn: job.finishedOn,
//         processedOn: job.processedOn,
//         timestamp: job.timestamp,
//         opts: job.opts
//       }))
//     );

//     return res.status(200).json({
//       success: true,
//       data: {
//         status,
//         count: jobs.length,
//         jobs: jobDetails
//       }
//     });
//   } catch (error) {
//     console.error("Error fetching jobs:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Failed to fetch jobs",
//       error: error.message
//     });
//   }
// };

// Get specific job details
// exports.getJobDetails = async (req, res) => {
//   try {
//     const { jobId } = req.params;
//     const job = await emailQueue.getJob(jobId);

//     if (!job) {
//       return res.status(404).json({
//         success: false,
//         message: "Job not found"
//       });
//     }

//     const state = await job.getState();
//     const logs = await job.getLogs();

//     return res.status(200).json({
//       success: true,
//       data: {
//         id: job.id,
//         state,
//         data: job.data,
//         progress: job.progress(),
//         attemptsMade: job.attemptsMade,
//         failedReason: job.failedReason,
//         stacktrace: job.stacktrace,
//         returnvalue: job.returnvalue,
//         finishedOn: job.finishedOn,
//         processedOn: job.processedOn,
//         timestamp: job.timestamp,
//         logs: logs,
//         opts: job.opts
//       }
//     });
//   } catch (error) {
//     console.error("Error fetching job details:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Failed to fetch job details",
//       error: error.message
//     });
//   }
// };

// Retry a failed job
exports.retryJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const job = await emailQueue.getJob(jobId);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found"
      });
    }

    await job.retry();

    return res.status(200).json({
      success: true,
      message: "Job queued for retry",
      data: { jobId }
    });
  } catch (error) {
    console.error("Error retrying job:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retry job",
      error: error.message
    });
  }
};

// Remove a job
exports.removeJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const job = await emailQueue.getJob(jobId);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found"
      });
    }

    await job.remove();

    return res.status(200).json({
      success: true,
      message: "Job removed successfully",
      data: { jobId }
    });
  } catch (error) {
    console.error("Error removing job:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to remove job",
      error: error.message
    });
  }
};

// Clean old jobs
exports.cleanQueue = async (req, res) => {
  try {
    const { grace = 3600000 } = req.query; // Default 1 hour

    const cleanedCompleted = await emailQueue.clean(parseInt(grace), 'completed');
    const cleanedFailed = await emailQueue.clean(parseInt(grace), 'failed');

    return res.status(200).json({
      success: true,
      message: "Queue cleaned successfully",
      data: {
        completedRemoved: cleanedCompleted.length,
        failedRemoved: cleanedFailed.length
      }
    });
  } catch (error) {
    console.error("Error cleaning queue:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to clean queue",
      error: error.message
    });
  }
};

// Pause/Resume queue
exports.pauseQueue = async (req, res) => {
  try {
    await emailQueue.pause();
    return res.status(200).json({
      success: true,
      message: "Queue paused"
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to pause queue",
      error: error.message
    });
  }
};

exports.resumeQueue = async (req, res) => {
  try {
    await emailQueue.resume();
    return res.status(200).json({
      success: true,
      message: "Queue resumed"
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to resume queue",
      error: error.message
    });
  }
};