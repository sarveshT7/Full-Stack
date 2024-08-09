import asyncHandler from "../../utils/asyncHandler.js";
import ApiError from '../../utils/apiError.js'
import { User } from '../models/user.model.js'
import { uploadOnCloudinary } from '../../utils/cloudinary.js'
import { ApiResponse } from '../../utils/apiResponse.js'


const generateAcessAndRefreshTokens = async (userId) => {
   try {
      const user = await User.findById(userId);
      const accessToken = user.generateAccessTokens();
      const refreshToken = user.generateRefreshTokens();
      user.refreshToken = refreshToken
      await user.save({ validateBeforeSave: false })
      
      return { accessToken, refreshToken }

   } catch (error) {
      throw new ApiError(500, "somethging went wrong while generating access and refresh tokens")
   }
}
const registerUser = asyncHandler(async (req, res) => {
   // get user details from user
   // validation not empty
   // check if user already exists : username, email
   // check for images, avatar
   // upload them to cloudinary , avatar
   // create user object - create entry in db
   // remove password and refresh token field from reponse
   // check for the user creation
   // return response

   const { fullName, username, email, password } = req.body
   console.log(username, "username")
   if ([fullName, username, email, password].some(field => field?.trim() == "")) {
      throw new ApiError(400, "All the fields are required")
   }
   const existedUser = await User.findOne({
      $or: [{ username }, { email }]
   })
   if (existedUser) {
      throw new ApiError(409, "User with username or email exists")
   }
   const avatarLocalPath = req.files?.avatar[0]?.path
   let coverImageLocalPath
   if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
      coverImageLocalPath = req.files?.coverImage[0]?.path
   }


   if (!avatarLocalPath) {
      throw new ApiError(400, "Avatar file is required")
   }

   console.log('avatar local path ', avatarLocalPath)
   const avatar = await uploadOnCloudinary(avatarLocalPath)
   const coverImage = await uploadOnCloudinary(coverImageLocalPath)
   console.log('avatar file ', avatar)


   if (!avatar) {
      throw new ApiError(400, "Avatar file is required")
   }
   const user = await User.create({
      fullName,
      avatar: avatar.url,
      coverImage: coverImage?.url || "",
      email,
      password,
      username: username.toLowerCase()
   })
   const createduser = await User.findById(user._id).select(
      "-password -refreshToken"
   )
   if (!createduser) {
      throw new ApiError(500, "Something went wrong while registering the user")
   }

   return res.status(201).json(
      new ApiResponse(200, createduser, "User is registered successfully")
   )



})

const loginUser = asyncHandler(async (req, res) => {
   // get the body from req
   // check if username or email exists
   // find user
   //check for the password
   // access tokrn and refresh token
   // send cookies

   const { userName, email, password } = req.body
   if (!userName || !email) {
      throw new ApiError(400, "Username or Email is required")
   }

   const user = User.findOne({
      $or: [{ userName }, { email }]
   })

   if (!user) {
      throw new ApiError(404, "User does not exist")
   }

   const isPasswordValid = await user.isPasswordCorrect(password)

   if (!isPasswordValid) {
      throw new ApiError(401, "User credentials are incorrect")
   }
   const { accessToken, refreshToken } = await generateAcessAndRefreshTokens(user._id)

   const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

   const options = {
      httpOnly: true,
      secure: true
   }
   return res.status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(new ApiResponse(
         200,
         { user: loggedInUser, accessToken, refreshToken },
         "User logged In Successfully"
      ))
})
const logoutUser = asyncHandler(async (req, res) => {
   await User.findByIdAndUpdate(
      req.user?._id,
      {
         $unset: {
            refreshToken: 1    // removes the field from the document
         }
      },
      {
         new: true
      }
   )
   const options = {
      httpOnly: true,
      secure: true
   }
   return res
      .status(200)
      .clearCookie("accessToken", options)
      .clearCookie("refreshToken", options)
      .json(new ApiResponse(200, {}, "User Logged Out"))
})
export { registerUser, loginUser, logoutUser }