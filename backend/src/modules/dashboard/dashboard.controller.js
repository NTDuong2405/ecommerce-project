import * as dashboardService from './dashboard.service.js';

export const getStats = async (req, res) => {
  try {
    const data = await dashboardService.getAdminStats();
    res.json({
      message: 'Get dashboard stats success',
      data
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
