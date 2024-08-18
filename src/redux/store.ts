import { configureStore } from "@reduxjs/toolkit";
import librarySlice from './slices/librarySlice';
import seriesSlice from './slices/seriesSlice';
import seasonSlice from './slices/seasonSlice';
import episodeSlice from './slices/episodeSlice';
import seriesImageSlice from "./slices/seriesImageSlice";
import episodeImageSlice from "./slices/episodeImageSlice";
import contextMenuSlice from "./slices/contextMenuSlice";
import imageLoadedSlice from "./slices/imageLoadedSlice";
import transparentImageLoadedSlice from "./slices/transparentImageLoadedSlice"

export const store = configureStore({
  reducer: {
    library: librarySlice,
    series: seriesSlice,
    season: seasonSlice,
    episodes: episodeSlice,
    seriesImage: seriesImageSlice,
    episodeImage: episodeImageSlice,
    contextMenu: contextMenuSlice,
    imageLoaded: imageLoadedSlice,
    transparentImageLoaded: transparentImageLoadedSlice
  }
})

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;