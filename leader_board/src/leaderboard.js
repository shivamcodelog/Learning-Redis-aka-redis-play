import express from 'express';
import Redis from "ioredis"

const port = process.env.PORT || 3000;

const app = express();
app.use(express.json());

const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");


app.post("/user/:id", async (req, res) => {

    const user = {
        id: req.params.id,
        name: req.body.name || "Ghost User",
        email: req.body.email || "Ghost email",
        created: new Date().toISOString()
    }

    await redis.hset(`user:${req.params.id}`, user)
    res.json({ message: `User created <${req.params.id}>` })

})

app.get("/user/:id", async (req, res) => {
    const user = await redis.hgetall(`user:${req.params.id}`)
    res.json({ user: user ? user : null })
})


app.post("/leaderboard/score/:id", async (req, res) => {

    const user = await redis.exists(`user:${req.params.id}`)
    if (user === 0) {
        res.json({ message: `User with ID:${req.params.id} DO NOT exists` })
        return
    }

    const point = req.body.point ?? 10

    const score = await redis.zscore("score",`user:${req.params.id}`)

    await redis.zincrby("score", point, `user:${req.params.id}`)

    res.json({prescore:Number(score),
              newscore:Number(score)+Number(point),
              increasedby:point
    })

})


app.get("/leaderboard", async (req, res) => {

    const score = await redis.zrevrange("score", 0, -1, 'WITHSCORES')
    const data = [];
        for (let i = 0; i < score.length; i += 2) {

            data.push({
                rank:i/2 + 1 ,
                userID:score[i],
                score:Number(score[i+1])
            })

        }

    res.json({rank:data})
})


app.get("/leaderboard/:id/rank" , async(req,res)=>{

    const user = await redis.exists(`user:${req.params.id}`)
    if (user === 0) {
        res.json({ message: `User with ID:${req.params.id} DO NOT exists` })
        return
    }


    const id= req.params.id

    const rank = await redis.zrevrank("score",`user:${id}`)
    const score = await redis.zscore("score",`user:${id}`)


    const info = await redis.hgetall(`user:${req.params.id}`)

    res.json({userID:Number(id),
              rank:rank+1,
              score:score,
              userINFO:info
            })

})

app.listen(port, () => {
    console.log("Server running at PORT:", port)
})

