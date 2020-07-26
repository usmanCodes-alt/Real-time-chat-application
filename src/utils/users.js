const users = [];

const addUser = ({ id, username, room }) => {
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();
  if (!username || !room) {
    return {
      error: "Username or room not provided",
    };
  }
  const existingUser = users.find((user) => {
    return user.username === username && user.room === room;
  });
  if (existingUser) {
    return {
      error: "username already taken",
    };
  }
  const user = { id, username, room };
  users.push(user);
  return { user };
};

const removeUser = (id) => {
  const index = users.findIndex((user) => {
    return user.id === id;
  });
  if (index != -1) {
    return users.splice(index, 1)[0]; // return the removed user
  }
};

const getUserById = (id) => {
  const user = users.find((user) => {
    if (user.id == id) {
      return user;
    }
  });
  return user;
};

const getUsersInRoom = (room) => {
  const usersArray = users.filter((user) => {
    return user.room === room;
  });
  return usersArray;
};

module.exports = {
  addUser,
  removeUser,
  getUserById,
  getUsersInRoom,
};
