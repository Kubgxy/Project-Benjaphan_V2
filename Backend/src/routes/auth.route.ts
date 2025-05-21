import express from 'express';
import { socialLogin, handleGoogleCallback, startGoogleOAuth, startFacebookOAuth, handleFacebookCallback } from '../controllers/auth.controller';

const auth = express.Router();

auth.post('/social-login', socialLogin);
auth.get('/start-google-login', startGoogleOAuth);
auth.get('/social-login/google', handleGoogleCallback);
auth.get('/start-facebook-login', startFacebookOAuth);
auth.get('/social-login/facebook', handleFacebookCallback);

export default auth;