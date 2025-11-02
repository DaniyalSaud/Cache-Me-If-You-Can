import { asyncHandler } from "../utils/asyncHandler.js";
import { APIError } from "../utils/Apierror.js";
import { User } from "../models/user.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

const registerUser = asyncHandler(async (req, res) => {
  // get user details
  const { phoneno, username, password, confirmPassword, role, region } = req.body;

  if ([username, phoneno, password, confirmPassword, region, role].some((field) => !field || field.trim() === "")) {
    throw new APIError(400, "Phone no, username, region, role, password and confirm password are required");
  }

  if (password !== confirmPassword) {
    throw new APIError(400, "Password and confirm password do not match");
  }

  if (role && role.trim() === "") {
    throw new APIError(400, "Role cannot be empty if provided");
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { phoneno }],
  });


  if (existedUser) {
    throw new APIError(409, "Phoneno or username already exists");
  }

  // create user object and create mongo entry

  const user = await User.create({
    phoneno,
    password,
    username,
    role,
    region,
  });

  // remove password and refresh token field from response

  // we dont want to give response of password and refresh token to frontend so
  // we use select method to filter out those items when validating if user is created
  // or not in DB by user id

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  // check if the user is created or not

  if (!createdUser) {
    throw new APIError(500, "Something Went wrong in user registration");
  }

  // return response else return error

  return res
    .status(201)
    .json(new ApiResponse(201, "User registered Successfully", createdUser));
});

const generateAccessandRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (err) {
    throw new APIError(
      500,
      "Something went wrong with access or refresh token"
    );
  }
};

// TESTED WORKING
const loginUser = asyncHandler(async (req, res) => {
  // req body -> data

  const { phoneno, username, password } = req.body;

  // validate username, phoneno

  if (!(username || phoneno)) {
    throw new APIError(400, "Username or phone number is required");
  }

  // find if user exist or not

  const user = await User.findOne({
    $or: [{ username }, { phoneno }],
  });

  if (!user) {
    throw new APIError(404, "User doesn't exist, Register yourself first");
  }
  
  // if user exists check pass

  const isPasswordvalid = await user.isPasswordcorrect(password);

  if (!isPasswordvalid) {
    throw new APIError(401, "Incorrect Password");
  }

  // if password is correct generate access and refresh token

  const { accessToken, refreshToken } = await generateAccessandRefreshTokens(
    user._id
  );
  // send cookies

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  const options = {
    // to make it only server configureable
    // cuz by default anyone can modify it from frontend
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        "User Logged in Successfully",
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        }
      )
    );
});

// TESTED WORKING
const logoutUser = asyncHandler(async (req, res) => {
  //find user

  await User.findByIdAndUpdate(
    // fixed logout logic
    req.user._id, // assumes you added user id in auth middleware
    {
      $set: { refreshToken: null },
    },
    {
      new: true,
    }
  );

  const options = {
    // to make it only server configureable
    // cuz by default anyone can modify it from frontend
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, "User Logged Out Successfully", {}));
});

// UNFINISHED || causing issues
const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new APIError(401, "Unauthorized Request Access");
  }

  try {
    // here refresh token's secret key is accessed
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new APIError(401, "Invalid Refresh Token");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new APIError(401, "Refresh Token is expired");
    }
    const options = {
      // to make it only server configureable
      // cuz by default anyone can modify it from frontend
      httpOnly: true,
      secure: true,
    };
    const { accessToken, newrefreshToken } =
      await generateAccessandRefreshTokens(user._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newrefreshToken, options)
      .json(
        new ApiResponse(
          200,
          "Access token Refreshed",
          { refreshToken: newrefreshToken }
        )
      );
  } catch (err) {
    throw new APIError(401, err?.message, "Refresh token Verification Failed");
  }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const user = await User.findById(req.user?._id);

  const isPasswordCorrect = await user.isPasswordcorrect(oldPassword);

  if (!isPasswordCorrect) {
    throw new APIError(400, "Old Password Invalid");
  }

  user.password = newPassword;

  await user.save({ validateBeforeSave: false });

  return res.status(200).json(new ApiResponse(200, "Password Changed", {}));
});

//---------dead
const getCurrentUser = asyncHandler(async (req, res) => {
  
  return res
    .status(200)
    .json(
      new ApiResponse(200, "Current User Fetched Successfully", req.user)
    );
});

// TESTED WORKING
const updateAccountDetails = asyncHandler(async (req, res) => {
  const { username, phoneno, currentPassword } = req.body;
  const { region, phonenotochange } = req.body;

  if (!(username || phoneno)) {
    throw new APIError(400, "All fields are required");
  }

  // Verify current password before updating
  if (currentPassword) {
    const user = await User.findById(req.user?._id);
    const isPasswordCorrect = await user.isPasswordcorrect(currentPassword);
    
    if (!isPasswordCorrect) {
      throw new APIError(400, "Current password is incorrect");
    }
  }

  const checkUser = await User.findOne({
    $or: [{ username }, { phoneno: phonenotochange }],
    _id: { $ne: req.user?._id },
  });

  if (checkUser) {
    throw new APIError(409, "Phoneno or username already exists");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        username: username,
        phoneno: phonenotochange,
        region: region,
      },
    },
    { new: true }
  ).select("-password");
  return res
    .status(200)
    .json(new ApiResponse(200, "User Information Updated Successfully", user));
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  generateAccessandRefreshTokens,
};
