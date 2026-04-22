import Activity from '../models/Activity.js';
import { buildPaginationMeta, getSortConfig, parsePagination } from '../services/queryService.js';

const isAdmin = (req) => req.user?.role === 'admin';

const activitySortMap = {
  latest: { activityDate: -1, createdAt: -1 },
  oldest: { activityDate: 1, createdAt: 1 },
  'name-asc': { title: 1 },
  'name-desc': { title: -1 },
};

const applyActivityFilters = (query, scope = {}) => {
  const filter = { ...scope };

  if (query.status) {
    filter.status = query.status;
  }

  if (query.priority) {
    filter.priority = query.priority;
  }

  if (query.activityType) {
    filter.activityType = query.activityType;
  }

  if (query.fromDate || query.toDate) {
    filter.activityDate = {};
    if (query.fromDate) {
      filter.activityDate.$gte = new Date(query.fromDate);
    }
    if (query.toDate) {
      filter.activityDate.$lte = new Date(query.toDate);
    }
  }

  if (query.search) {
    const searchRegex = new RegExp(query.search, 'i');
    filter.$or = [
      { title: searchRegex },
      { description: searchRegex },
      { activityType: searchRegex },
      { status: searchRegex },
      { fieldLocation: searchRegex },
    ];
  }

  return filter;
};

export const createActivity = async (req, res) => {
  try {
    const { cropId, activityType, title, description, activityDate, status, priority, fieldLocation } = req.body;

    if (!activityType || !title || !activityDate) {
      return res.status(400).json({ message: 'activityType, title, and activityDate are required' });
    }

    const activity = await Activity.create({
      userId: req.user.userId,
      cropId: cropId || null,
      activityType,
      title,
      description: description || '',
      activityDate,
      status: status || 'pending',
      priority: priority || 'medium',
      fieldLocation: fieldLocation || '',
    });

    return res.status(201).json({ message: 'Activity created successfully', activity });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create activity' });
  }
};

export const getMyActivities = async (req, res) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const sortConfig = getSortConfig(req.query.sort, activitySortMap, 'latest');
    const filter = applyActivityFilters(req.query, { userId: req.user.userId });

    const [totalItems, activities] = await Promise.all([
      Activity.countDocuments(filter),
      Activity.find(filter)
      .populate('userId', 'name email role')
      .populate('cropId', 'name type stage')
      .sort(sortConfig)
      .skip(skip)
      .limit(limit),
    ]);

    const pagination = buildPaginationMeta({ totalItems, page, limit });

    return res.status(200).json({
      activities,
      data: activities,
      ...pagination,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch activities' });
  }
};

export const getActivityById = async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id)
      .populate('userId', 'name email role')
      .populate('cropId', 'name type stage');

    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }

    if (!isAdmin(req) && String(activity.userId._id) !== req.user.userId) {
      return res.status(403).json({ message: 'You can only access your own activities' });
    }

    return res.status(200).json({ activity });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch activity' });
  }
};

export const updateActivity = async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id);

    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }

    if (!isAdmin(req) && String(activity.userId) !== req.user.userId) {
      return res.status(403).json({ message: 'You can only update your own activities' });
    }

    const updatedActivity = await Activity.findByIdAndUpdate(
      req.params.id,
      {
        cropId: req.body.cropId ?? activity.cropId,
        activityType: req.body.activityType ?? activity.activityType,
        title: req.body.title ?? activity.title,
        description: req.body.description ?? activity.description,
        activityDate: req.body.activityDate ?? activity.activityDate,
        status: req.body.status ?? activity.status,
        priority: req.body.priority ?? activity.priority,
        fieldLocation: req.body.fieldLocation ?? activity.fieldLocation,
      },
      { new: true, runValidators: true }
    )
      .populate('userId', 'name email role')
      .populate('cropId', 'name type stage');

    return res.status(200).json({ message: 'Activity updated successfully', activity: updatedActivity });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update activity' });
  }
};

export const deleteActivity = async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id);

    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }

    if (!isAdmin(req) && String(activity.userId) !== req.user.userId) {
      return res.status(403).json({ message: 'You can only delete your own activities' });
    }

    await Activity.findByIdAndDelete(req.params.id);
    return res.status(200).json({ message: 'Activity deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete activity' });
  }
};

export const getAllActivitiesForAdmin = async (req, res) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const sortConfig = getSortConfig(req.query.sort, activitySortMap, 'latest');
    const filter = applyActivityFilters(req.query);

    const [totalItems, activities] = await Promise.all([
      Activity.countDocuments(filter),
      Activity.find(filter)
      .populate('userId', 'name email role')
      .populate('cropId', 'name type stage')
      .sort(sortConfig)
      .skip(skip)
      .limit(limit),
    ]);

    const pagination = buildPaginationMeta({ totalItems, page, limit });

    return res.status(200).json({
      activities,
      data: activities,
      ...pagination,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch all activities' });
  }
};
