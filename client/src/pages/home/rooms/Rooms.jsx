import React, { useEffect, useState } from "react";
import "./Rooms.css";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMagnifyingGlass,
  faChevronLeft,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { useForm } from "react-hook-form";
import { getFeaturedRooms, searchRooms } from "../../../api/roomApi";

const Rooms = () => {
  const [featuredRooms, setFeaturedRooms] = useState([]);
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { isSubmitting },
  } = useForm();
  const [home, setHome] = useState(true);

  // useEffect to fetch and set rooms featured
  useEffect(() => {
    if (!featuredRooms.length && home) {
      fetchFeaturedRooms();
    }
  }, [featuredRooms]);

  // fetch featured rooms function
  const fetchFeaturedRooms = async () => {
    try {
      const result = await getFeaturedRooms();

      if (result.success) {
        const uniqueRooms = Array.from(
          new Map(
            result.featuredRooms.map((room) => [
              room.roomId,
              {
                roomId: room.roomId,
                roomName: room.roomName,
                roomPfp: room.roomPfp,
              },
            ])
          ).values()
        );
        setFeaturedRooms(uniqueRooms);
        setHome(true);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // search room function
  const onSubmit = async (data, e) => {
    if (!data.search.trim().length) {
      setValue("search", "");
      return;
    }

    try {
      const result = await searchRooms(data.search);

      if (result.success) {
        const uniqueRooms = Array.from(
          new Map(
            result.searchedRooms.map((room) => [
              room.roomId,
              {
                roomId: room.roomId,
                roomName: room.roomName,
                roomPfp: room.roomPfp,
              },
            ])
          ).values()
        );
        setFeaturedRooms(uniqueRooms);
        setHome(false);
      } else {
        setFeaturedRooms([]);
        setHome(false);
        console.log(result.error);
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="roomWrapper">
      <div className="send">
        <button
          className="btn"
          onClick={() => {
            if (home) {
              navigate(-1);
            } else {
              setValue("search", "");
              fetchFeaturedRooms();
            }
          }}
        >
          <FontAwesomeIcon icon={faChevronLeft} />
        </button>
        <form
          className="myForm"
          autoComplete="off"
          onSubmit={handleSubmit(onSubmit)}
        >
          <input
            type="text"
            spellCheck="false"
            placeholder="Search Rooms..."
            {...register("search")}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSubmit(onSubmit)();
              }
            }}
          />

          {watch("search") && (
            <button
              className="btn"
              onClick={() => {
                setValue("search", "");
              }}
            >
              <FontAwesomeIcon icon={faXmark} />
            </button>
          )}

          <button
            className="btn"
            type="submit"
            {...register("myForm")}
            disabled={isSubmitting}
          >
            <FontAwesomeIcon icon={faMagnifyingGlass} />
          </button>
        </form>
      </div>
      
      <div className="container">
        <div className="gridContainer">
          {!featuredRooms.length ? (
            <div className="noFeaturedRooms">
              <span>No rooms to display</span>
            </div>
          ) : (
            featuredRooms.flat().map((info) => {
              return (
                <div
                  key={info.roomId}
                  className="featuredRoomBtnWrapper"
                  style={{ backgroundImage: `url(${info.roomPfp})` }}
                >
                  <button
                    className="featuredRoomBtn"
                    onClick={() => navigate("/about/" + info.roomId)}
                  >
                    <img
                      src={info.roomPfp}
                      className="roomProfilePicture"
                    ></img>
                    <span>{info.roomName}</span>
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default Rooms;
