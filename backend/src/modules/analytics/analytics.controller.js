import * as analyticsService from './analytics.service.js';

export const getDeepAnalytics = async (req, res) => {
  try {
    const data = await analyticsService.getDeepAnalytics(req.query);
    res.json({ message: 'Get deep analytics success', data });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
