import {Schema,model} from "mongoose";

    
const campaign_schema = new Schema({
    user_id :{type : String, required : true},
    owner : {type : String , required : true},
    campaign_address : {type :String , required : true,unique : true},
    title  : {type :String,required : true},
    description : {type : String, required : true},
    img_url : {type : String , required : true},
    pdf_url : {type : String , required : true},
    min_amount : {type : Number , required : true},
    max_amount : {type : Number , required : true},
    funding_type : {type : Number , required : true},
    category : {type : String , required : true},
    campaing_end_date : {type : Date , required : true},
    total_funded : {type : Number , required : true,default : 0},
    total_investors : {type : Number , required : true,default : 0},
    status : {type : String , required : true,},
},{
    timestamps : true
})

const Campaign = model("campaign",campaign_schema);

export default Campaign;