import { createBrowserRouter, RouterProvider } from "react-router";
import { Nothing } from "./components";
import { Home, Login, Signup, Settings } from "./pages";
import { AboutRoom, Chat, CreateRoom, Inbox, Rooms, User } from "./pages/home";
import { DirectMessages, Friends } from "./pages/home/inbox";
import { Account, Profile } from "./pages/settings";

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
        {
          path: "inbox",
          element: <Inbox />,
          children: [
            {
              index: true,
              element: <Nothing image={"/assets/chatAppLogo.png"} />,
            },
            {
              path: "friends",
              element: <Friends />,
              children: [
                {
                  path: "add",
                  element: null,
                },
              ],
            },
            { path: "dm/:username", element: <DirectMessages /> },
          ],
        },
        {
          path: "user/:username",
          element: <User />,
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
