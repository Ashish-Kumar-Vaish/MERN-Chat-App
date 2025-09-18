import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMagnifyingGlass,
  faChevronLeft,
  faXmark,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { useForm } from "react-hook-form";
import { getFeaturedRooms, searchRooms } from "../../api/roomApi";
import Button from "../../components/ui/Button";

const Rooms = () => {
  const [rooms, setRooms] = useState([]);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { isSubmitting },
  } = useForm();
  const [home, setHome] = useState(true);
  const limit = 10;
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  // useEffect to fetch and set rooms featured
  useEffect(() => {
    if (rooms.length <= 0 && home) {
      fetchFeaturedRooms();
    }
  }, [rooms, home]);

  // fetch featured rooms function
  const fetchFeaturedRooms = async () => {
    if (loading) {
      return;
    }
    setLoading(true);

    try {
      const result = await getFeaturedRooms(offset, limit);

      if (result.success) {
        setRooms((prev) =>
          offset === 0
            ? result.featuredRooms
            : [...prev, ...result.featuredRooms]
        );

        const got = result.featuredRooms?.length || 0;
        setOffset(offset + got);
        setHasMore(result.hasMore);
      } else {
        console.error(result.error);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setHome(true);
      setLoading(false);
    }
  };

  // form submit function
  const onSubmit = async (data) => {
    const q = (data.search || "").trim();
    if (!q.length) {
      setValue("search", "");
      return;
    }

    fetchSearchRooms(q, 0);
  };

  // search room function
  const fetchSearchRooms = async (searchQuery, startOffset = 0) => {
    if (loading) {
      return;
    }
    setLoading(true);

    try {
      const result = await searchRooms(searchQuery, startOffset, limit);

      if (result.success) {
        setRooms((prev) =>
          startOffset === 0
            ? result.searchedRooms
            : [...prev, ...result.searchedRooms]
        );

        const got = result.searchedRooms?.length || 0;
        setOffset(startOffset + got);
        setHasMore(result.hasMore);
        setHome(false);
        setQuery(searchQuery);
      } else {
        setRooms([]);
        setHasMore(false);
        console.error(result.error);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setHome(false);
      setLoading(false);
    }
  };

  // load more rooms function
  const handleLoadMore = () => {
    if (home) {
      fetchFeaturedRooms();
    } else {
      fetchSearchRooms(query, offset);
    }
  };

  return (
    <div className="w-full bg-[var(--app-bg)]">
      <div className="flex justify-start items-center bg-[var(--top-navigation-bg)] h-[10%]">
        <button
          className="cursor-pointer border-none text-[var(--secondary-text)] rounded-full mx-2 hover:text-[var(--send-button-hover)]"
          onClick={() => {
            if (home) {
              navigate(-1);
            } else {
              setOffset(0);
              setHome(true);
              setRooms([]);
            }
          }}
        >
          <FontAwesomeIcon
            icon={faChevronLeft}
            className="w-7 h-7 md:w-8 md:h-8 lg:w-10 lg:h-10"
          />
        </button>

        <form
          className="flex justify-center items-center w-full h-full"
          autoComplete="off"
          onSubmit={handleSubmit(onSubmit)}
        >
          <input
            type="text"
            spellCheck="false"
            placeholder="Search Rooms..."
            className="bg-[var(--top-navigation-bg)] text-[var(--input-text)] w-full outline-none"
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
              type="button"
              className="cursor-pointer text-[var(--search-button-text)] hover:text-[var(--search-button-hover-text)]"
              onClick={() => {
                setValue("search", "");
              }}
            >
              <FontAwesomeIcon
                icon={faXmark}
                className="w-7 h-7 md:w-8 md:h-8 lg:w-10 lg:h-10"
              />
            </button>
          )}

          <button
            type="submit"
            className="cursor-pointer text-[var(--search-button-text)] hover:text-[var(--search-button-hover-text)] mr-2"
            disabled={isSubmitting}
          >
            <FontAwesomeIcon
              icon={faMagnifyingGlass}
              className="w-7 h-7 md:w-8 md:h-8 lg:w-10 lg:h-10"
            />
          </button>
        </form>
      </div>

      <div className="flex flex-col h-[90%] overflow-y-scroll p-8 md:p-12">
        {!rooms.length ? (
          <span className="font-semibold mx-2 text-center text-[var(--inactive-text)]">
            No rooms to display :(
          </span>
        ) : (
          <div className="w-full grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] lg:grid-cols-3 gap-8 md:gap-12">
            {rooms.map((info) => {
              return (
                <div
                  key={info.roomId}
                  className="w-full h-32 md:h-36 lg:h-40 xl:h-48 bg-cover bg-center rounded-xl overflow-hidden whitespace-nowrap"
                  style={{ backgroundImage: `url(${info.roomPfp})` }}
                >
                  <button
                    className="bg-[var(--overlay-button-bg)] hover:bg-[var(--overlay-button-hover)] text-[var(--primary-text)] 
                    h-full w-full flex items-center cursor-pointer transition-all"
                    onClick={() => navigate("/about/" + info.roomId)}
                  >
                    <img
                      src={info.roomPfp}
                      className="h-10 md:h-12 lg:h-16 aspect-square mx-2 md:mx-4 rounded-full object-cover border-2 border-[var(--pfp-border)]"
                      alt="Room Profile"
                    />
                    <span className="text-lg md:text-xl lg:text-2xl font-semibold overflow-hidden overflow-ellipsis">
                      {info.roomName}
                    </span>
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {hasMore && rooms.length > 0 && (
          <div className="w-full flex justify-center items-center mt-8">
            <Button
              size="lg"
              onClick={() => handleLoadMore()}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span>Loading...</span>
                  <FontAwesomeIcon icon={faSpinner} spin className="ml-2" />
                </>
              ) : (
                <span>Load More</span>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Rooms;
