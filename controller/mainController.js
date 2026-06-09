import { ethers } from "ethers";
import {Users,Campaign} from "../models/index.js";
import Crypto from "crypto";
import { generateJWT } from "./authController.js";


export  const getNonce = async(req,res)=>{
    try {
        const {walletAddress} = req.query;
        if(!walletAddress)  throw new Error( "Wallet required");

        const signNonce = Crypto.randomBytes(16).toString("hex");

        const checkAccount = await Users.findOne({wallet_address : walletAddress});
        if(checkAccount){
            checkAccount.nonce = signNonce;
            checkAccount.nonce_updated_at = Date.now();
            await checkAccount.save();
        }else{
            await User.create({
                wallet_address : walletAddress,
                nonce : signNonce,
                nonce_updated_at : Date.now()
            })
        }

        res.json({
            nonce: `Sign this message to login: ${signNonce}`,
            message : "Nonce generated successfully",
            success: true,
          })
    } catch (error) {
            res.json({status : false , msg : error.message || 'Internal Server Error'})
    }
}


export const verifyWallet = async(req,res)=>{
    try {
        const {walletAddress, signature, nonce} = req.body;
        if (!walletAddress || !signature || !nonce) throw new Error('Missing fields');

        const signer = ethers.verifyMessage(nonce,signature);

         if (signer.toLowerCase() !== walletAddress.toLowerCase()) throw new Error("Invalid signature")
            
        const nonceId = nonce.split("login: ")[1];
        const userAccount = await Users.findOne({wallet_address : walletAddress});
        if(!userAccount || !userAccount?.nonce) throw new Error("Account not found");
        if(userAccount.nonce !== nonceId) throw new Error("Invalid nonce");

        if(Date.now() - userAccount.nonce_updated_at > 5 * 60 * 1000) throw new Error("Nonce expired");

        await Users.findOneAndUpdate({wallet_address : walletAddress}, {nonce : null, nonce_updated_at : null});
        const token = await generateJWT({walletAddress,user_id : userAccount._id});
         res.json({
            message : "Wallet verified successfully",
            success: true,
            token,
            user : userAccount
          })
        // Generate JWT or session here
    } catch (error) {
        res.json({status : false , msg : error.message || 'Internal Server Error'});
    }
}


export const createCampaign = async(req,res)=>{
    try {
         const { 
        campaignAddress,
        title,
        description,
        imgUrl,
        pdfUrl,
        owner,
        minAmount,
        maxAmount,
        category,
        deadline,
        fundingType,
        status 
      } = await req.body;
    //   const validation = await 
    const createData = await Campaign.create({
        owner : validation.data.wallet,
        user_id : validation.data.user_id,
        campaign_address : campaignAddress,
        title,
        description,
        img_url : imgUrl,
        pdf_url : pdfUrl,
        min_amount : minAmount,
        max_amount : maxAmount,
        funding_type : fundingType, //AllorNothing , Flexible
        category, //Technology, Art, Music, Film, Games, Publishing, Food, Fashion, Design, Social Impact, Education, Health, etc...Sports, Travel
        campaign_end_date: new Date(deadline * 1000).toISOString(),
        total_funded : 0,
        total_investors : 0,
        status,
    })
    if(!createData) throw new Error("Campaign creation failed");
    
    res.json({
        message : "Campaign created successfully",
        success: true,
        campaign : createData
    })
    } catch (error) {
        res.json({status : false , msg : error.message || 'Internal Server Error'})
    }
}


export const investCampagin = async()=>{
    try{
        const {
            campaign_id,
            wallet,
            amount
        } = await req.body;

        const campaign = await Campaign.findById(campaign_id);
        if(!campaign) throw new Error("Campaign not found");
        if(campaign.campaing_end_date < Date.now()) throw new Error("Campaign ended");
        if(amount < campaign.min_amount) throw new Error("Amount less than minimum");
        if(amount > campaign.max_amount) throw new Error("Amount greater than maximum");

        //Check if user already invested
        const checkInvestor = await Investor.findOne({campaign_id, wallet_address : wallet});
        if(checkInvestor) {
            //Update investor details
            checkInvestor.amount += amount;
            checkInvestor.invested_at = Date.now();
            await checkInvestor.save();
        }else{
            //Add investor details to investor collection
            await Investor.create({
                campaign_id,
                wallet_address : wallet,
                amount,
                invested_at : Date.now(),
                status : true
            })
    
            //Update campaign details
            campaign.total_funded += amount;
            campaign.total_investors += 1;
            await campaign.save();
        }
        res.json({
            message : "Investment successful",
            success: true,
            campaign
        })
    }
    catch(error){
        res.json({status : false , msg : error.message || 'Internal Server Error'})
    }
}


export const getCampaigns = async (req,res)=>{
    try{
        const {campaignAddress} =  req.body;
        const query ={};
        if(campaignAddress) query.campaign_address = campaignAddress;

        const campaigns = await Campaign.find(query);
        res.json({
            message : "Campaigns fetched successfully",
            success: true,
            campaigns
        })  
    }catch (error) {
        res.json({status : false , msg : error.message || 'Internal Server Error'})
    }
}