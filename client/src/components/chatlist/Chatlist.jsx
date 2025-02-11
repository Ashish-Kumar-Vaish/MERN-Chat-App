import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass, faXmark } from "@fortawesome/free-solid-svg-icons";
import "./Chatlist.css";
import { useNavigate, useLocation } from "react-router";
import { useEffect, useState } from "react";
import { socket } from "../../socketIO/socket.js";
import { useSelector, useDispatch } from "react-redux";
import { setCurrentRoom } from "../../redux/roomSlice.js";
import { setRoomsJoined } from "../../redux/userSlice.js";

const Chatlist = () => {
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
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/user/roomsJoined`,
        {
          method: "GET",
          headers: { username: user.username },
        }
      );

      const result = await response.json();

      if (response.status === 200 && result.success) {
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
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/rooms/roomDetails`,
        {
          method: "GET",
          headers: { roomid: data },
        }
      );

      const result = await response.json();

      if (response.status === 200 && result.success) {
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
    <div className="chatlist">
      <div className="inputBar">
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {!search.trim().length ? (
          <button className="searchBtn">
            <FontAwesomeIcon icon={faMagnifyingGlass} />
          </button>
        ) : (
          <button className="clearBtn" onClick={() => setSearch("")}>
            <FontAwesomeIcon icon={faXmark} />
          </button>
        )}
      </div>
      {!roomsDisplay.length ? (
        <div className="noRooms">No rooms found</div>
      ) : (
        roomsDisplay.flat().map((info) => {
          return (
            <div key={info.roomId} className="roomBtnWrapper">
              <button
                className="roomBtn"
                onClick={() => handleRoomConnection(info)}
              >
                <img src={info.roomPfp} className="roomProfilePicture"></img>
                <span>{info.roomName}</span>
              </button>
            </div>
          );
        })
      )}
    </div>
  );
};

export default Chatlist;
