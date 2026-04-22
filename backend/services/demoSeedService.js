import Activity from '../models/Activity.js';
import Crop from '../models/Crop.js';
import Resource from '../models/Resource.js';
import Weather from '../models/Weather.js';

const daysAgo = (days) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
};

export const ensureDemoDataForUser = async (user) => {
  if (!user || user.role === 'admin') {
    return;
  }

  const userId = user._id;

  const [cropCount, resourceCount, activityCount, weatherCount] = await Promise.all([
    Crop.countDocuments({ createdBy: userId }),
    Resource.countDocuments({ userId }),
    Activity.countDocuments({ userId }),
    Weather.countDocuments({ userId }),
  ]);

  let crops = [];

  if (cropCount === 0) {
    crops = await Crop.insertMany([
      {
        name: 'Paddy Demo Plot',
        type: 'Rice',
        stage: 'Seedling',
        plantedDate: daysAgo(35),
        notes: 'Demo record seeded automatically for evaluation.',
        createdBy: userId,
      },
      {
        name: 'Wheat Demo Field',
        type: 'Wheat',
        stage: 'Vegetative',
        plantedDate: daysAgo(22),
        notes: 'Demo record seeded automatically for evaluation.',
        createdBy: userId,
      },
      {
        name: 'Corn Showcase Bed',
        type: 'Corn',
        stage: 'Growing',
        plantedDate: daysAgo(12),
        notes: 'Demo record seeded automatically for evaluation.',
        createdBy: userId,
      },
    ]);
  }

  if (resourceCount === 0) {
    await Resource.insertMany([
      {
        userId,
        resourceType: 'water',
        quantity: 1200,
        unit: 'liters',
        cost: 750,
        usageDate: daysAgo(30),
        fieldLocation: 'North field',
        supplier: 'Village irrigation board',
        notes: 'Demo water usage entry.',
      },
      {
        userId,
        resourceType: 'fertilizer',
        quantity: 65,
        unit: 'kg',
        cost: 2800,
        usageDate: daysAgo(15),
        fieldLocation: 'Central field',
        supplier: 'Agri Inputs Center',
        notes: 'Demo fertilizer usage entry.',
      },
      {
        userId,
        resourceType: 'seeds',
        quantity: 28,
        unit: 'kg',
        cost: 2100,
        usageDate: daysAgo(6),
        fieldLocation: 'South patch',
        supplier: 'Farm Seed Store',
        notes: 'Demo seeds usage entry.',
      },
    ]);
  }

  if (activityCount === 0) {
    const cropForActivity = crops[0]?._id || null;

    await Activity.insertMany([
      {
        userId,
        cropId: cropForActivity,
        activityType: 'watering',
        title: 'Morning irrigation cycle',
        description: 'Check moisture and irrigate evenly across rows.',
        activityDate: daysAgo(5),
        status: 'completed',
        priority: 'medium',
        fieldLocation: 'North field',
      },
      {
        userId,
        cropId: cropForActivity,
        activityType: 'inspection',
        title: 'Weekly pest inspection',
        description: 'Inspect leaves for early pest activity and stress signs.',
        activityDate: daysAgo(2),
        status: 'pending',
        priority: 'high',
        fieldLocation: 'Central field',
      },
      {
        userId,
        cropId: cropForActivity,
        activityType: 'fertilizing',
        title: 'Nutrient top-dressing plan',
        description: 'Apply balanced nutrients around root zone.',
        activityDate: daysAgo(1),
        status: 'pending',
        priority: 'medium',
        fieldLocation: 'South patch',
      },
    ]);
  }

  if (weatherCount === 0) {
    const temperatures = [31, 30, 32, 33, 32, 34, 33];

    await Weather.insertMany(
      temperatures.map((temp, index) => ({
        userId,
        city: 'Vijayawada',
        temperature: temp,
        condition: temp >= 33 ? 'Partly Cloudy' : 'Clear Sky',
        searchedAt: daysAgo(7 - index),
      }))
    );
  }
};
