import { ethers } from 'ethers';
import { Users, Campaign, Investor } from '../models/index.js';
import Crypto from 'crypto';
import { generateJWT } from './authController.js';

const respondError = (res, error, code = 400) =>
    res.status(code).json({ status: false, message: error?.message || 'Internal Server Error' });

export const getNonce = async (req, res) => {
    try {
        const { walletAddress } = req.query;
        if (!walletAddress) return respondError(res, new Error('Wallet required'));

        const signNonce = Crypto.randomBytes(16).toString('hex');

        const checkAccount = await Users.findOne({ wallet_address: walletAddress });
        if (checkAccount) {
            checkAccount.nonce = signNonce;
            checkAccount.nonce_updated_at = Date.now();
            await checkAccount.save();
        } else {
            await Users.create({
                wallet_address: walletAddress,
                nonce: signNonce,
                nonce_updated_at: Date.now(),
            });
        }

        return res.status(200).json({
            nonce: `Sign this message to login: ${signNonce}`,
            message: 'Nonce generated successfully',
            success: true,
        });
    } catch (error) {
        return respondError(res, error, 500);
    }
};

export const verifyWallet = async (req, res) => {
    try {
        const { walletAddress, signature, nonce } = req.body;
        if (!walletAddress || !signature || !nonce) return respondError(res, new Error('Missing fields'));

        const signer = ethers.verifyMessage(nonce, signature);
        if (signer.toLowerCase() !== walletAddress.toLowerCase()) return respondError(res, new Error('Invalid signature'));

        const nonceId = nonce.split('login: ')[1] || nonce;
        const userAccount = await Users.findOne({ wallet_address: walletAddress });
        if (!userAccount || !userAccount.nonce) return respondError(res, new Error('Account not found'));
        if (userAccount.nonce !== nonceId) return respondError(res, new Error('Invalid nonce'));

        if (Date.now() - userAccount.nonce_updated_at > 5 * 60 * 1000) return respondError(res, new Error('Nonce expired'));

        await Users.findOneAndUpdate({ wallet_address: walletAddress }, { nonce: null, nonce_updated_at: null });
        const token = await generateJWT({ walletAddress, user_id: userAccount._id });
        return res.status(200).json({ message: 'Wallet verified successfully', success: true, token, user: userAccount });
    } catch (error) {
        return respondError(res, error, 500);
    }
};

export const createCampaign = async (req, res) => {
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
            status,
        } = req.body;

        if (!campaignAddress || !title || !owner) return respondError(res, new Error('Missing required fields'));

        const campaignEndDate = deadline ? new Date(Number(deadline) * 1000).toISOString() : null;

        const createData = await Campaign.create({
            owner,
            user_id: null,
            campaign_address: campaignAddress,
            title,
            description,
            img_url: imgUrl,
            pdf_url: pdfUrl,
            min_amount: minAmount || 0,
            max_amount: maxAmount || 0,
            funding_type: fundingType,
            category,
            campaign_end_date: campaignEndDate,
            total_funded: 0,
            total_investors: 0,
            status,
        });

        if (!createData) return respondError(res, new Error('Campaign creation failed'), 500);

        return res.status(201).json({ message: 'Campaign created successfully', success: true, campaign: createData });
    } catch (error) {
        return respondError(res, error, 500);
    }
};

export const investCampaign = async (req, res) => {
    try {
        const { campaign_id, wallet, amount } = req.body;
        if (!campaign_id || !wallet || !amount) return respondError(res, new Error('Missing fields'));

        const campaign = await Campaign.findById(campaign_id);
        if (!campaign) return respondError(res, new Error('Campaign not found'), 404);

        const campaignEnd = campaign.campaign_end_date ? new Date(campaign.campaign_end_date).getTime() : null;
        if (campaignEnd && campaignEnd < Date.now()) return respondError(res, new Error('Campaign ended'));

        if (amount < (campaign.min_amount || 0)) return respondError(res, new Error('Amount less than minimum'));
        if (campaign.max_amount && amount > campaign.max_amount) return respondError(res, new Error('Amount greater than maximum'));

        const checkInvestor = await Investor.findOne({ campaign_id, wallet_address: wallet });
        if (checkInvestor) {
            checkInvestor.amount = Number(checkInvestor.amount) + Number(amount);
            checkInvestor.invested_at = Date.now();
            await checkInvestor.save();
            campaign.total_funded = Number(campaign.total_funded) + Number(amount);
            await campaign.save();
        } else {
            await Investor.create({ campaign_id, wallet_address: wallet, amount, invested_at: Date.now(), status: true });
            campaign.total_funded = Number(campaign.total_funded) + Number(amount);
            campaign.total_investors = (campaign.total_investors || 0) + 1;
            await campaign.save();
        }

        return res.status(200).json({ message: 'Investment successful', success: true, campaign });
    } catch (error) {
        return respondError(res, error, 500);
    }
};

export const getCampaigns = async (req, res) => {
    try {
        const { campaignAddress } = req.query;
        const query = {};
        if (campaignAddress) query.campaign_address = campaignAddress;

        const campaigns = await Campaign.find(query);
        return res.status(200).json({ message: 'Campaigns fetched successfully', success: true, campaigns });
    } catch (error) {
        return respondError(res, error, 500);
    }
};