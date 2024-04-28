import { Hono } from "hono";
import {streamText} from "hono/streaming";
import { v4 as uuidv4 } from "uuid";

let videos = [];

const app = new Hono();

app.get("/", (c) => {
  // To render HTML
  return c.html("<h1>Welcome to Hono Crash Course</h1>");
});

app.post("/video", async (c) => {
  // To read request body
  const {videoName, channelName, duration} = await c.req.json();
  const newVideo = {
    id: uuidv4(),
    videoName,
    channelName,
    duration
  };

  videos.push(newVideo);
  // To write response as json
  return c.json(
    newVideo, // Response body
    201 // Response status
  );
});

// Read All (using stream)
app.get("/videos", (c) => {
  // To use stream
  return streamText(c, async (stream) => {
    for(const video of videos) {
      // return data to stream
      await stream.writeln(JSON.stringify(video));
      await stream.sleep(1000); // to wait 1000ms when each data is showing (current not work on Postman, you can test using web browser)
    }
  });
});

// Read By ID
app.get("/video/:id", (c) => {
  // To read params req.params.id
  const id = c.req.param('id');

  const video = videos.find(video => video.id === id);

  if(!video) {
    return c.json({
      message: 'Video not found'
    }, 404);
  }
  return c.json(video, 200);
});

// Update
app.put("/video/:id", async (c) => {
  const {id} = c.req.param();
  const index = videos.findIndex(video => video.id === id);
  if(index === -1) {
    return c.json({
      message: 'Video not found'
    }, 404);
  }

  const {videoName, channelName, duration} = await c.req.json();
  videos[index] = {
    ...videos[index],
    videoName,
    channelName,
    duration
  };
  return c.json(videos[index], 200);
});

// Delete by ID
app.delete("/video/:id", (c) => {
  const id = c.req.param("id");
  videos = videos.filter(video => video.id !== id);
  return c.json({
    messaage: "Vidoe deleted"
  }, 200);
});

// Delete all videos
app.delete("/videos", (c) => {
  videos = [];
  return c.json({
    message: "All vidoes deleted"
  })
});

// app.fire();

export default app;