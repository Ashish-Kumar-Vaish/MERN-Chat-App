import { configureStore } from "@reduxjs/toolkit";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import storage from "redux-persist/lib/storage";
import userReducer from "./userSlice";
import currentRoomReducer from "./roomSlice";

const userPersistConfig = {
  key: "user",
  version: 1,
  storage,
};

const roomPersistConfig = {
  key: "currentRoom",
  version: 1,
  storage,
};

const persistedUserReducer = persistReducer(userPersistConfig, userReducer);
const persistedRoomReducer = persistReducer(
  roomPersistConfig,
  currentRoomReducer
);

export const store = configureStore({
  reducer: { user: persistedUserReducer, currentRoom: persistedRoomReducer },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);
