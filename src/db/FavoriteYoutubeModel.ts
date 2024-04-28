import {model, Schema} from "mongoose";

export interface IFavoriteYoutubeVideoSchema {
  title: string;
  description: string;
  thumbnailUrl?: string;
  watched: boolean;
  youtuberName: string;
}

const FavoriteYoutubeVideoSchema = new Schema<IFavoriteYoutubeVideoSchema>({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  thumbnailUrl: {
    type: String,
    required: false,
    default: ''
  },
  watched: {
    type: Boolean,
    required: true,
    default: false
  },
  youtuberName: {
    type: String,
    required: true,
  },
});

const FavoriteYoutubeVideoModel = model('FavoriteYoutubeVideoModel', FavoriteYoutubeVideoSchema);

export default FavoriteYoutubeVideoModel;