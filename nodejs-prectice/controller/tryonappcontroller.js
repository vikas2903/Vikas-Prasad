import express from "express";
export async function tryonappcontroller(req, res) {
    try {
        const {proudct_image, user_image} = req.body;
        res.status(200).json({
            message: "Tryon App Server is running",
            status: 200,
            data: {
                proudct_image,
                user_image
            }
        })

    } catch (err) {
        res.status(500).json({
            message: "Internal Server Error",
            status: 500
        })  

    }
}