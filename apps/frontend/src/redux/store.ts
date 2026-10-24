import { configureStore } from "@reduxjs/toolkit";
import { dotshortApi } from "./api";

const store = configureStore({
  reducer: {
    [dotshortApi.reducerPath]: dotshortApi.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(dotshortApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
