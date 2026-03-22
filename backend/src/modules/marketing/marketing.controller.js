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

export const validateCoupon = async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ message: "Vui lòng nhập mã giảm giá" });
    const data = await marketingService.validateCoupon(code.toUpperCase());
    res.json({ message: 'Mã giảm giá hợp lệ', data });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

import { verifyToken } from '../../utils/jwt.js';

export const getAvailablePromotions = async (req, res) => {
  try {
    let userId = null;
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded = verifyToken(token);
        userId = decoded.id || decoded.userId;
      } catch (err) {
        // Token hết hạn hoặc sai thì thôi, coi như guest
      }
    }

    const data = await marketingService.getAvailablePromotions(userId);
    res.json({ message: 'Get active promotions success', data });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
