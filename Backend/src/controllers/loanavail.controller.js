import { asyncHandler } from "../utils/asyncHandler.js";
import { APIError } from "../utils/Apierror.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.models.js";

import { Loan} from "../models/loan.models.js";

const availLoan = asyncHandler(async(req,res)=>{
    const sellerid = req.user._id
    const {amount, reason, timetoavail} = req.body

    if(!sellerid){
        throw new APIError(400,"No seller Id foun")
    }

    const checkseller = await User.findById(sellerid)
    if(!(checkseller)||checkseller.role!=="seller"){
        throw new APIError(400,"Only Seller can access this")
    }

    if ([amount, reason, timetoavail ].some((field) => !field || field.trim() === "")) {
    throw new APIError(400, "amount, reason and the time to avail the loan is required");
    }

    const loancreation = await Loan.Create({
        amount,
        reason,
        timetoavail,
        sellerid,
    })
    if(!loancreation){
        throw new APIError(400,"Loan Cant be created Try again Later")
    }
    res.status(200).json(new ApiResponse(200,"Loan Application Created Successfully"),loancreation)
});

export { availLoan };