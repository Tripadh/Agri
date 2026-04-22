import Crop from '../models/Crop.js';
import { buildPaginationMeta, getSortConfig, parsePagination } from '../services/queryService.js';

const isAdmin = (req) => req.user?.role === 'admin';

const cropSortMap = {
  latest: { createdAt: -1 },
  oldest: { createdAt: 1 },
  'name-asc': { name: 1 },
  'name-desc': { name: -1 },
};

const applyCropFilters = (query, scope = {}) => {
  const filter = { ...scope };

  if (query.cropType) {
    filter.type = query.cropType;
  }

  if (query.growthStage) {
    filter.stage = query.growthStage;
  }

  if (query.fromDate || query.toDate) {
    filter.plantedDate = {};
    if (query.fromDate) {
      filter.plantedDate.$gte = new Date(query.fromDate);
    }
    if (query.toDate) {
      filter.plantedDate.$lte = new Date(query.toDate);
    }
  }

  if (query.search) {
    const searchRegex = new RegExp(query.search, 'i');
    filter.$or = [{ name: searchRegex }, { type: searchRegex }, { stage: searchRegex }, { notes: searchRegex }];
  }

  return filter;
};

export const createCrop = async (req, res) => {
  try {
    const { name, type, stage, plantedDate, notes } = req.body;

    if (!name || !type || !stage) {
      return res.status(400).json({ message: 'Name, type, and stage are required' });
    }

    const crop = await Crop.create({
      name,
      type,
      stage,
      plantedDate: plantedDate || Date.now(),
      notes: notes || '',
      createdBy: req.user.userId,
    });

    return res.status(201).json({ message: 'Crop created successfully', crop });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create crop' });
  }
};

export const getMyCrops = async (req, res) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const sortConfig = getSortConfig(req.query.sort, cropSortMap, 'latest');
    const filter = applyCropFilters(req.query, { createdBy: req.user.userId });

    const [totalItems, crops] = await Promise.all([
      Crop.countDocuments(filter),
      Crop.find(filter)
      .populate('createdBy', 'name email role')
      .sort(sortConfig)
      .skip(skip)
      .limit(limit),
    ]);

    const pagination = buildPaginationMeta({ totalItems, page, limit });

    return res.status(200).json({
      crops,
      data: crops,
      ...pagination,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch crops' });
  }
};

export const getCropById = async (req, res) => {
  try {
    const crop = await Crop.findById(req.params.id).populate('createdBy', 'name email role');

    if (!crop) {
      return res.status(404).json({ message: 'Crop not found' });
    }

    if (!isAdmin(req) && String(crop.createdBy._id) !== req.user.userId) {
      return res.status(403).json({ message: 'You can only access your own crops' });
    }

    return res.status(200).json({ crop });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch crop' });
  }
};

export const updateCrop = async (req, res) => {
  try {
    const crop = await Crop.findById(req.params.id);

    if (!crop) {
      return res.status(404).json({ message: 'Crop not found' });
    }

    if (!isAdmin(req) && String(crop.createdBy) !== req.user.userId) {
      return res.status(403).json({ message: 'You can only update your own crops' });
    }

    const updatedCrop = await Crop.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name ?? crop.name,
        type: req.body.type ?? crop.type,
        stage: req.body.stage ?? crop.stage,
        plantedDate: req.body.plantedDate ?? crop.plantedDate,
        notes: req.body.notes ?? crop.notes,
      },
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email role');

    return res.status(200).json({ message: 'Crop updated successfully', crop: updatedCrop });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update crop' });
  }
};

export const deleteCrop = async (req, res) => {
  try {
    const crop = await Crop.findById(req.params.id);

    if (!crop) {
      return res.status(404).json({ message: 'Crop not found' });
    }

    if (!isAdmin(req) && String(crop.createdBy) !== req.user.userId) {
      return res.status(403).json({ message: 'You can only delete your own crops' });
    }

    await Crop.findByIdAndDelete(req.params.id);

    return res.status(200).json({ message: 'Crop deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete crop' });
  }
};

export const getAllCropsForAdmin = async (req, res) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const sortConfig = getSortConfig(req.query.sort, cropSortMap, 'latest');
    const filter = applyCropFilters(req.query);

    const [totalItems, crops] = await Promise.all([
      Crop.countDocuments(filter),
      Crop.find(filter)
      .populate('createdBy', 'name email role')
      .sort(sortConfig)
      .skip(skip)
      .limit(limit),
    ]);

    const pagination = buildPaginationMeta({ totalItems, page, limit });

    return res.status(200).json({
      crops,
      data: crops,
      ...pagination,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch all crops' });
  }
};
