import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  currentRoomId: "",
  currentRoomName: "",
  currentRoomPfp: "",
};

export const roomSlice = createSlice({
  name: "currentRoom",
  initialState,
  reducers: {
    setCurrentRoom: (state, action) => {
      state.currentRoomId = action.payload.currentRoomId;
      state.currentRoomName = action.payload.currentRoomName;
      state.currentRoomPfp = action.payload.currentRoomPfp;
    },
    clearCurrentRoom: (state) => {
      state.currentRoomId = "";
      state.currentRoomName = "";
      state.currentRoomPfp = "";
    },
  },
});

export const { setCurrentRoom, clearCurrentRoom } = roomSlice.actions;

export default roomSlice.reducer;
