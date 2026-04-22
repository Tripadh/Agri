import Crop from '../models/Crop.js';
import Resource from '../models/Resource.js';
import Activity from '../models/Activity.js';
import Weather from '../models/Weather.js';
import User from '../models/User.js';
import { buildPaginationMeta, getSortConfig, parsePagination } from '../services/queryService.js';

const userSortMap = {
  latest: { createdAt: -1 },
  oldest: { createdAt: 1 },
  'name-asc': { name: 1 },
  'name-desc': { name: -1 },
};

export const getAllUsers = async (req, res) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const sortConfig = getSortConfig(req.query.sort, userSortMap, 'latest');

    const filter = {};

    if (req.query.role) {
      filter.role = req.query.role;
    }

    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      filter.$or = [{ name: searchRegex }, { email: searchRegex }, { role: searchRegex }];
    }

    const [totalItems, users] = await Promise.all([
      User.countDocuments(filter),
      User.find(filter).select('-password').sort(sortConfig).skip(skip).limit(limit),
    ]);

    const pagination = buildPaginationMeta({ totalItems, page, limit });

    return res.status(200).json({
      users,
      data: users,
      ...pagination,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch users' });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({ user });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch user' });
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Role must be user or admin' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({ message: 'User role updated successfully', user });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update user role' });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await Crop.deleteMany({ createdBy: user._id });
    await User.findByIdAndDelete(req.params.id);

    return res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete user' });
  }
};

export const getAdminStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalAdmins,
      totalCrops,
      totalResources,
      totalActivities,
      totalWeatherSearches,
      recentUsers,
      recentCrops,
      recentResources,
      recentActivities,
      recentWeatherSearches,
      mostSearchedCities,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'admin' }),
      Crop.countDocuments(),
      Resource.countDocuments(),
      Activity.countDocuments(),
      Weather.countDocuments(),
      User.find().select('name email role createdAt').sort({ createdAt: -1 }).limit(5),
      Crop.find().populate('createdBy', 'name email role').sort({ createdAt: -1 }).limit(5),
      Resource.find().populate('userId', 'name email role').sort({ usageDate: -1, createdAt: -1 }).limit(5),
      Activity.find().populate('userId', 'name email role').populate('cropId', 'name type stage').sort({ activityDate: -1, createdAt: -1 }).limit(5),
      Weather.find().populate('userId', 'name email role').sort({ searchedAt: -1, createdAt: -1 }).limit(5),
      Weather.aggregate([
        { $group: { _id: '$city', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
      ]),
    ]);

    return res.status(200).json({
      totalUsers,
      totalAdmins,
      totalCrops,
      totalResources,
      totalActivities,
      totalWeatherSearches,
      recentUsers,
      recentCrops,
      recentResources,
      recentActivities,
      recentWeatherSearches,
      mostSearchedCities,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch admin stats' });
  }
};
