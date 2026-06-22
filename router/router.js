import {Router} from "express";
import { validateJWT } from "../controller/authController.js";
import { getNonce, verifyWallet,createCampaign,getAllCampaigns,getCampaignById,investCampaign, updateCampaign, getMyCampaigns } from "../controller/mainController.js";
const route = Router();


route.get('/auth-wallet/get-nonce',getNonce);
route.post('/auth-wallet/verify',verifyWallet);
route.post('/get-Allcampaign',getAllCampaigns)
route.get('/getCampaginByUser/:campaignAddr',getCampaignById);

route.use(validateJWT);
route.post('/create-campaign',createCampaign);
route.post('/invest-campaign',investCampaign);
route.post('/update-campaign',updateCampaign);
route.get('/my-campaigns',getMyCampaigns);




export default route;