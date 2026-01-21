// Demo data for viewing the chat application
export interface DemoProfile {
  id: string;
  user_id: string;
  username: string;
  display_name: string;
  avatar_url: string;
  bio: string;
  status_message: string;
  is_online: boolean;
  last_seen: string;
}

export interface DemoMessage {
  id: string;
  room_id: string;
  sender_id: string;
  content: string;
  message_type: string;
  file_url: string | null;
  file_name: string | null;
  file_size: number | null;
  reply_to_id: string | null;
  is_edited: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  sender?: DemoProfile;
  reactions?: { id: string; message_id: string; user_id: string; emoji: string }[];
}

export interface DemoRoom {
  id: string;
  name: string | null;
  description: string | null;
  avatar_url: string | null;
  is_group: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  members?: { user_id: string; role: string; profile: DemoProfile }[];
  lastMessage?: DemoMessage | null;
}

// Demo users
export const demoProfiles: DemoProfile[] = [
  {
    id: '1',
    user_id: 'demo-user-1',
    username: 'alice_dev',
    display_name: 'Alice Johnson',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alice',
    bio: 'Full-stack developer passionate about React',
    status_message: 'Building awesome apps! 🚀',
    is_online: true,
    last_seen: new Date().toISOString(),
  },
  {
    id: '2',
    user_id: 'demo-user-2',
    username: 'bob_designer',
    display_name: 'Bob Smith',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=bob',
    bio: 'UI/UX Designer | Figma enthusiast',
    status_message: 'Creating beautiful interfaces ✨',
    is_online: true,
    last_seen: new Date().toISOString(),
  },
  {
    id: '3',
    user_id: 'demo-user-3',
    username: 'charlie_pm',
    display_name: 'Charlie Brown',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=charlie',
    bio: 'Product Manager | Agile lover',
    status_message: 'Shipping features daily 📦',
    is_online: false,
    last_seen: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: '4',
    user_id: 'demo-user-4',
    username: 'diana_qa',
    display_name: 'Diana Prince',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=diana',
    bio: 'QA Engineer | Bug hunter',
    status_message: 'Finding bugs before users do 🐛',
    is_online: true,
    last_seen: new Date().toISOString(),
  },
  {
    id: '5',
    user_id: 'demo-user-5',
    username: 'evan_devops',
    display_name: 'Evan Martinez',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=evan',
    bio: 'DevOps Engineer | Cloud enthusiast',
    status_message: 'Automating everything ⚙️',
    is_online: false,
    last_seen: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: '6',
    user_id: 'demo-user-6',
    username: 'fiona_mobile',
    display_name: 'Fiona Lee',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=fiona',
    bio: 'Mobile Developer | React Native',
    status_message: 'Crafting mobile experiences 📱',
    is_online: true,
    last_seen: new Date().toISOString(),
  },
  {
    id: '7',
    user_id: 'demo-user-7',
    username: 'george_data',
    display_name: 'George Wilson',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=george',
    bio: 'Data Scientist | ML Engineer',
    status_message: 'Training models 🤖',
    is_online: true,
    last_seen: new Date().toISOString(),
  },
  {
    id: '8',
    user_id: 'demo-user-8',
    username: 'hannah_sec',
    display_name: 'Hannah Chen',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=hannah',
    bio: 'Security Engineer | Ethical Hacker',
    status_message: 'Keeping systems secure 🔒',
    is_online: false,
    last_seen: new Date(Date.now() - 1800000).toISOString(),
  },
];

// Current demo user (you)
export const currentDemoUser = demoProfiles[0];

// Demo rooms
export const demoRooms: DemoRoom[] = [
  {
    id: 'room-1',
    name: null,
    description: null,
    avatar_url: null,
    is_group: false,
    created_by: 'demo-user-1',
    created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
    updated_at: new Date(Date.now() - 60000).toISOString(),
    members: [
      { user_id: 'demo-user-1', role: 'admin', profile: demoProfiles[0] },
      { user_id: 'demo-user-2', role: 'member', profile: demoProfiles[1] },
    ],
    lastMessage: null,
  },
  {
    id: 'room-2',
    name: null,
    description: null,
    avatar_url: null,
    is_group: false,
    created_by: 'demo-user-1',
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    updated_at: new Date(Date.now() - 120000).toISOString(),
    members: [
      { user_id: 'demo-user-1', role: 'admin', profile: demoProfiles[0] },
      { user_id: 'demo-user-4', role: 'member', profile: demoProfiles[3] },
    ],
    lastMessage: null,
  },
  {
    id: 'room-3',
    name: '🚀 Development Team',
    description: 'Main development team chat',
    avatar_url: null,
    is_group: true,
    created_by: 'demo-user-1',
    created_at: new Date(Date.now() - 86400000 * 30).toISOString(),
    updated_at: new Date(Date.now() - 300000).toISOString(),
    members: [
      { user_id: 'demo-user-1', role: 'admin', profile: demoProfiles[0] },
      { user_id: 'demo-user-2', role: 'member', profile: demoProfiles[1] },
      { user_id: 'demo-user-3', role: 'member', profile: demoProfiles[2] },
      { user_id: 'demo-user-4', role: 'member', profile: demoProfiles[3] },
      { user_id: 'demo-user-5', role: 'member', profile: demoProfiles[4] },
    ],
    lastMessage: null,
  },
  {
    id: 'room-4',
    name: '☕ Random & Fun',
    description: 'Off-topic discussions and fun stuff',
    avatar_url: null,
    is_group: true,
    created_by: 'demo-user-3',
    created_at: new Date(Date.now() - 86400000 * 20).toISOString(),
    updated_at: new Date(Date.now() - 600000).toISOString(),
    members: [
      { user_id: 'demo-user-1', role: 'member', profile: demoProfiles[0] },
      { user_id: 'demo-user-2', role: 'admin', profile: demoProfiles[1] },
      { user_id: 'demo-user-6', role: 'member', profile: demoProfiles[5] },
      { user_id: 'demo-user-7', role: 'member', profile: demoProfiles[6] },
    ],
    lastMessage: null,
  },
  {
    id: 'room-5',
    name: null,
    description: null,
    avatar_url: null,
    is_group: false,
    created_by: 'demo-user-6',
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    updated_at: new Date(Date.now() - 900000).toISOString(),
    members: [
      { user_id: 'demo-user-1', role: 'member', profile: demoProfiles[0] },
      { user_id: 'demo-user-6', role: 'admin', profile: demoProfiles[5] },
    ],
    lastMessage: null,
  },
];

// Generate demo messages
const generateDemoMessages = (): DemoMessage[] => {
  const messages: DemoMessage[] = [];
  let msgId = 1;
  const now = Date.now();

  // Room 1: Alice & Bob conversation (DM)
  const room1Messages = [
    { sender: 1, content: "Hey Bob! How's the new design coming along?", time: -3600000 * 5 },
    { sender: 1, content: "I saw your mockups in Figma - they look amazing! 🎨", time: -3600000 * 4.9 },
    { sender: 2, content: "Thanks Alice! I'm really happy with how it turned out", time: -3600000 * 4.5 },
    { sender: 2, content: "The dark mode toggle was a bit tricky but I think I nailed it", time: -3600000 * 4.4 },
    { sender: 1, content: "I love the glassmorphism effect you added to the cards", time: -3600000 * 4 },
    { sender: 2, content: "Right? It gives it that modern feel without being too flashy", time: -3600000 * 3.9 },
    { sender: 1, content: "When do you think you can hand off the final assets?", time: -3600000 * 3 },
    { sender: 2, content: "Probably by end of day tomorrow. Just need to finalize the icon set", time: -3600000 * 2.9 },
    { sender: 1, content: "Perfect! That gives me time to prep the components", time: -3600000 * 2.8 },
    { sender: 2, content: "I'll share the Figma link once it's ready for dev handoff 👍", time: -3600000 * 2.5 },
    { sender: 1, content: "Sounds good! Also, are you joining the standup later?", time: -3600000 * 2 },
    { sender: 2, content: "Yep, wouldn't miss it. Charlie said he has some exciting news 👀", time: -3600000 * 1.9 },
    { sender: 1, content: "Ooh interesting! I wonder what it could be", time: -3600000 * 1.8 },
    { sender: 2, content: "My guess is either a new project or team expansion", time: -3600000 * 1.5 },
    { sender: 1, content: "We'll find out soon! See you there 🙌", time: -3600000 * 1 },
    { sender: 2, content: "See ya!", time: -3600000 * 0.9, reactions: [{ emoji: '👋', userId: 'demo-user-1' }] },
  ];

  room1Messages.forEach(msg => {
    messages.push({
      id: `msg-${msgId++}`,
      room_id: 'room-1',
      sender_id: `demo-user-${msg.sender}`,
      content: msg.content,
      message_type: 'text',
      file_url: null,
      file_name: null,
      file_size: null,
      reply_to_id: null,
      is_edited: false,
      is_deleted: false,
      created_at: new Date(now + msg.time).toISOString(),
      updated_at: new Date(now + msg.time).toISOString(),
      sender: demoProfiles[msg.sender - 1],
      reactions: msg.reactions?.map(r => ({ id: `react-${msgId}`, message_id: `msg-${msgId}`, user_id: r.userId, emoji: r.emoji })) || [],
    });
  });

  // Room 2: Alice & Diana conversation (DM)
  const room2Messages = [
    { sender: 1, content: "Diana, did you get a chance to test the new feature?", time: -3600000 * 8 },
    { sender: 4, content: "Yes! I just finished running the test suite", time: -3600000 * 7.8 },
    { sender: 4, content: "Found a couple of edge cases we need to handle", time: -3600000 * 7.7 },
    { sender: 1, content: "Oh no, what kind of issues? 😅", time: -3600000 * 7.5 },
    { sender: 4, content: "Nothing major! Just some input validation on the form", time: -3600000 * 7.4 },
    { sender: 4, content: "If someone enters special characters in the username field, it throws an error", time: -3600000 * 7.3 },
    { sender: 1, content: "Ah good catch! I'll add that to my list", time: -3600000 * 7 },
    { sender: 4, content: "Also the loading spinner doesn't appear on slow connections", time: -3600000 * 6.9 },
    { sender: 1, content: "I can fix both of those today actually", time: -3600000 * 6.5 },
    { sender: 4, content: "Amazing! Let me know when you push the fix and I'll retest", time: -3600000 * 6.4 },
    { sender: 1, content: "Will do. Thanks for the thorough testing! 🙏", time: -3600000 * 6 },
    { sender: 4, content: "That's what I'm here for! Bug hunting is my passion 🐛🔍", time: -3600000 * 5.9, reactions: [{ emoji: '😂', userId: 'demo-user-1' }] },
    { sender: 1, content: "Haha we're lucky to have you on the team", time: -3600000 * 5.8 },
  ];

  room2Messages.forEach(msg => {
    messages.push({
      id: `msg-${msgId++}`,
      room_id: 'room-2',
      sender_id: `demo-user-${msg.sender}`,
      content: msg.content,
      message_type: 'text',
      file_url: null,
      file_name: null,
      file_size: null,
      reply_to_id: null,
      is_edited: false,
      is_deleted: false,
      created_at: new Date(now + msg.time).toISOString(),
      updated_at: new Date(now + msg.time).toISOString(),
      sender: demoProfiles[msg.sender - 1],
      reactions: msg.reactions?.map(r => ({ id: `react-${msgId}`, message_id: `msg-${msgId}`, user_id: r.userId, emoji: r.emoji })) || [],
    });
  });

  // Room 3: Development Team group chat
  const room3Messages = [
    { sender: 3, content: "Good morning team! 🌅", time: -86400000 },
    { sender: 1, content: "Morning Charlie!", time: -86400000 + 60000 },
    { sender: 2, content: "Hey everyone! Ready for another productive day", time: -86400000 + 120000 },
    { sender: 5, content: "Morning! The CI/CD pipeline is looking good today", time: -86400000 + 180000 },
    { sender: 4, content: "Great! I have some tests queued up", time: -86400000 + 240000 },
    { sender: 3, content: "Quick update: we have a new sprint starting Monday", time: -86400000 + 3600000 },
    { sender: 3, content: "I'll be sending out the sprint goals later today", time: -86400000 + 3660000 },
    { sender: 1, content: "Looking forward to it! Any preview of what's coming?", time: -86400000 + 3720000 },
    { sender: 3, content: "We're focusing on the messaging feature - lots of exciting stuff!", time: -86400000 + 3780000, reactions: [{ emoji: '🔥', userId: 'demo-user-1' }, { emoji: '🚀', userId: 'demo-user-2' }] },
    { sender: 2, content: "That's awesome! I've been working on the UI for that", time: -86400000 + 3840000 },
    { sender: 5, content: "I'll make sure the infrastructure can handle the real-time messaging", time: -86400000 + 3900000 },
    { sender: 4, content: "I'll prepare the test cases for the messaging flows", time: -86400000 + 3960000 },
    { sender: 1, content: "Team is on fire! 🔥", time: -86400000 + 4020000 },
    { sender: 3, content: "That's what I love about this team - always ready to collaborate", time: -86400000 + 4080000 },
    { sender: 2, content: "Speaking of collaboration, should we do a quick design review today?", time: -3600000 * 10 },
    { sender: 1, content: "I'm free after 3pm", time: -3600000 * 9.9 },
    { sender: 4, content: "Same here!", time: -3600000 * 9.8 },
    { sender: 5, content: "Count me in as well", time: -3600000 * 9.7 },
    { sender: 3, content: "Perfect! Let's do 3pm then. I'll send a calendar invite", time: -3600000 * 9.5 },
    { sender: 2, content: "Great! I'll prepare the Figma file", time: -3600000 * 9.4 },
    { sender: 1, content: "Can someone share the latest API docs?", time: -3600000 * 8 },
    { sender: 5, content: "Sure! Let me dig those up", time: -3600000 * 7.9 },
    { sender: 5, content: "Here's the link to the API documentation: https://docs.example.com/api", time: -3600000 * 7.8 },
    { sender: 1, content: "Thanks Evan! 🙌", time: -3600000 * 7.7, reactions: [{ emoji: '👍', userId: 'demo-user-5' }] },
    { sender: 4, content: "Quick question - are we using WebSockets or SSE for real-time?", time: -3600000 * 6 },
    { sender: 1, content: "WebSockets. They give us bidirectional communication", time: -3600000 * 5.9 },
    { sender: 5, content: "Yep, already set up the WebSocket server with auto-reconnection", time: -3600000 * 5.8 },
    { sender: 4, content: "Perfect, that's what I assumed for my test cases", time: -3600000 * 5.7 },
    { sender: 2, content: "Just pushed the latest design updates to Figma!", time: -3600000 * 3 },
    { sender: 3, content: "Amazing work Bob! The new message bubbles look fantastic", time: -3600000 * 2.9, reactions: [{ emoji: '❤️', userId: 'demo-user-1' }, { emoji: '👍', userId: 'demo-user-4' }] },
    { sender: 1, content: "Love the gradient on the sent messages!", time: -3600000 * 2.8 },
    { sender: 2, content: "Thanks! Tried to make it feel like a premium app", time: -3600000 * 2.7 },
    { sender: 5, content: "The dark mode looks especially good", time: -3600000 * 2.6 },
    { sender: 4, content: "Agreed! My eyes thank you 😎", time: -3600000 * 2.5 },
  ];

  room3Messages.forEach(msg => {
    messages.push({
      id: `msg-${msgId++}`,
      room_id: 'room-3',
      sender_id: `demo-user-${msg.sender}`,
      content: msg.content,
      message_type: 'text',
      file_url: null,
      file_name: null,
      file_size: null,
      reply_to_id: null,
      is_edited: false,
      is_deleted: false,
      created_at: new Date(now + msg.time).toISOString(),
      updated_at: new Date(now + msg.time).toISOString(),
      sender: demoProfiles[msg.sender - 1],
      reactions: msg.reactions?.map(r => ({ id: `react-${msgId}`, message_id: `msg-${msgId}`, user_id: r.userId, emoji: r.emoji })) || [],
    });
  });

  // Room 4: Random & Fun group chat
  const room4Messages = [
    { sender: 7, content: "Anyone else addicted to coffee? ☕", time: -86400000 * 2 },
    { sender: 2, content: "Guilty as charged! 3 cups minimum", time: -86400000 * 2 + 60000 },
    { sender: 6, content: "I'm more of a tea person myself 🍵", time: -86400000 * 2 + 120000 },
    { sender: 1, content: "Coffee before 12pm, tea after. Balance is key!", time: -86400000 * 2 + 180000 },
    { sender: 7, content: "That's actually a great strategy Alice!", time: -86400000 * 2 + 240000 },
    { sender: 2, content: "Has anyone watched the new sci-fi series?", time: -86400000 + 3600000 },
    { sender: 6, content: "Which one? There are so many good ones!", time: -86400000 + 3660000 },
    { sender: 2, content: "The one on Netflix about the space colony", time: -86400000 + 3720000 },
    { sender: 1, content: "Oh I've been meaning to watch that!", time: -86400000 + 3780000 },
    { sender: 7, content: "It's SO good. I binged it all in one weekend 😅", time: -86400000 + 3840000, reactions: [{ emoji: '😂', userId: 'demo-user-2' }] },
    { sender: 6, content: "No spoilers please! I'm only on episode 3", time: -86400000 + 3900000 },
    { sender: 2, content: "My lips are sealed 🤐", time: -86400000 + 3960000 },
    { sender: 1, content: "Random question: tabs or spaces?", time: -3600000 * 12 },
    { sender: 7, content: "Spaces. Fight me. 😤", time: -3600000 * 11.9 },
    { sender: 2, content: "Tabs! They're meant for indentation!", time: -3600000 * 11.8 },
    { sender: 6, content: "I use whatever the linter tells me to 😂", time: -3600000 * 11.7, reactions: [{ emoji: '😂', userId: 'demo-user-1' }, { emoji: '👍', userId: 'demo-user-7' }] },
    { sender: 1, content: "That's the most pragmatic answer I've heard", time: -3600000 * 11.6 },
    { sender: 7, content: "Friday vibes! Anyone doing anything fun this weekend?", time: -3600000 * 5 },
    { sender: 2, content: "Hiking if the weather permits 🏔️", time: -3600000 * 4.9 },
    { sender: 6, content: "I have a gaming session planned with friends", time: -3600000 * 4.8 },
    { sender: 1, content: "I'll probably end up coding a side project 😅", time: -3600000 * 4.7 },
    { sender: 7, content: "Classic developer move! What are you building?", time: -3600000 * 4.6 },
    { sender: 1, content: "A personal finance tracker. Been wanting one that actually works for me", time: -3600000 * 4.5 },
    { sender: 2, content: "That sounds cool! Let us know if you need design help", time: -3600000 * 4.4, reactions: [{ emoji: '❤️', userId: 'demo-user-1' }] },
    { sender: 1, content: "Will do! Thanks Bob 🙏", time: -3600000 * 4.3 },
  ];

  room4Messages.forEach(msg => {
    messages.push({
      id: `msg-${msgId++}`,
      room_id: 'room-4',
      sender_id: `demo-user-${msg.sender}`,
      content: msg.content,
      message_type: 'text',
      file_url: null,
      file_name: null,
      file_size: null,
      reply_to_id: null,
      is_edited: false,
      is_deleted: false,
      created_at: new Date(now + msg.time).toISOString(),
      updated_at: new Date(now + msg.time).toISOString(),
      sender: demoProfiles[msg.sender - 1],
      reactions: msg.reactions?.map(r => ({ id: `react-${msgId}`, message_id: `msg-${msgId}`, user_id: r.userId, emoji: r.emoji })) || [],
    });
  });

  // Room 5: Alice & Fiona conversation (DM)
  const room5Messages = [
    { sender: 6, content: "Hey Alice! Do you have experience with React Native?", time: -3600000 * 24 },
    { sender: 1, content: "Hey Fiona! Yes, I've done a few projects with it", time: -3600000 * 23.9 },
    { sender: 6, content: "Awesome! I'm stuck on a navigation issue", time: -3600000 * 23.8 },
    { sender: 1, content: "What kind of navigation are you using? Stack or Tab?", time: -3600000 * 23.7 },
    { sender: 6, content: "Stack navigation, but I'm having trouble with deep linking", time: -3600000 * 23.6 },
    { sender: 1, content: "Oh that can be tricky! Are you using React Navigation v6?", time: -3600000 * 23.5 },
    { sender: 6, content: "Yes exactly!", time: -3600000 * 23.4 },
    { sender: 1, content: "Let me share a snippet that helped me...", time: -3600000 * 23.3 },
    { sender: 1, content: "You need to configure the linking prop on the NavigationContainer", time: -3600000 * 23.2 },
    { sender: 6, content: "That makes sense! I think I was missing that part", time: -3600000 * 23.1 },
    { sender: 1, content: "Also make sure your URL schemes are set up correctly in the native config", time: -3600000 * 23 },
    { sender: 6, content: "Oh I completely forgot about that! Let me check...", time: -3600000 * 22.9 },
    { sender: 6, content: "That was it! Thank you so much Alice! 🎉", time: -3600000 * 20, reactions: [{ emoji: '🙌', userId: 'demo-user-1' }] },
    { sender: 1, content: "Happy to help! Deep linking is a common gotcha", time: -3600000 * 19.9 },
    { sender: 6, content: "You just saved me hours of debugging!", time: -3600000 * 19.8 },
    { sender: 1, content: "That's what teammates are for! 💪", time: -3600000 * 19.7, reactions: [{ emoji: '❤️', userId: 'demo-user-6' }] },
  ];

  room5Messages.forEach(msg => {
    messages.push({
      id: `msg-${msgId++}`,
      room_id: 'room-5',
      sender_id: `demo-user-${msg.sender}`,
      content: msg.content,
      message_type: 'text',
      file_url: null,
      file_name: null,
      file_size: null,
      reply_to_id: null,
      is_edited: false,
      is_deleted: false,
      created_at: new Date(now + msg.time).toISOString(),
      updated_at: new Date(now + msg.time).toISOString(),
      sender: demoProfiles[msg.sender - 1],
      reactions: msg.reactions?.map(r => ({ id: `react-${msgId}`, message_id: `msg-${msgId}`, user_id: r.userId, emoji: r.emoji })) || [],
    });
  });

  return messages;
};

export const demoMessages = generateDemoMessages();

// Update rooms with last messages
demoRooms.forEach(room => {
  const roomMessages = demoMessages.filter(m => m.room_id === room.id);
  if (roomMessages.length > 0) {
    room.lastMessage = roomMessages[roomMessages.length - 1];
  }
});

export const getMessagesForRoom = (roomId: string): DemoMessage[] => {
  return demoMessages.filter(m => m.room_id === roomId);
};
