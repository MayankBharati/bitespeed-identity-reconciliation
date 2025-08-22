import { Request, Response } from 'express';
import { ContactService } from '../services/contactService';

const contactService = new ContactService();

export const identify = async (req: Request, res: Response) => {
  try {
    const { email, phoneNumber } = req.body;
    
    const result = await contactService.identify({ email, phoneNumber });
    
    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
