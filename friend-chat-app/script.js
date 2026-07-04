const STORAGE_KEY = "friend-chat-state-v1";

const starterFriends = [
  {
    id: "ava",
    name: "Ava",
    messages: [
      { from: "friend", text: "Hey! Did you finish your website?", time: "9:15 AM" },
      { from: "me", text: "Almost. I am making a chat app now.", time: "9:17 AM" }
    ]
  },
  {
    id: "leo",
    name: "Leo",
    messages: [
      { from: "friend", text: "Want to test this together?", time: "Yesterday" }
    ]
  },
  {
    id: "maya",
    name: "Maya",
    messages: []
  }
];

let state = loadState();

const friendList = document.querySelector("#friendList");
const messages = document.querySelector("#messages");
const activeName = document.querySelector("#activeName");
const activeAvatar = document.querySelector("#activeAvatar");
const activeStatus = document.querySelector("#activeStatus");
const friendForm = document.querySelector("#friendForm");
const friendName = document.querySelector("#friendName");
const messageForm = document.querySelector("#messageForm");
const messageInput = document.querySelector("#messageInput");
const clearChat = document.querySelector("#clearChat");

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);

  if (!saved) {
    return { friends: starterFriends, activeId: starterFriends[0].id };
  }

  try {
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed.friends) || parsed.friends.length === 0) {
      return { friends: starterFriends, activeId: starterFriends[0].id };
    }
    return parsed;
  } catch {
    return { friends: starterFriends, activeId: starterFriends[0].id };
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function getActiveFriend() {
  return state.friends.find((friend) => friend.id === state.activeId) || state.friends[0];
}

function initials(name) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function nowLabel() {
  return new Intl.DateTimeFormat([], { hour: "numeric", minute: "2-digit" }).format(new Date());
}

function renderFriends() {
  friendList.innerHTML = "";

  state.friends.forEach((friend) => {
    const latest = friend.messages.at(-1);
    const button = document.createElement("button");
    button.className = `friend-card${friend.id === state.activeId ? " active" : ""}`;
    button.type = "button";
    button.innerHTML = `
      <span class="friend-avatar">${initials(friend.name)}</span>
      <span>
        <span class="friend-name">${friend.name}</span>
        <span class="friend-preview">${latest ? latest.text : "No messages yet"}</span>
      </span>
    `;

    button.addEventListener("click", () => {
      state.activeId = friend.id;
      saveState();
      render();
    });

    friendList.appendChild(button);
  });
}

function renderMessages() {
  const friend = getActiveFriend();
  messages.innerHTML = "";

  if (friend.messages.length === 0) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = `Start a conversation with ${friend.name}. Your messages will stay saved on this computer.`;
    messages.appendChild(empty);
    return;
  }

  friend.messages.forEach((message) => {
    const row = document.createElement("article");
    row.className = `message ${message.from === "me" ? "sent" : "received"}`;
    row.innerHTML = `
      <div class="bubble">${message.text}</div>
      <div class="time">${message.time}</div>
    `;
    messages.appendChild(row);
  });

  messages.scrollTop = messages.scrollHeight;
}

function renderHeader() {
  const friend = getActiveFriend();
  activeName.textContent = friend.name;
  activeAvatar.textContent = initials(friend.name);
  activeStatus.textContent = friend.messages.length > 0 ? "Conversation saved" : "Ready to chat";
}

function render() {
  renderHeader();
  renderFriends();
  renderMessages();
}

friendForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const name = friendName.value.trim();

  if (!name) return;

  const id = `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`;
  state.friends.push({ id, name, messages: [] });
  state.activeId = id;
  friendName.value = "";
  saveState();
  render();
  messageInput.focus();
});

messageForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = messageInput.value.trim();
  const friend = getActiveFriend();

  if (!text || !friend) return;

  friend.messages.push({ from: "me", text, time: nowLabel() });
  messageInput.value = "";
  saveState();
  render();

  window.setTimeout(() => {
    friend.messages.push({
      from: "friend",
      text: "Nice! I got your message.",
      time: nowLabel()
    });
    saveState();
    render();
  }, 700);
});

clearChat.addEventListener("click", () => {
  const friend = getActiveFriend();
  if (!friend || friend.messages.length === 0) return;

  friend.messages = [];
  saveState();
  render();
});

render();
