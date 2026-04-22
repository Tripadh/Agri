import {
  searchActivities,
  searchCrops,
  searchResources,
  searchUsers,
} from '../services/searchService.js';

const parseQuery = (req) => (req.query.query || '').trim();

const validateQuery = (query, res) => {
  if (!query) {
    res.status(400).json({ message: 'Search query is required' });
    return false;
  }
  return true;
};

export const globalSearch = async (req, res) => {
  try {
    const query = parseQuery(req);
    if (!validateQuery(query, res)) return;

    const isAdmin = req.user?.role === 'admin';
    const [crops, resources, activities, users] = await Promise.all([
      searchCrops({ query, userId: req.user.userId, isAdmin }),
      searchResources({ query, userId: req.user.userId, isAdmin }),
      searchActivities({ query, userId: req.user.userId, isAdmin }),
      isAdmin ? searchUsers({ query }) : Promise.resolve([]),
    ]);

    return res.status(200).json({
      query,
      crops,
      resources,
      activities,
      users,
      totals: {
        crops: crops.length,
        resources: resources.length,
        activities: activities.length,
        users: users.length,
      },
    });
  } catch {
    return res.status(500).json({ message: 'Failed to perform global search' });
  }
};

export const searchOnlyCrops = async (req, res) => {
  try {
    const query = parseQuery(req);
    if (!validateQuery(query, res)) return;

    const crops = await searchCrops({
      query,
      userId: req.user.userId,
      isAdmin: req.user.role === 'admin',
    });

    return res.status(200).json({ query, crops, total: crops.length });
  } catch {
    return res.status(500).json({ message: 'Failed to search crops' });
  }
};

export const searchOnlyResources = async (req, res) => {
  try {
    const query = parseQuery(req);
    if (!validateQuery(query, res)) return;

    const resources = await searchResources({
      query,
      userId: req.user.userId,
      isAdmin: req.user.role === 'admin',
    });

    return res.status(200).json({ query, resources, total: resources.length });
  } catch {
    return res.status(500).json({ message: 'Failed to search resources' });
  }
};

export const searchOnlyActivities = async (req, res) => {
  try {
    const query = parseQuery(req);
    if (!validateQuery(query, res)) return;

    const activities = await searchActivities({
      query,
      userId: req.user.userId,
      isAdmin: req.user.role === 'admin',
    });

    return res.status(200).json({ query, activities, total: activities.length });
  } catch {
    return res.status(500).json({ message: 'Failed to search activities' });
  }
};

export const searchOnlyUsers = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden. Admin access required.' });
    }

    const query = parseQuery(req);
    if (!validateQuery(query, res)) return;

    const users = await searchUsers({ query });
    return res.status(200).json({ query, users, total: users.length });
  } catch {
    return res.status(500).json({ message: 'Failed to search users' });
  }
};
