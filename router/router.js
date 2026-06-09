import {Router} from "express";
import { validateJWT } from "../controller/authController.js";
import { getNonce, verifyWallet,createCampaign,getCampaigns } from "../controller/mainController.js";
const route = Router();


route.get('/auth-wallet/get-nonce',getNonce);
route.post('/auth-wallet/verify',verifyWallet);

route.post('/create-campaign',validateJWT,createCampaign);
route.post('/get-campaign',getCampaigns)
export default route;