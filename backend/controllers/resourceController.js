import Resource from '../models/Resource.js';
import { buildPaginationMeta, getSortConfig, parsePagination } from '../services/queryService.js';

const isAdmin = (req) => req.user?.role === 'admin';

const resourceSortMap = {
  latest: { usageDate: -1, createdAt: -1 },
  oldest: { usageDate: 1, createdAt: 1 },
  'name-asc': { resourceType: 1 },
  'name-desc': { resourceType: -1 },
  'highest-cost': { cost: -1 },
  'lowest-cost': { cost: 1 },
};

const applyResourceFilters = (query, scope = {}) => {
  const filter = { ...scope };

  if (query.resourceType) {
    filter.resourceType = query.resourceType;
  }

  if (query.fromDate || query.toDate) {
    filter.usageDate = {};
    if (query.fromDate) {
      filter.usageDate.$gte = new Date(query.fromDate);
    }
    if (query.toDate) {
      filter.usageDate.$lte = new Date(query.toDate);
    }
  }

  if (query.minCost || query.maxCost) {
    filter.cost = {};
    if (query.minCost) {
      filter.cost.$gte = Number(query.minCost);
    }
    if (query.maxCost) {
      filter.cost.$lte = Number(query.maxCost);
    }
  }

  if (query.search) {
    const searchRegex = new RegExp(query.search, 'i');
    filter.$or = [
      { resourceType: searchRegex },
      { supplier: searchRegex },
      { fieldLocation: searchRegex },
      { notes: searchRegex },
    ];
  }

  return filter;
};

export const createResource = async (req, res) => {
  try {
    const { resourceType, quantity, unit, cost, usageDate, fieldLocation, supplier, notes } = req.body;

    if (!resourceType || quantity === undefined || !unit || cost === undefined || !usageDate) {
      return res.status(400).json({ message: 'resourceType, quantity, unit, cost, and usageDate are required' });
    }

    const resource = await Resource.create({
      userId: req.user.userId,
      resourceType,
      quantity,
      unit,
      cost,
      usageDate,
      fieldLocation: fieldLocation || '',
      supplier: supplier || '',
      notes: notes || '',
    });

    return res.status(201).json({ message: 'Resource created successfully', resource });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create resource' });
  }
};

export const getMyResources = async (req, res) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const sortConfig = getSortConfig(req.query.sort, resourceSortMap, 'latest');
    const filter = applyResourceFilters(req.query, { userId: req.user.userId });

    const [totalItems, resources] = await Promise.all([
      Resource.countDocuments(filter),
      Resource.find(filter)
      .populate('userId', 'name email role')
      .sort(sortConfig)
      .skip(skip)
      .limit(limit),
    ]);

    const pagination = buildPaginationMeta({ totalItems, page, limit });

    return res.status(200).json({
      resources,
      data: resources,
      ...pagination,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch resources' });
  }
};

export const getResourceById = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id).populate('userId', 'name email role');

    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    if (!isAdmin(req) && String(resource.userId._id) !== req.user.userId) {
      return res.status(403).json({ message: 'You can only access your own resources' });
    }

    return res.status(200).json({ resource });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch resource' });
  }
};

export const updateResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    if (!isAdmin(req) && String(resource.userId) !== req.user.userId) {
      return res.status(403).json({ message: 'You can only update your own resources' });
    }

    const updatedResource = await Resource.findByIdAndUpdate(
      req.params.id,
      {
        resourceType: req.body.resourceType ?? resource.resourceType,
        quantity: req.body.quantity ?? resource.quantity,
        unit: req.body.unit ?? resource.unit,
        cost: req.body.cost ?? resource.cost,
        usageDate: req.body.usageDate ?? resource.usageDate,
        fieldLocation: req.body.fieldLocation ?? resource.fieldLocation,
        supplier: req.body.supplier ?? resource.supplier,
        notes: req.body.notes ?? resource.notes,
      },
      { new: true, runValidators: true }
    ).populate('userId', 'name email role');

    return res.status(200).json({ message: 'Resource updated successfully', resource: updatedResource });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update resource' });
  }
};

export const deleteResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    if (!isAdmin(req) && String(resource.userId) !== req.user.userId) {
      return res.status(403).json({ message: 'You can only delete your own resources' });
    }

    await Resource.findByIdAndDelete(req.params.id);
    return res.status(200).json({ message: 'Resource deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete resource' });
  }
};

export const getAllResourcesForAdmin = async (req, res) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const sortConfig = getSortConfig(req.query.sort, resourceSortMap, 'latest');
    const filter = applyResourceFilters(req.query);

    const [totalItems, resources] = await Promise.all([
      Resource.countDocuments(filter),
      Resource.find(filter)
      .populate('userId', 'name email role')
      .sort(sortConfig)
      .skip(skip)
      .limit(limit),
    ]);

    const pagination = buildPaginationMeta({ totalItems, page, limit });

    return res.status(200).json({
      resources,
      data: resources,
      ...pagination,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch all resources' });
  }
};
