import express from "express"
import Redis from "ioredis"

const app = express();
app.use(express.json())

const port = process.env.PORT || 3000;


const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379")

const BANNER_KEY = "app:banner" ;

app.post("/banner" , async(req,res)=>{

    await redis.set(BANNER_KEY,req.body.message || "Welcome to redis play");

    res.json({success:true})
})

app.get("/banner", async(req,res)=>{
    const message = await redis.get(BANNER_KEY)
    res.json({message})
})

app.delete("/banner" , async(req,res)=>{
    await redis.del(BANNER_KEY);
    res.json({success:true})
})

app.get("/banner/exists" , async(req,res)=>{
    const result = await redis.exists(BANNER_KEY)
    res.json({exist:Boolean(result)})
})

app.listen(port ,()=>{
    console.log(`Server Running at PORT:${port}`)
})
