const generateMessage = (username, text) => {
  return {
    message: text,
    createdAt: new Date().getTime(),
    username: username,
  };
};

const generateLocationMessage = (username, locationUrl) => {
  return {
    locationUrl: locationUrl,
    createdAt: new Date().getTime(),
    username,
  };
};

module.exports = {
  generateMessage: generateMessage,
  generateLocationMessage: generateLocationMessage,
};
