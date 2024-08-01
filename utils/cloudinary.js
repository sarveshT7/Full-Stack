import { v2 as cloudinary } from "cloudinary"
import fs from "fs"

// Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View Credentials' below to copy your API secret
});

const cloudinaryUploader = async (localfilepath) => {
    try {
        if (!localfilepath) return null
        // uploading file on cloudinary
        const response = await cloudinary.uploader.upload(localfilepath, { resource_type: "auto" })

        //file has been uploaded successfully
        console.log("response of upload", response)
        return response
    } catch (error) {
        fs.unlinkSync(localfilepath) // remove the locally saved temporary file as the operation got failed
        return null
    }

}
export { cloudinaryUploader }

