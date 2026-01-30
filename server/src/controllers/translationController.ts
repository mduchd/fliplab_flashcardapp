import { Request, Response } from 'express';
// @ts-ignore
import { translate } from 'google-translate-api-x';

export const translateText = async (req: Request, res: Response) => {
  try {
    const { text, to = 'vi', from = 'auto' } = req.body;
    
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ 
        success: false, 
        message: 'Vui lòng cung cấp văn bản cần dịch (text)' 
      });
    }

    // Using google-translate-api-x
    // Cast result to any because the library types are complex (single vs array)
    const result = await translate(text, { from, to, forceBatch: false }) as any;

    return res.status(200).json({
      success: true,
      data: {
        original: text,
        translated: result.text,
        from: result.from?.language?.iso || 'auto',
        to: to
      }
    });

  } catch (error: any) {
    console.error('Translation error detailed:', error);
    
    // Check for 429 Too Many Requests
    if (error?.statusCode === 429) {
       return res.status(429).json({
          success: false,
          message: 'Hệ thống đang bận, vui lòng thử lại sau vài giây.'
       });
    }

    return res.status(500).json({
      success: false,
      message: 'Không thể dịch văn bản lúc này',
      error: error.message
    });
  }
};
