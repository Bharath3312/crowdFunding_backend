import { Schema,model } from "mongoose";



const vote_schema =new  Schema({
    campaign_id : {type : String , required : true},
    amount : {type : Number , required : true},
    yesVote :{type : Number , required : true, default : 0},
    yesVoters : [{type : String}],
    noVote : {type : Number , required : true, default : 0},
    noVoters : [{type : String}],
    status : {type : String, enum : ['Processing', 'Completed', 'Failed'], default : 'Processing'},

},{
    timeStamps : true
})

const Votes = model("vote",vote_schema);

export default Votes;