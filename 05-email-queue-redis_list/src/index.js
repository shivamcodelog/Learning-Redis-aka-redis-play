import express, { json } from "express";
import Redis from "ioredis"

const port = process.env.PORT || 3000;

const app = express();
app.use(express.json());

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

const QUEUE_KEY = "queue:email";

app.post("/emails", async(req,res)=>{
    const job = {
        to:req.body.to,
        subject:req.body.subject || 'No Subject',
        body:req.body.body || 'No Body',
        createdAt:new Date().toISOString()
    }

    await redis.lpush(QUEUE_KEY , JSON.stringify(job))
    res.json({queued:true , job})
})


app.get("/emails/1",async(req,res)=>{
    const raw = await redis.rpop(QUEUE_KEY)
    if(!raw){
        return  res.json({message:"No Jobs in Queue"})
    }

    const job = JSON.parse(raw);
    res.json({message:"Email sent!",job})
})

app.listen(port,()=>{
    console.log("server runing on PORT:",port)
})