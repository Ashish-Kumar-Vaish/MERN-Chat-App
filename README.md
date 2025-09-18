# MERN Chat App

A real time chat app build by using Vite + React


## Tech Stack

**Client:** React, Redux, React-Hook-Form, React-Router, TailwindCSS

**Server:** Node, Express, Socket.io, MongoDB, JWT, Cloudinary


## Features

- Real time chat
- Search rooms to join
- Search users
- User profile
- Direct messages
- Add & remove friends
- Create, edit & delete user and room information
- Supports media uploading & previewing


## Environment Variables

To run this project, you will need to add the following environment variables to your .env file

#### For Client: 
`VITE_BACKEND_URL`

#### For Server:
`FRONT_END_URL`

`MONGODB_URI`

`JWT_SECRET_KEY`

`CLOUDINARY_CLOUD_NAME`

`CLOUDINARY_API_KEY`

`CLOUDINARY_API_SECRET`


## 🔗 Links
[![linkedin](https://img.shields.io/badge/linkedin-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/ashishkumarvaish)


## Screenshots

<div style="white-space: nowrap; overflow-x: auto;">
  <img src="/client/public/screenshots/Screenshot-1.png" style="display: inline-block; width: 300px; margin-right: 10px;" alt="Screenshot 1">
  <img src="/client/public/screenshots/Screenshot-2.png" style="display: inline-block; width: 300px; margin-right: 10px;" alt="Screenshot 2">
  <img src="/client/public/screenshots/Screenshot-3.png" style="display: inline-block; width: 300px; margin-right: 10px;" alt="Screenshot 3">
  <img src="/client/public/screenshots/Screenshot-4.png" style="display: inline-block; width: 300px; margin-right: 10px;" alt="Screenshot 4">
  <img src="/client/public/screenshots/Screenshot-5.png" style="display: inline-block; width: 300px; margin-right: 10px;" alt="Screenshot 5">
</div>


## Open Contributions are welcomed!

#### Some of the features that can be fixed/improved are:
- Previewing media bug in direct messages
- Failed messages should be visible only to the sender
- Group media in chat when more than 3 sent together
- Confirmation dialogue box before important actions
- Redis adapter for handling multi-instance socket connections
- Authentication on socket events
- Better documentation & code structure
- Better UI/UX & responsive design

#### Some of the features that can be added are:
- End-to-end message encryption
- Edit and delete messages
- Seen messages indicator
- User online/offline status
- Voice & video calls
- Message reactions
- Room admin/moderator roles
- Push notifications
- Message threading (Reply to message)
- Pin & search messages