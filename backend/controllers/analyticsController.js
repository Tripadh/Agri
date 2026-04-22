import {
  getAdminOverviewAnalytics,
  getAdminSystemDataAnalytics,
  getAdminTopUsersAnalytics,
  getAdminUsersGrowthAnalytics,
  getUserActivityAnalytics,
  getUserCropAnalytics,
  getUserOverviewAnalytics,
  getUserResourceAnalytics,
} from '../services/analyticsService.js';

export const getUserOverview = async (req, res) => {
  try {
    const overview = await getUserOverviewAnalytics(req.user.userId);
    return res.status(200).json({ overview });
  } catch {
    return res.status(500).json({ message: 'Failed to fetch user overview analytics' });
  }
};

export const getUserCropsAnalytics = async (req, res) => {
  try {
    const data = await getUserCropAnalytics(req.user.userId);
    return res.status(200).json(data);
  } catch {
    return res.status(500).json({ message: 'Failed to fetch user crop analytics' });
  }
};

export const getUserResourcesAnalytics = async (req, res) => {
  try {
    const data = await getUserResourceAnalytics(req.user.userId);
    return res.status(200).json(data);
  } catch {
    return res.status(500).json({ message: 'Failed to fetch user resource analytics' });
  }
};

export const getUserActivitiesAnalytics = async (req, res) => {
  try {
    const data = await getUserActivityAnalytics(req.user.userId);
    return res.status(200).json(data);
  } catch {
    return res.status(500).json({ message: 'Failed to fetch user activity analytics' });
  }
};

export const getAdminOverview = async (req, res) => {
  try {
    const overview = await getAdminOverviewAnalytics();
    return res.status(200).json({ overview });
  } catch {
    return res.status(500).json({ message: 'Failed to fetch admin overview analytics' });
  }
};

export const getAdminUsersGrowth = async (req, res) => {
  try {
    const usersGrowth = await getAdminUsersGrowthAnalytics();
    return res.status(200).json({ usersGrowth });
  } catch {
    return res.status(500).json({ message: 'Failed to fetch admin users growth analytics' });
  }
};

export const getAdminSystemData = async (req, res) => {
  try {
    const data = await getAdminSystemDataAnalytics();
    return res.status(200).json(data);
  } catch {
    return res.status(500).json({ message: 'Failed to fetch admin system analytics' });
  }
};

export const getAdminTopUsers = async (req, res) => {
  try {
    const topUsers = await getAdminTopUsersAnalytics();
    return res.status(200).json({ topUsers });
  } catch {
    return res.status(500).json({ message: 'Failed to fetch top users analytics' });
  }
};
