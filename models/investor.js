import {Schema, model} from "mongoose";

const investor_schema = new Schema({
    campaign_id : {type : String , required : true},
    wallet_address : {type : String , required : true},
    amount : {type : Number , required : true},
    status : {type : Boolean ,default : true, required : true}
},{
    timestamps : true
})

const Investor = model("investor",investor_schema);

export default Investor;