import Activity from '../models/Activity.js';
import Crop from '../models/Crop.js';
import mongoose from 'mongoose';
import Resource from '../models/Resource.js';
import User from '../models/User.js';
import Weather from '../models/Weather.js';

const monthLabel = (dateValue) => {
  const date = new Date(dateValue);
  return date.toLocaleString('en-US', { month: 'short' });
};

const toObjectId = (id) => new mongoose.Types.ObjectId(String(id));

export const getUserOverviewAnalytics = async (userId) => {
  const userObjectId = toObjectId(userId);

  const [totalCrops, totalResources, totalActivities, pendingTasks, latestWeather] = await Promise.all([
    Crop.countDocuments({ createdBy: userObjectId }),
    Resource.countDocuments({ userId: userObjectId }),
    Activity.countDocuments({ userId: userObjectId }),
    Activity.countDocuments({ userId: userObjectId, status: 'pending' }),
    Weather.findOne({ userId: userObjectId }).sort({ searchedAt: -1, createdAt: -1 }),
  ]);

  return {
    totalCrops,
    totalResources,
    totalActivities,
    pendingTasks,
    currentWeather: latestWeather
      ? {
          city: latestWeather.city,
          temperature: latestWeather.temperature,
          condition: latestWeather.condition,
          searchedAt: latestWeather.searchedAt,
        }
      : null,
  };
};

export const getUserCropAnalytics = async (userId) => {
  const userObjectId = toObjectId(userId);

  const cropTypeDistribution = await Crop.aggregate([
    { $match: { createdBy: userObjectId } },
    { $group: { _id: '$type', value: { $sum: 1 } } },
    { $project: { _id: 0, name: { $ifNull: ['$_id', 'Unknown'] }, value: 1 } },
    { $sort: { value: -1 } },
  ]);

  return {
    cropTypeDistribution,
  };
};

export const getUserResourceAnalytics = async (userId) => {
  const userObjectId = toObjectId(userId);

  const monthlyUsageRaw = await Resource.aggregate([
    { $match: { userId: userObjectId } },
    {
      $group: {
        _id: {
          year: { $year: '$usageDate' },
          month: { $month: '$usageDate' },
          resourceType: '$resourceType',
        },
        quantity: { $sum: '$quantity' },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  const monthlyResourceUsage = monthlyUsageRaw.map((item) => {
    const syntheticDate = new Date(item._id.year, item._id.month - 1, 1);
    return {
      month: monthLabel(syntheticDate),
      resourceType: item._id.resourceType,
      quantity: Number(item.quantity.toFixed(2)),
    };
  });

  return {
    monthlyResourceUsage,
  };
};

export const getUserActivityAnalytics = async (userId) => {
  const userObjectId = toObjectId(userId);

  const [statusRaw, weeklyWeatherRaw] = await Promise.all([
    Activity.aggregate([
      { $match: { userId: userObjectId } },
      { $group: { _id: '$status', value: { $sum: 1 } } },
      { $project: { _id: 0, name: { $ifNull: ['$_id', 'unknown'] }, value: 1 } },
    ]),
    Weather.find({ userId: userObjectId }).sort({ searchedAt: -1 }).limit(50).select('temperature searchedAt city').lean(),
  ]);

  const activityStatus = statusRaw.length
    ? statusRaw
    : [
        { name: 'pending', value: 0 },
        { name: 'completed', value: 0 },
      ];

  const weatherByDate = new Map();
  for (const entry of weeklyWeatherRaw) {
    const searchedDate = new Date(entry.searchedAt);
    const key = searchedDate.toISOString().slice(0, 10);
    if (!weatherByDate.has(key)) {
      weatherByDate.set(key, entry);
    }
    if (weatherByDate.size === 7) {
      break;
    }
  }

  const weeklyWeatherTrend = Array.from(weatherByDate.values())
    .reverse()
    .map((entry) => {
      const date = new Date(entry.searchedAt);
      return {
        day: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        city: entry.city,
        temperature: entry.temperature,
      };
    });

  return {
    activityStatus,
    weeklyWeatherTrend,
  };
};

export const getAdminOverviewAnalytics = async () => {
  const [totalUsers, totalAdmins, totalCrops, totalResources, totalActivities] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: 'admin' }),
    Crop.countDocuments(),
    Resource.countDocuments(),
    Activity.countDocuments(),
  ]);

  return {
    totalUsers,
    totalAdmins,
    totalCrops,
    totalResources,
    totalActivities,
  };
};

export const getAdminUsersGrowthAnalytics = async () => {
  const usersGrowthRaw = await User.aggregate([
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
        },
        usersCount: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  return usersGrowthRaw.map((item) => {
    const syntheticDate = new Date(item._id.year, item._id.month - 1, 1);
    return {
      month: monthLabel(syntheticDate),
      usersCount: item.usersCount,
    };
  });
};

export const getAdminSystemDataAnalytics = async () => {
  const [totalCropsByType, resourcesUsageSummary, activitiesOverview] = await Promise.all([
    Crop.aggregate([
      { $group: { _id: '$type', value: { $sum: 1 } } },
      { $project: { _id: 0, name: { $ifNull: ['$_id', 'Unknown'] }, value: 1 } },
      { $sort: { value: -1 } },
    ]),
    Resource.aggregate([
      { $group: { _id: '$resourceType', value: { $sum: '$quantity' } } },
      { $project: { _id: 0, name: { $ifNull: ['$_id', 'unknown'] }, value: { $round: ['$value', 2] } } },
      { $sort: { value: -1 } },
    ]),
    Activity.aggregate([
      { $group: { _id: '$status', value: { $sum: 1 } } },
      { $project: { _id: 0, name: { $ifNull: ['$_id', 'unknown'] }, value: 1 } },
      { $sort: { value: -1 } },
    ]),
  ]);

  return {
    totalCropsByType,
    resourcesUsageSummary,
    activitiesOverview,
  };
};

export const getAdminTopUsersAnalytics = async () => {
  const [activityCounts, cropCounts, resourceCounts, users] = await Promise.all([
    Activity.aggregate([
      { $group: { _id: '$userId', activitiesCount: { $sum: 1 } } },
    ]),
    Crop.aggregate([
      { $group: { _id: '$createdBy', cropsCount: { $sum: 1 } } },
    ]),
    Resource.aggregate([
      { $group: { _id: '$userId', resourcesCount: { $sum: 1 } } },
    ]),
    User.find().select('name email role').lean(),
  ]);

  const userMap = new Map(users.map((user) => [String(user._id), user]));
  const scoreMap = new Map();

  const addScore = (list, field) => {
    list.forEach((entry) => {
      const key = String(entry._id);
      const current = scoreMap.get(key) || { activitiesCount: 0, cropsCount: 0, resourcesCount: 0 };
      current[field] = entry[field] || 0;
      scoreMap.set(key, current);
    });
  };

  addScore(activityCounts, 'activitiesCount');
  addScore(cropCounts, 'cropsCount');
  addScore(resourceCounts, 'resourcesCount');

  return Array.from(scoreMap.entries())
    .map(([userId, score]) => {
      const user = userMap.get(userId);
      if (!user) return null;

      return {
        userId,
        name: user.name,
        email: user.email,
        role: user.role,
        activitiesCount: score.activitiesCount,
        cropsCount: score.cropsCount,
        resourcesCount: score.resourcesCount,
        totalScore: score.activitiesCount + score.cropsCount + score.resourcesCount,
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.totalScore - a.totalScore)
    .slice(0, 10);
};
