import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass, faXmark } from "@fortawesome/free-solid-svg-icons";
import { useNavigate, useLocation } from "react-router";
import { useEffect, useState } from "react";
import { socket } from "../socketIO/socket.js";
import { useSelector, useDispatch } from "react-redux";
import { setCurrentRoom } from "../redux/roomSlice.js";
import { setRoomsJoined } from "../redux/userSlice.js";
import { getRoomsJoined } from "../api/userApi.js";
import { getRoomDetails } from "../api/roomApi.js";

const RoomList = () => {
  const [allRoomIds, setAllRoomIds] = useState([]);
  const [allRooms, setAllRooms] = useState([]);
  const [readyToFetch, setReadyToFetch] = useState(false);
  const user = useSelector((state) => state.user);
  const currentRoom = useSelector((state) => state.currentRoom);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [search, setSearch] = useState("");
  const [roomsDisplay, setRoomsDisplay] = useState([]);

  // useEffect to fetch and set rooms joined
  useEffect(() => {
    if (!currentRoom.currentRoomId.length || !allRoomIds.length) {
      setAllRoomIds([]);
      setAllRooms([]);
      setRoomsDisplay([]);
      fetchRoomsJoined();
    } else {
      const found = allRoomIds.find(
        (item) => item.roomId === currentRoom.currentRoomId
      );
      if (!found) {
        setAllRoomIds([]);
        setAllRooms([]);
        setRoomsDisplay([]);
        fetchRoomsJoined();
      }
    }
  }, [user.username, currentRoom.currentRoomId]);

  // useEffect to fetch and set room details
  useEffect(() => {
    if (!allRooms.length && readyToFetch) {
      allRoomIds.forEach((room) => {
        fetchRoomDetails(room.roomId);
      });
    }
  }, [allRoomIds]);

  // fetch rooms joined function
  const fetchRoomsJoined = async () => {
    try {
      const result = await getRoomsJoined(user.username);

      if (result.success) {
        const uniqueRoomIds = Array.from(
          new Map(
            result.roomsJoined.map((room) => [
              room.roomId,
              { roomId: room.roomId },
            ])
          ).values()
        );
        setAllRoomIds(uniqueRoomIds);
        dispatch(setRoomsJoined(uniqueRoomIds));
        setReadyToFetch(true);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // fetch room details function
  const fetchRoomDetails = async (data) => {
    try {
      const result = await getRoomDetails(data);

      if (result.success) {
        setAllRooms((prev) => {
          const updatedRooms = new Map(prev.map((room) => [room.roomId, room]));
          updatedRooms.set(result.roomDetails.roomId, {
            roomId: result.roomDetails.roomId,
            roomName: result.roomDetails.roomName,
            roomPfp: result.roomDetails.roomPfp,
          });
          return Array.from(updatedRooms.values());
        });
        setRoomsDisplay((prev) => {
          const updatedRooms = new Map(prev.map((room) => [room.roomId, room]));
          updatedRooms.set(result.roomDetails.roomId, {
            roomId: result.roomDetails.roomId,
            roomName: result.roomDetails.roomName,
            roomPfp: result.roomDetails.roomPfp,
          });
          return Array.from(updatedRooms.values());
        });
        setReadyToFetch(false);
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  // room connection
  const handleRoomConnection = (data) => {
    if (
      data.roomId === currentRoom.currentRoomId &&
      location.pathname === "/chat"
    ) {
      return;
    }

    dispatch(
      setCurrentRoom({
        currentRoomId: data.roomId,
        currentRoomName: data.roomName,
        currentRoomPfp: data.roomPfp,
      })
    );
    socket.emit("userJoined", {
      roomId: data.roomId,
      username: user.username,
    });

    navigate("/chat/" + data.roomId, { replace: true });
  };

  // search rooms in list
  useEffect(() => {
    if (!search.trim().length) {
      setRoomsDisplay(allRooms);
    } else {
      setRoomsDisplay(
        allRooms.filter((room) =>
          room.roomName.toLowerCase().includes(search.trim().toLowerCase())
        )
      );
    }
  }, [search]);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-center bg-[var(--input-field-bg)]">
        <input
          className="border-none outline-none text-[var(--input-text)] w-full py-4 ml-4"
          type="text"
          placeholder="Search Rooms..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {!search.trim().length ? (
          <button className="text-[var(--search-button-text)] mx-2">
            <FontAwesomeIcon
              className="w-4 md:w-5 lg:w-6 aspect-square"
              icon={faMagnifyingGlass}
            />
          </button>
        ) : (
          <button
            className="cursor-pointer text-[var(--search-button-text)] hover:text-[var(--search-button-hover-text)] mx-2"
            onClick={() => setSearch("")}
          >
            <FontAwesomeIcon
              className="w-4 md:w-5 lg:w-6 aspect-square"
              icon={faXmark}
            />
          </button>
        )}
      </div>

      <div className="overflow-y-scroll scrollbar-none">
        {!roomsDisplay.length ? (
          <div className="text-[var(--nothing-text)] text-center mt-4 md:mt-6 font-semibold">
            No rooms found
          </div>
        ) : (
          roomsDisplay.flat().map((info) => {
            return (
              <div key={info.roomId}>
                <button
                  className="bg-[var(--room-button-bg)] hover:bg-[var(--room-button-hover-bg)] focus:bg-[var(--room-button-hover-bg)] 
                  text-[var(--input-text)] py-2 w-full flex items-center cursor-pointer outline-none"
                  onClick={() => handleRoomConnection(info)}
                >
                  <img
                    src={info.roomPfp}
                    className="h-8 w-8 md:h-10 md:w-10 mx-4 rounded-full object-cover border border-[var(--pfp-border)]"
                  />
                  <span className="block overflow-hidden whitespace-nowrap text-ellipsis">
                    {info.roomName}
                  </span>
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default RoomList;
