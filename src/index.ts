import { Hono } from 'hono'
import {validator} from 'hono/validator';
import dbConnect from './db/connect.ts'
import FavoriteYoutubeVideoModel, { IFavoriteYoutubeVideoSchema } from './db/FavoriteYoutubeModel.ts';

const app = new Hono()

try {
  await dbConnect();
  console.info('Database has been connected');

  app.get('/videos', async (c) => {
    try {
      const videos = await FavoriteYoutubeVideoModel.find().lean();
      if(videos.length > 0) {
        return c.json({
          statusCode: 200,
          videos
        }, 200);
      }
      return c.json({
        statusCode: 404,
        videos: [],
        message: 'Videos are empty'
      }, 404);
    } catch (err) {
      return c.json({
        statusCode: 500,
        message: (err as Error).message || 'Internal Server Error'
      }, 500);
    }
  });

  app.get('/video/:id', async (c) => {
    // To read req.params.id
    const id = c.req.param("id");
    try {
      const video = await FavoriteYoutubeVideoModel.findOne({
        _id: id
      }).lean();
      if(video) {
        return c.json({
          statusCode: 200,
          video
        }, 200);
      }
      return c.json({
        statusCode: 404,
        message: 'Video are empty'
      }, 404);
    } catch (err) {
      return c.json({
        statusCode: 500,
        message: (err as Error).message || 'Internal Server Error'
      }, 500);
    }
  });

  app.post(
  '/video',
  // To add native hono validator
  validator('json', ((value: IFavoriteYoutubeVideoSchema, c) => {
    if(!value.title || !value.description || typeof value.watched !== 'boolean' || !value.youtuberName) {
      return c.json({
        statusCode: 400,
        message: 'Some fields are missing, please check your respone body'
      }, 400);
    }

    return value;
  })), 
  async (c) => {
    // To read data from hono validation, we can't use c.req.json() when working with validator
    const body: IFavoriteYoutubeVideoSchema = await c.req.valid('json');
    try {
      const result = await FavoriteYoutubeVideoModel.create(body);
      return c.json({
        statusCode: 201,
        data: result
      }, 201);
    } catch (err) {
      return c.json({
        statusCode: 500,
        message: (err as Error).message || 'Internal Server Error'
      }, 500);
    }
  });

  app.put(
    '/video/:id',
    async (c) => {
      // To req data req.body as json
      const body: IFavoriteYoutubeVideoSchema = await c.req.json();
      // To read req.params.id
      const {id} = c.req.param();

      try {
        const video = await FavoriteYoutubeVideoModel.findById(id).lean();
        if(!video) {
          return c.json({
            statusCode: 404,
            message: 'Video not found'
          }, 404);
        }
        try {
          const video = await FavoriteYoutubeVideoModel.updateOne({
            _id: id
          }, {
            $set: {
              ...body
            }
          });
          
          return c.json({
            statusCode: 200,
            data: video
          }, 200);
        } catch (err) {
          return c.json({
            statusCode: 500,
            message: (err as Error).message || 'Internal Server Error'
          }, 500);
        }
      } catch (err) {
        return c.json({
          statusCode: 500,
          message: (err as Error).message || 'Internal Server Error'
        }, 500);
      }
    }
  )

  app.delete('/video/:id', async (c) => {
    const id = c.req.param("id");

    try {
      const video = await FavoriteYoutubeVideoModel.findById(id).lean();
      if(!video) {
        return c.json({
          statusCode: 404,
          message: 'Video not found'
        }, 404);
      }
      try {
        await FavoriteYoutubeVideoModel.deleteOne({
          _id: id
        })
        
        return c.json({
          statusCode: 200,
          message: 'Video deleted'
        }, 200);
      } catch (err) {
        return c.json({
          statusCode: 500,
          message: (err as Error).message || 'Internal Server Error'
        }, 500);
      }
    } catch (err) {
      return c.json({
        statusCode: 500,
        message: (err as Error).message || 'Internal Server Error'
      }, 500);
    }
  });

  app.delete('/videos', async (c) => {
    try {
      const video = await FavoriteYoutubeVideoModel.find().lean();
      if(video.length === 0) {
        return c.json({
          statusCode: 404,
          message: 'Video not found'
        }, 404);
      }
      try {
        const video = await FavoriteYoutubeVideoModel.deleteMany()
        
        return c.json({
          statusCode: 200,
          message: 'Videos deleted'
        }, 200);
      } catch (err) {
        return c.json({
          statusCode: 500,
          message: (err as Error).message || 'Internal Server Error'
        }, 500);
      }
    } catch (err) {
      return c.json({
        statusCode: 500,
        message: (err as Error).message || 'Internal Server Error'
      }, 500);
    }
  });
} catch (err) {
  console.error(err);
}

// To add custom port, if we want to use default port of Hono, port 3000, we can just export default app
export default {
  port: 5432,
  fetch: app.fetch
}

// using default port Hono, port 300
// export default app;