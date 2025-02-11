import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  name: "",
  username: "",
  pfp: "",
  roomsJoined: [{}],
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.name = action.payload.name;
      state.username = action.payload.username;
      state.pfp = action.payload.pfp;
    },
    setRoomsJoined: (state, action) => {
      state.roomsJoined = action.payload;
    },
    clearUser: (state) => {
      state.name = "";
      state.username = "";
      state.pfp = "";
      state.roomsJoined = [{}];
    },
  },
});

export const { setUser, setRoomsJoined, clearUser } = userSlice.actions;

export default userSlice.reducer;
