
import {
    getAllTrips,
    getTripById,
} from '../models/trips.js';

import { getDb } from '../db/connect.js';

export const listTripsPage = async (req, res, next) => {
    try {
        return res.render('trips/list', {
            title: 'Scenic Train Trips',
        });
    } catch (error) {
        return next(error);
    }
};

export const tripDetailsPage = async (req, res, next) => {
    try {
        const { tripId } = req.params;

        const details = await getTripById(tripId);

        if (!details) {
            return res.status(404).send('Trip not found');
        }

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

export const getAllTripsApi = async (req, res) => {
    try {
        const trips = await getAllTrips();
        return res.status(200).json(trips);
    } catch (error) {
        console.error('Failed to fetch trips:', error);
        return res.status(500).json({ message: 'Failed to retrieve trips' });
    }
};

export const getTripByIdApi = async (req, res) => {
    try {
        const { id } = req.params;
        const trip = await getTripById(id);

        if (!trip) {
            return res.status(404).json({ message: 'Trip not found' });
        }

        return res.status(200).json(trip);
    } catch (error) {
        console.error('Failed to fetch trip:', error);
        return res.status(500).json({ message: 'Failed to retrieve trip' });
    }
};
