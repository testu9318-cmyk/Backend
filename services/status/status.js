
const data = [
    {
      "flaggedPatients": 10,
      "issuesResolved": 2140,
      "activeNeeds": 10
    }
  ]

async function createStatus() {
  try {
    console.log('services')
    return data;
  } catch (err) {
    throw new Error(`Error creating user: ${err.message}`);
  }
}

module.exports = {
  createStatus,
};









