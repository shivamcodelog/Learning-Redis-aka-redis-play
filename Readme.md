# Redis Play Leaderboard

This repository contains a set of Redis mini-projects, with the main documented example being the leaderboard app in [leader_board/src/leaderboard.js](leader_board/src/leaderboard.js). The leaderboard demonstrates how to combine multiple Redis data structures and commands to build a scoring system with user profile storage, score updates, and ranking routes.

## What This Project Shows

- Storing user profile data in Redis hashes
- Storing and updating scores in a Redis sorted set
- Exposing multiple REST routes for creating users, reading profiles, updating scores, and reading ranks
- Returning structured JSON responses that are easy for a frontend or API client to consume

## Stack

- Node.js
- Express
- Redis
- ioredis

## Project Entry Point

The leaderboard server starts from [leader_board/src/leaderboard.js](leader_board/src/leaderboard.js).

## Run Requirements

- A running Redis server
- Node.js installed locally
- Optional: `REDIS_URL` environment variable

If `REDIS_URL` is not provided, the app connects to `redis://localhost:6379`.

## Install And Run

From the leaderboard folder:

```bash
cd leader_board
npm install
npm run dev
```

If you want to use Bun instead of npm, the project also has a `bun.lock` file, so you can install and run it with Bun in a Bun-enabled environment.

## Environment Variables

- `PORT` - server port, defaults to `3000`
- `REDIS_URL` - Redis connection string, defaults to `redis://localhost:6379`

## Data Model

The app uses two Redis structures:

### User Profile Hash

Key pattern:

- `user:<id>`

Stored fields:

- `id`
- `name`
- `email`
- `created`

### Score Sorted Set

Key:

- `score`

Member pattern:

- `user:<id>`

Score value:

- numeric user score used for ranking

## Redis Commands Used

The leaderboard route set uses these Redis commands:

- `HSET` to create user profile hashes
- `HGETALL` to read user profile hashes
- `EXISTS` to verify that a user exists before updating or reading rank
- `ZSCORE` to read the current score
- `ZINCRBY` to increase the score
- `ZREVRANGE` with `WITHSCORES` to build the leaderboard order
- `ZREVRANK` to read a user’s position in the sorted set

## API Routes

### Create User

`POST /user/:id`

Creates a user profile hash in Redis.

Request body:

```json
{
	"name": "Aman",
	"email": "aman@example.com"
}
```

If `name` or `email` is missing, the server falls back to:

- `Ghost User`
- `Ghost email`

Response:

```json
{
	"message": "User created <101>"
}
```

### Get User Profile

`GET /user/:id`

Reads the profile hash for a user.

Response:

```json
{
	"user": {
		"id": "101",
		"name": "Aman",
		"email": "aman@example.com",
		"created": "2026-08-10T10:12:45.000Z"
	}
}
```

If the key does not exist, Redis returns an empty object shape through the API response.

### Increase User Score

`POST /leaderboard/score/:id`

Increases a user’s score in the leaderboard sorted set.

Request body:

```json
{
	"point": 15
}
```

If `point` is not provided, the app uses `10`.

Response:

```json
{
	"prescore": 20,
	"newscore": 35,
	"increasedby": 15
}
```

If the user hash does not exist, the API returns:

```json
{
	"message": "User with ID:101 DO NOT exists"
}
```

### Get Full Leaderboard

`GET /leaderboard`

Returns all users sorted from highest score to lowest score.

Response:

```json
{
	"rank": [
		{
			"rank": 1,
			"userID": "user:101",
			"score": 85
		},
		{
			"rank": 2,
			"userID": "user:205",
			"score": 60
		}
	]
}
```

### Get User Rank

`GET /leaderboard/:id/rank`

Returns the current rank, score, and profile info for one user.

Response:

```json
{
	"userID": 101,
	"rank": 1,
	"score": "85",
	"userINFO": {
		"id": "101",
		"name": "Aman",
		"email": "aman@example.com",
		"created": "2026-08-10T10:12:45.000Z"
	}
}
```

If the user does not exist, the API returns:

```json
{
	"message": "User with ID:101 DO NOT exists"
}
```

## Response Structure Summary

The API keeps responses simple and predictable:

- Success responses use object-based JSON
- Leaderboard list responses are wrapped in a `rank` array
- Rank detail responses include `userID`, `rank`, `score`, and `userINFO`
- Missing-user responses use a single `message` field

## Example Flow

1. Create a user with `POST /user/101`
2. Update their score using `POST /leaderboard/score/101`
3. Fetch the complete ranking with `GET /leaderboard`
4. Fetch the individual rank and profile with `GET /leaderboard/101/rank`

## Repository Layout

- [leader_board/src/leaderboard.js](leader_board/src/leaderboard.js) - leaderboard API server
- [leader_board/package.json](leader_board/package.json) - scripts and dependencies
- [01_setup-local-redis](01_setup-local-redis) - Redis setup example
- [02_site-banner-redis](02_site-banner-redis) - site banner example
- [03_login-otp-ttl](03_login-otp-ttl) - OTP TTL example
- [04-user-profile-json-hash](04-user-profile-json-hash) - JSON vs hash example
- [05-email-queue-redis_list](05-email-queue-redis_list) - list-based queue example
- [06-order-confirmation_bullmq](06-order-confirmation_bullmq) - BullMQ order workflow
- [07-live-admin-nortification-pubsub](07-live-admin-nortification-pubsub) - pub/sub notification example

## Notes

- The leaderboard stores user identity and score separately so profile reads and score updates stay efficient.
- The sorted set is what powers ranking, while the hash keeps user metadata.
- The API currently returns the score as a string in the rank-detail route because it comes directly from Redis `ZSCORE`.
