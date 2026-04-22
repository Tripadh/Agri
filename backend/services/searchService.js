import Activity from '../models/Activity.js';
import Crop from '../models/Crop.js';
import Resource from '../models/Resource.js';
import User from '../models/User.js';
import { buildRegex } from './queryService.js';

const mapCropProjection = {
  _id: 1,
  name: 1,
  type: 1,
  stage: 1,
  plantedDate: 1,
  createdBy: 1,
};

const mapResourceProjection = {
  _id: 1,
  resourceType: 1,
  quantity: 1,
  unit: 1,
  cost: 1,
  usageDate: 1,
  fieldLocation: 1,
  supplier: 1,
  userId: 1,
};

const mapActivityProjection = {
  _id: 1,
  title: 1,
  activityType: 1,
  status: 1,
  priority: 1,
  fieldLocation: 1,
  activityDate: 1,
  userId: 1,
};

export const searchCrops = async ({ query, userId, isAdmin }) => {
  const regex = buildRegex(query);

  const filter = {
    ...(isAdmin ? {} : { createdBy: userId }),
    $or: [{ name: regex }, { type: regex }, { stage: regex }, { notes: regex }],
  };

  return Crop.find(filter)
    .select(mapCropProjection)
    .populate('createdBy', 'name email role')
    .sort({ createdAt: -1 })
    .limit(15);
};

export const searchResources = async ({ query, userId, isAdmin }) => {
  const regex = buildRegex(query);

  const filter = {
    ...(isAdmin ? {} : { userId }),
    $or: [{ resourceType: regex }, { supplier: regex }, { fieldLocation: regex }, { notes: regex }],
  };

  return Resource.find(filter)
    .select(mapResourceProjection)
    .populate('userId', 'name email role')
    .sort({ usageDate: -1, createdAt: -1 })
    .limit(15);
};

export const searchActivities = async ({ query, userId, isAdmin }) => {
  const regex = buildRegex(query);

  const filter = {
    ...(isAdmin ? {} : { userId }),
    $or: [{ title: regex }, { activityType: regex }, { status: regex }, { priority: regex }, { fieldLocation: regex }, { description: regex }],
  };

  return Activity.find(filter)
    .select(mapActivityProjection)
    .populate('userId', 'name email role')
    .populate('cropId', 'name type')
    .sort({ activityDate: -1, createdAt: -1 })
    .limit(15);
};

export const searchUsers = async ({ query }) => {
  const regex = buildRegex(query);

  return User.find({
    $or: [{ name: regex }, { email: regex }, { role: regex }],
  })
    .select('_id name email role createdAt')
    .sort({ createdAt: -1 })
    .limit(15);
};
