import asyncHandler from "../../utils/asyncHandler.js";
import ApiError from '../../utils/apiError.js'
import { User } from '../models/user.model.js'
import { cloudinaryUploader } from '../../utils/cloudinary.js'
import { ApiResponse } from '../../utils/apiResponse.js'

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

   const { fullname, username, email, password } = req.body
   console.log(username, "username")
   if ([fullname, username, email, password].some(field => field?.trim() == "")) {
      throw new ApiError(400, "All the fields are required")
   }
   const existedUser = User.findOne({
      $or: [{ username }, { email }]
   })
   if (existedUser) {
      throw new ApiError(409, "User with username or email exists")
   }

   const avatarLocalPath = req.files?.avatar[0]?.path
   const coverImageLocalPath = req.files?.coverImage[0]?.path

   if (!avatarLocalPath) {
      throw new ApiError(400, "Avatar is required")
   }
   const avatar = await cloudinaryUploader(avatarLocalPath)
   const coverImage = await cloudinaryUploader(coverImageLocalPath)

   if (!avatar) {
      throw new ApiError(400, "Avatar file is required")
   }
   const user = await User.create({
      fullname,
      avatar: avatar.url,
      coverImage: coverImage?.url || "",
      email,
      password,
      username: username.toLowerCase()
   })
   const createduser = User.findById(user._id).select(
      "-password -refreshToken"
   )
   if (!createduser) {
      throw new ApiError(500, "Something went wrong while registering the user")
   }

   return res.status(201).json(
      new ApiResponse(200, createduser, "User is registered successfully")
   )



})
export { registerUser }