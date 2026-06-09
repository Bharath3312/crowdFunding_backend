import {Schema,model} from "mongoose";


const user_schema =new  Schema({
    wallet_address : {type : String , required : true, unique : true},
    nonce : {type : String},
    nonce_updated_at : {type : Date},
},{
    timestamps : true
})


const Users = model("user",user_schema);

export default Users;