# Pure HTTP - Redis
## Objective
Simple application server that prints a message at a given time in the future.

The solution consists of 
- API containing endpoint `/echoAtTime` - which receives two parameters, time and message, and writes that message to the server console at the given time.
- Service that subsribes to expired events in Redis

Since we want the server to be able to withstand restarts it will use Redis to persist the messages and the time they should be sent at.

In case the server was down when a message should have been printed, it should print it out when going back online.


## Solution

Run 
```
docker-compose up -d
```

API accepts POST requests on http://localhost:3000/echoAtTime
It expects JSON payload with the following structure

```json
{
   "body":"Message text",
   "time": "2020-08-13T00:00:00Z"
}
```
Notice that time needs to be send with timezone. Server timezone is GMT, container's console output contains current server time.


Please use the following request to test endpoint (Check the time of message).
```
curl --header "Content-Type: application/json" --request POST --data '{"body":"Hello here","time":"2020-08-12T09:35:00Z"}'  http://localhost:3000/echoAtTime
```

Basic validation is set:
* no empty message body,
* no message time in the past
* date format is strict
