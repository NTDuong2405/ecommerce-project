import * as marketingService from './marketing.service.js';

export const getPromotions = async (req, res) => {
  try {
    const data = await marketingService.getAllPromotions();
    res.json({ message: 'Get promotions success', data });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createPromotion = async (req, res) => {
  try {
    const data = await marketingService.createPromotion(req.body);
    res.status(201).json({ message: 'Create promotion success', data });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getBirthdays = async (req, res) => {
  try {
    const data = await marketingService.getUpcomingBirthdays();
    res.json({ message: 'Get upcoming birthdays success', data });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const sendBirthdayWish = async (req, res) => {
  try {
    const { userId } = req.params;
    const data = await marketingService.sendBirthdayWish(parseInt(userId));
    res.json({ message: 'Send birthday wish success', data });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deletePromotion = async (req, res) => {
  try {
    const { id } = req.params;
    await marketingService.deletePromotion(id);
    res.json({ message: 'Delete promotion success' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
