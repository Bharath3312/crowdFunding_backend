import {Schema, model} from "mongoose";

const investor_schema = new Schema({
    campaign_id : {type : String , required : true},
    wallet_address : {type : String , required : true},
    amount : {type : Number , required : true},
    invested_at : {type : Date , required : true, default : Date.now},
    status : {type : String , required : true}
},{
    timestamps : true
})

const Investor = model("investor",investor_schema);

export default Investor;