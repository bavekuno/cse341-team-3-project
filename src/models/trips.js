
import Trip from './schemas/trips.js';

// Retrieve one trip using its unique application-level ID.
export const getTripById = async (id) => {
  return Trip.findOne({ id }).lean();
};

// Retrieve all trips.
export const getAllTrips = async () => {
  return Trip.find({}).lean();
};

// Retrieve all distinct regions.
export const getTripRegions = async () => {
  return Trip.distinct('region');
};

// Retrieve all distinct best seasons.
export const getTripSeasons = async () => {
  return Trip.distinct('bestSeason');
};
