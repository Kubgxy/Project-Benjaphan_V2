import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import User from '../Models_GPT/User'; // ✅ ปรับ path ให้ตรงกับโปรเจ็ค
import dotenv from 'dotenv';

dotenv.config();

export const socialLogin = async (req: Request, res: Response) => {
    const { provider, providerId, email, firstName, lastName, avatar } = req.body;

    if (!provider || !providerId || !email || !firstName || !lastName) {
        res.status(400).json({ message: 'Missing required fields' });
        return
    }

    try {
        let user = await User.findOne({ provider, providerId });

        if (!user) {
            // ถ้ายังไม่มี user -> สร้างใหม่
            user = new User({
                email,
                firstName,
                lastName,
                avatar,
                provider,
                providerId,
                password: null, // Social login ไม่ต้องใช้ password
                isVerified: true, // Social login ถือว่ายืนยันแล้ว
            });
            await user.save();
        }

        // สร้าง JWT token
        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET!,
            { expiresIn: '1d' }
        );

        // ส่ง token กลับแบบ cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000, // 7 วัน
        });

        res.status(200).json({ message: 'Login success', user });
    } catch (error) {
        console.error('❌ Social login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const startGoogleOAuth = (req: Request, res: Response) => {
  const redirectUri = 'http://localhost:3000/api/auth/social-login/google';
  const clientId = process.env.GOOGLE_CLIENT_ID!;
  const scope = encodeURIComponent('openid email profile');

  const oauthURL = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&access_type=offline&prompt=consent`;

  res.redirect(oauthURL);
};

export const handleGoogleCallback = async (req: Request, res: Response) => {
  try {
    // ✅ 1. ดึง authorization code จาก query
    const code = req.query.code as string;

    if (!code) {
        res.status(400).json({ message: 'Missing authorization code' });
        return
    }

    // ✅ 2. ขอ access_token จาก Google OAuth
    const tokenResponse = await axios.post(
      'https://oauth2.googleapis.com/token',
      {
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: 'http://localhost:3000/api/auth/social-login/google',
        grant_type: 'authorization_code',
      },
      { headers: { 'Content-Type': 'application/json' } }
    );

    const access_token = tokenResponse.data.access_token;

    // ✅ 3. ใช้ access_token ไปขอข้อมูลผู้ใช้จาก Google
    const userInfo = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    const { email, name, picture, id: providerId } = userInfo.data;

    // ✅ 4. แยกชื่อจริง-นามสกุล
    const [firstName, ...lastNameParts] = name.split(' ');
    const lastName = lastNameParts.join(' ');

    // ✅ 5. ตรวจสอบว่าเคยสมัครไว้แล้วหรือยัง
    let user = await User.findOne({ email });

    if (!user) {
      user = new User({
        email,
        firstName,
        lastName,
        avatar: picture,
        provider: 'google',
        providerId,
        password: null, // ❌ ไม่ต้องใช้ password
        isVerified: true,
      });

      await user.save();
    }

    // ✅ 6. สร้าง JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '1d' }
    );

    // ✅ 7. ส่ง token กลับแบบ cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000, // 1 วัน
    });

    // ✅ 8. redirect กลับไป frontend
    res.redirect('http://localhost:5173/');
  } catch (error) {
    console.error('🔴 Google callback error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
};

export const startFacebookOAuth = (req: Request, res: Response) => {
  const clientId = process.env.FACEBOOK_CLIENT_ID!;
  const redirectUri = encodeURIComponent('http://localhost:3000/api/auth/social-login/facebook');
  const scope = 'email public_profile';

  const authUrl = `https://www.facebook.com/v11.0/dialog/oauth?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=code`;

  res.redirect(authUrl);
};

export const handleFacebookCallback = async (req: Request, res: Response) => {
  try {
    const code = req.query.code as string;

    if (!code) {
        res.status(400).json({ message: 'Missing authorization code' });
        return
    }

    // 1. ขอ access_token
    const tokenResponse = await axios.get(
      'https://graph.facebook.com/v11.0/oauth/access_token',
      {
        params: {
          client_id: process.env.FACEBOOK_CLIENT_ID,
          client_secret: process.env.FACEBOOK_CLIENT_SECRET,
          redirect_uri: 'http://localhost:3000/api/auth/social-login/facebook',
          code,
        },
      }
    );

    const access_token = tokenResponse.data.access_token;

    // 2. ดึงข้อมูลผู้ใช้
    const userInfo = await axios.get('https://graph.facebook.com/me', {
      params: {
        access_token,
        fields: 'id,name,email,picture',
      },
    });

    const { email, name, id: providerId } = userInfo.data;
    const picture = userInfo.data.picture?.data?.url;

    const [firstName, ...lastNameParts] = name.split(' ');
    const lastName = lastNameParts.join(' ');

    let user = await User.findOne({ email });

    if (!user) {
      user = new User({
        email,
        firstName,
        lastName,
        avatar: picture,
        provider: 'facebook',
        providerId,
        password: null,
        isVerified: true,
      });
      await user.save();
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '1d' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.redirect('http://localhost:5173');
  } catch (err) {
    console.error('❌ Facebook callback error:', err);
    res.status(500).json({ message: 'Facebook login failed' });
  }
};
