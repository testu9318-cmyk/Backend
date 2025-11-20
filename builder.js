function buildFilter(filters = {}) {
  const query = {};

  console.log("🔧 Input filters:", JSON.stringify(filters, null, 2));

  // AGE RANGE
  if (filters.ageRange && Object.keys(filters.ageRange).length > 0) {
    const ageQuery = {};

    if (filters.ageRange.min !== undefined && filters.ageRange.min !== null) {
      ageQuery.$gte = filters.ageRange.min;
    }

    if (filters.ageRange.max !== undefined && filters.ageRange.max !== null) {
      ageQuery.$lte = filters.ageRange.max;
    }

    if (Object.keys(ageQuery).length > 0) {
      query.age = ageQuery;
    }
  }

  // EMAIL VERIFIED
  if (filters.isEmailVerified !== undefined && filters.isEmailVerified !== null) {
    query.isEmailVerified = filters.isEmailVerified;
  }

  // PHONE VERIFIED
  if (filters.isPhoneVerified !== undefined && filters.isPhoneVerified !== null) {
    query.isPhoneVerified = filters.isPhoneVerified;
  }

  // GENDER
  if (filters.gender && Array.isArray(filters.gender) && filters.gender.length > 0) {
    query.gender = { $in: filters.gender };
  }

  // COUNTRY - FIXED!
  if (filters.country && Array.isArray(filters.country) && filters.country.length > 0) {
    console.log("🌍 Adding country filter:", filters.country);
    query["address.country"] = { $in: filters.country };
  }

  // STATE
  if (filters.state && Array.isArray(filters.state) && filters.state.length > 0) {
    query["address.state"] = { $in: filters.state };
  }

  // CITY
  if (filters.city && Array.isArray(filters.city) && filters.city.length > 0) {
    query["address.city"] = { $in: filters.city };
  }

  // COURSES
  if (filters.courses && Array.isArray(filters.courses) && filters.courses.length > 0) {
    query.courses = { $in: filters.courses };
  }

  // INTERESTS
  if (filters.interests && Array.isArray(filters.interests) && filters.interests.length > 0) {
    query.interests = { $in: filters.interests };
  }

  // SKILLS
  if (filters.skills && Array.isArray(filters.skills) && filters.skills.length > 0) {
    query.skills = { $in: filters.skills };
  }

  // LANGUAGE PREFERENCE
  if (filters.languagePreference && Array.isArray(filters.languagePreference) && filters.languagePreference.length > 0) {
    query.languagePreference = { $in: filters.languagePreference };
  }

  // TIMEZONE
  if (filters.timezone && Array.isArray(filters.timezone) && filters.timezone.length > 0) {
    query.timezone = { $in: filters.timezone };
  }

  // ROLE
  if (filters.role && Array.isArray(filters.role) && filters.role.length > 0) {
    query.role = { $in: filters.role };
  }

  // CREATED DATE RANGE
  if (filters.createdAtRange) {
    const createdQuery = {};

    if (filters.createdAtRange.start) {
      createdQuery.$gte = new Date(filters.createdAtRange.start);
    }

    if (filters.createdAtRange.end) {
      createdQuery.$lte = new Date(filters.createdAtRange.end);
    }

    if (Object.keys(createdQuery).length > 0) {
      query.createdAt = createdQuery;
    }
  }

  // LAST LOGIN RANGE
  if (filters.lastLoginRange) {
    const loginQuery = {};

    if (filters.lastLoginRange.start) {
      loginQuery.$gte = new Date(filters.lastLoginRange.start);
    }

    if (filters.lastLoginRange.end) {
      loginQuery.$lte = new Date(filters.lastLoginRange.end);
    }

    if (Object.keys(loginQuery).length > 0) {
      query.lastLogin = loginQuery;
    }
  }

  console.log("🔍 Final Built Query:", JSON.stringify(query, null, 2));
  
  return query;
}

module.exports = buildFilter;