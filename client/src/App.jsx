import { createBrowserRouter, RouterProvider } from "react-router";
import Home from "./pages/home/Home.jsx";
import AboutRoom from "./pages/home/aboutRoom/AboutRoom.jsx";
import Chat from "./pages/home/chat/Chat.jsx";
import CreateRoom from "./pages/home/createRoom/CreateRoom.jsx";
import Rooms from "./pages/home/rooms/Rooms.jsx";
import Login from "./pages/login/Login.jsx";
import Signup from "./pages/signup/Signup.jsx";
import Settings from "./pages/settings/Settings.jsx";
import Account from "./pages/settings/account/Account.jsx";
import Profile from "./pages/settings/profile/Profile.jsx";
import Nothing from "./components/nothing/Nothing.jsx";

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Home />,
      children: [
        {
          index: true,
          element: <Nothing text={"Select a room to start the chat"} />,
        },
        {
          path: "chat/:roomId",
          element: <Chat />,
        },
        {
          path: "rooms",
          element: <Rooms />,
        },
        {
          path: "about/:roomId",
          element: <AboutRoom />,
        },
        {
          path: "createRoom",
          element: <CreateRoom />,
        },
      ],
    },
    {
      path: "/login",
      element: <Login />,
    },
    {
      path: "/signup",
      element: <Signup />,
    },
    {
      path: "/settings",
      element: <Settings />,
      children: [
        {
          index: true,
          element: <Nothing image={"/assets/chatAppLogo.png"} />,
        },
        {
          path: "account",
          element: <Account />,
        },
        {
          path: "profile",
          element: <Profile />,
        },
      ],
    },
  ]);

  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}

export default App;
