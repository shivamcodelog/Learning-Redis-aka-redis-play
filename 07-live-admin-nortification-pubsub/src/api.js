import express from "express"
import Redis from "ioredis"

const port = process.env.PORT || 3000 ;

const app = express()
app.use(express.json());

app.post("/notification", async(req,res)=>{
    const payload = {
        tttle:req.body.tttle || "Default Title",
        createdAt: new Date().toISOString(),
    };

    const receivers = await publisher.publish(
        "notification",
        JSON.stringify(payload)
    )

    res.json({message:`Notification sent to ${receivers} subscribers `})
})


app.listen(port,()=>{
  console.log("Server running on PORT:",port)
})