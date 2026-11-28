
import {
    getAllTrips,
    getTripById,
    getTripRegions,
    getTripSeasons,
} from '../models/trips.js';

import { getDb } from '../db/connect.js';

// Display the trips listing page.
export const listTripsPage = async (req, res, next) => {
    try {
        const [regions, trips, seasons] = await Promise.all([
            getTripRegions(),
            getAllTrips(),
            getTripSeasons(),
        ]);

        return res.render('trips/list', {
            title: 'Scenic Train Trips',
            regions,
            trips,
            seasons,
        });
    } catch (error) {
        return next(error);
    }
};

// Display an individual trip details page.
export const tripDetailsPage = async (req, res, next) => {
    try {
        const { tripId } = req.params;

        const details = await getTripById(tripId);

        if (!details) {
            return res.status(404).send('Trip not found');
        }

        // Retrieve schedules using the existing native MongoDB connection.
        details.schedules = await getDb()
            .collection('schedules')
            .find({ tripId })
            .toArray();

        return res.render('trips/details', {
            title: 'Trip Details',
            details,
        });
    } catch (error) {
        return next(error);
    }
};

// Return all trips through the JSON API.
export const getAllTripsApi = async (req, res) => {
    try {
        const trips = await getAllTrips();

        return res.status(200).json({ trips });
    } catch (error) {
        console.error('Failed to fetch trips:', error);

        return res.status(500).json({
            error: 'Failed to fetch trips',
        });
    }
};

// Return one trip through the JSON API.
export const getTripByIdApi = async (req, res) => {
    try {
        const { tripId } = req.params;

        const trip = await getTripById(tripId);

        if (!trip) {
            return res.status(404).json({
                error: 'Trip not found',
            });
        }

        return res.status(200).json({ trip });
    } catch (error) {
        console.error('Failed to fetch trip:', error);

        return res.status(500).json({
            error: 'Failed to fetch trip',
        });
    }
};
