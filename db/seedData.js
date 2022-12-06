const client = require("./client");
const chalk = require("chalk");

const { createUser, createPost, createMessage, addFriends } = require("./");
const { createComment, updateComment } = require("./comments");
const { addUpvoteToComment } = require("./comment_upvotes");
const { requestFriend, acceptFriend } = require("./friendRequests");
const { getNotisByUserId, seenByNotiId } = require("./notifications");

const createTables = async () => {
  console.log(chalk.green("BUILDING TABLES..."));
  try {
    await createTableUsers();
    await createTablePosts();
    await createTablePostUpvotes();
    await createTableComments();
    await createTableCommentUpvotes();
    await createTableMessages();
    await createTableFriendRequests();
    await createTableFriendsLists();
    await createTableNotifications();

    console.log(chalk.green("FINISHED BUILDING TABLES"));
  } catch (error) {
    console.error(chalk.red("ERROR BUILDING TABLES!", error));
    //throw error;ror;
  }
};

const dropTables = async () => {
  console.log(chalk.green("DROPPING TABLES..."));
  try {
    await client.query(`
        DROP TABLE IF EXISTS notifications;
        DROP TABLE IF EXISTS friendslists;
        DROP TABLE IF EXISTS friendrequests;
        DROP TABLE IF EXISTS messages;
        DROP TABLE IF EXISTS comment_upvotes;
        DROP TABLE IF EXISTS comments;
        DROP TABLE IF EXISTS post_upvotes;
        DROP TABLE IF EXISTS posts;
        DROP TABLE IF EXISTS users;
        `);
    console.log(chalk.green("FINISHED DROPPING TABLES"));
  } catch (error) {
    console.error(chalk.red("ERROR DROPPING TABLES!", error));
    //throw error;ror;
  }
};

const createTableUsers = async () => {
  try {
    await client.query(`
            CREATE TABLE users(
                id SERIAL PRIMARY KEY,
                firstname VARCHAR(50) NOT NULL,
                lastname VARCHAR(50) NOT NULL,
                username VARCHAR(30) NOT NULL,
                password VARCHAR(255) NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                "picUrl" VARCHAR(255) NOT NULL,
                "lastActive" TIMESTAMPTZ DEFAULT null,
                "isAdmin" boolean DEFAULT false
            );
        `);
  } catch (error) {
    console.error(chalk.red("error during create users table"));
    //throw error;ror;
  }
};
const createTablePosts = async () => {
  try {
    await client.query(`
            CREATE TABLE posts(
               id SERIAL PRIMARY KEY,
               "userId" INTEGER REFERENCES users(id),
               text VARCHAR(1020) NOT NULL,
               "isPublic" BOOLEAN DEFAULT false NOT NULL,
               time TIMESTAMPTZ NOT NULL,
               "updateTime" TIMESTAMPTZ DEFAULT null
            );
        `);
  } catch (error) {
    console.error(chalk.red("error during create posts table"));
    //throw error;ror;
  }
};
const createTablePostUpvotes = async () => {
  try {
    await client.query(`
            CREATE TABLE post_upvotes(
                id SERIAL PRIMARY KEY,
                "userId" INTEGER REFERENCES users(id),
                "postId" INTEGER REFERENCES posts(id),
                UNIQUE ("userId", "postId")
            ); 
        `);
  } catch (error) {
    console.error(chalk.red("error during create upvotes table"));
    //throw error;ror;
  }
};
const createTableComments = async () => {
  try {
    await client.query(`
      CREATE TABLE comments(
        id SERIAL PRIMARY KEY,
        "authorId" INTEGER REFERENCES users(id),
        "postId" INTEGER REFERENCES posts(id),
        time TIMESTAMPTZ NOT NULL,
        text VARCHAR(2040) NOT NULL,
        "updateTime" TIMESTAMPTZ DEFAULT null
      );
    `);
  } catch (error) {
    console.error(chalk.red("error during create comments table", error));
    //throw error;ror;
  }
};
const createTableCommentUpvotes = async () => {
  try {
    await client.query(`
            CREATE TABLE comment_upvotes(
                id SERIAL PRIMARY KEY,
                "userId" INTEGER REFERENCES users(id),
                "commentId" INTEGER REFERENCES comments(id),
                UNIQUE ("userId", "commentId")
            ); 
        `);
  } catch (error) {
    console.error(chalk.red("error during create upvotes table"));
    //throw error;ror;
  }
};
const createTableMessages = async () => {
  try {
    await client.query(`
            CREATE TABLE messages(
                id SERIAL PRIMARY KEY,
                "sendingUserId" INTEGER REFERENCES users(id),
                "recipientUserId" INTEGER REFERENCES users(id),
                time TIMESTAMPTZ NOT NULL,
                text VARCHAR(255) NOT NULL
            );
        `);
  } catch (error) {
    console.error("error during create messages table");
    //throw error;ror;
  }
};
const createTableFriendRequests = async () => {
  try {
    await client.query(`
            CREATE TABLE friendrequests(
                "userId" INTEGER REFERENCES users(id),
                "requestedFriendId" INTEGER REFERENCES users(id),
                UNIQUE ("userId", "requestedFriendId")
            );
        `);
  } catch (error) {
    console.error(chalk.red("error during create friendsrequests table"));
    //throw error;ror;
  }
};
const createTableFriendsLists = async () => {
  try {
    await client.query(`
            CREATE TABLE friendslists(
                "userId" INTEGER REFERENCES users(id),
                "friendId" INTEGER REFERENCES users(id),
                UNIQUE ("userId", "friendId")
            );
        `);
  } catch (error) {
    console.error(chalk.red("error during create friendslist table"));
    //throw error;ror;
  }
};
const createTableNotifications = async () => {
  try {
    await client.query(`
            CREATE TABLE notifications(
                id SERIAL PRIMARY KEY,
                "userId" INTEGER REFERENCES users(id),
                type VARCHAR(40) NOT NULL,
                text VARCHAR(255) NOT NULL,
                url VARCHAR(255) DEFAULT NULL,
                "miscId" INTEGER DEFAULT NULL,
                seen boolean DEFAULT false
            );
        `);
  } catch (error) {
    console.error(chalk.red("error during create notifications table"));
    //throw error;ror;
  }
};

//data

const createInitialUsers = async () => {
  console.log(chalk.green("CREATING INITIAL USERS..."));
  try {
    // Seeding like this so that our users don't swap places like when we seed using promise.All
    const albertSeed = {
      firstname: "Al",
      lastname: "Bert",
      username: "albert",
      password: "bertie99",
      email: "Al.Bert@gmail.com",
      picUrl:
        "https://www.biography.com/.image/ar_1:1%2Cc_fill%2Ccs_srgb%2Cfl_progressive%2Cq_auto:good%2Cw_1200/MTc5ODc5NjY5ODU0NjQzMzIy/gettyimages-3091504.jpg",
      isAdmin: true,
    };
    const sandraSeed = {
      firstname: "San",
      lastname: "Dra",
      username: "sandra",
      password: "sandra123",
      email: "San.Dra@gmail.com",
      picUrl:
        "https://www.biography.com/.image/ar_1:1%2Cc_fill%2Ccs_srgb%2Cfl_progressive%2Cq_auto:good%2Cw_1200/MTc5OTUwNjI0MDU2NTUwNTIy/gettyimages-1074346390-square.jpg",
    };
    const glamgalSeed = {
      firstname: "Glam",
      lastname: "Gal",
      username: "glamgal",
      password: "glamgal123",
      email: "Glam.Gal@gmail.com",
      picUrl:
        "https://pbs.twimg.com/profile_images/569955623136022528/F9qYeDFk_400x400.png",
    };

    const stackerSeed = {
      firstname: "Stacker",
      lastname: "22",
      username: "stacker22",
      password: "password",
      email: "stacker.22@fakemail.com",
      isAdmin: true,
    };

    console.log(
      chalk.blueBright("SEEDING USERS... ", albertSeed, sandraSeed, glamgalSeed)
    );

    const albert = await createUser(albertSeed);
    const sandra = await createUser(sandraSeed);
    const glamgal = await createUser(glamgalSeed);
    await createUser(stackerSeed);

    console.log(chalk.yellowBright("SEEDED USERS: ", albert, sandra, glamgal));
    console.log(chalk.green("FINISHED CREATING USERS!"));
  } catch (error) {
    console.error(chalk.red("ERROR SEEDING USERS", error));
    //throw error;ror;
  }
};

const createInitialPosts = async () => {
  console.log(chalk.green("CREATING INITIAL POSTS..."));

  try {
    const seedPost1 = {
      userId: 1,
      text: "This is the first post in social stack!",
      isPublic: true,
      time: "2022-10-25 10:46:00+00:00",
    };

    const seedPost2 = {
      userId: 2,
      text: "Hey checkout this code!!!",
      time: "2022-10-25 10:46:00+00:00",
      isPublic: true,
    };

    const seedPost3 = {
      userId: 3,
      text: "Please hire us!",
      time: "2022-10-25 10:46:00+00:00",
    };

    const seedPost4 = {
      userId: 4,
      text: "Will code for coffee",
      time: new Date(),
      isPublic: true,
    };

    console.log(
      chalk.blueBright("SEEDING POSTS...", seedPost1, seedPost2, seedPost3)
    );

    const post1 = await createPost(seedPost1);
    const post2 = await createPost(seedPost2);
    const post3 = await createPost(seedPost3);
    await createPost(seedPost4);

    console.log(chalk.yellowBright("SEEDED POSTS: ", post1, post2, post3));
    console.log(chalk.green("FINISHED CREATING POSTS!"));
  } catch (error) {
    console.error(chalk.red("ERROR SEEDING POSTS", error));
    //throw error;ror;
  }
};

const createInitialComments = async () => {
  console.log(chalk.green("CREATING INITIAL COMMENTS..."));

  try {
    const seedComment1 = {
      authorId: 1,
      postId: 1,
      time: "2022-10-25 11:06:00+00:00",
      text: "Look what I can do!!!",
    };

    const seedComment2 = {
      authorId: 2,
      postId: 1,
      time: "2022-10-26 11:06:00+00:00",
      text: "Great job, everyone!",
    };

    const seedComment7 = {
      authorId: 4,
      postId: 2,
      time: new Date(),
      text: "Congrats!",
    };

    const seedComment8 = {
      authorId: 3,
      postId: 1,
      time: new Date(),
      text: "Ain't that just the neatest thing I ever done did see",
    };

    const seedComment10 = {
      authorId: 4,
      postId: 4,
      time: new Date(),
      text: "An evergreen tree, which keeps green leaves all year round. Depicted as a tall, dark green, cone-shaped tree with shaggy, layered leaves, as a pine or fir, showing a brown trunk.",
    };

    const seedComment16 = {
      authorId: 4,
      postId: 1,
      time: new Date(),
      text: "The 1989 UK Athletics Championships was the national championship in outdoor track and field for the United Kingdom held at Monkton Stadium, Jarrow. It was the first time that the event was held in North East England. The men's 10,000 metres was dropped from the programme and replaced by a 3000 metres event. Strong winds affected the jumps programme and several of the sprint races.",
    };

    const seedComment17 = {
      authorId: 3,
      postId: 3,
      time: new Date(),
      text: "Marques del Duero was a first-class gunboat, or 'aviso', built by La Seyne in France. She was laid down on 20 January 1875, launched on 3 May 1875, and completed the same year. She was designed to fight against the Carlists in the Mediterranean and the Bay of Biscay during the Third Carlist War, patrolling off Carlist ports to intercept contraband and blockade the ports, and also providing despatch services between Spanish Navy forces operating off various ports, hence her Spanish designation of aviso, meaning 'warning.' She had an iron hull with a very prominent ram bow, was coal-fired, was rigged as a schooner, and could carry 89 tons of coal. She was reclassified as a third-class gunboat in 1895.",
    };

    const seedComment20 = {
      authorId: 4,
      postId: 4,
      time: new Date(),
      text: "The 20th Utah Senate District is located in Weber County and includes Utah House Districts 6, 7, 8, 9, 11 and 12. The current State Senator representing the 20th district is Gregg Buxton. Buxton was elected to the Utah Senate in 2016 and re-elected in 2020.",
    };

    console.log(
      chalk.blueBright("SEEDING COMMENTS...", seedComment1, seedComment2)
    );

    const comment1 = await createComment(seedComment1);
    const comment2 = await createComment(seedComment2);
    await createComment(seedComment7);
    await createComment(seedComment8);
    await createComment(seedComment10);
    await createComment(seedComment16);
    await createComment(seedComment17);
    await createComment(seedComment20);

    console.log(chalk.yellowBright("SEEDED COMMENTS: ", comment1, comment2));

    const updatedComment = await updateComment({
      commentId: comment1.id,
      time: new Date(),
      text: "What a neat update.",
    });

    console.log(chalk.green("FINISHED CREATING COMMENTS!"));
  } catch (error) {
    console.error(chalk.red("ERROR SEEDING COMMENTS", error));
    //throw error;ror;
  }
};

const createInitialCommentUpvotes = async () => {
  console.log(chalk.green("CREATING INITIAL COMMENT UPVOTES..."));

  try {
    const seedCommentUpvote1 = {
      commentId: 1,
      userId: 1,
    };

    const seedCommentUpvote2 = {
      commentId: 1,
      userId: 2,
    };

    const seedCommentUpvote3 = {
      commentId: 2,
      userId: 1,
    };

    const seedCommentUpvote4 = {
      commentId: 3,
      userId: 4,
    };

    const seedCommentUpvote7 = {
      commentId: 3,
      userId: 3,
    };

    const seedCommentUpvote8 = {
      commentId: 4,
      userId: 6,
    };

    const seedCommentUpvote9 = {
      commentId: 6,
      userId: 4,
    };

    const seedCommentUpvote10 = {
      commentId: 2,
      userId: 5,
    };

    console.log(
      chalk.blueBright(
        "SEEDING COMMENT UPVOTES...",
        seedCommentUpvote1,
        seedCommentUpvote2,
        seedCommentUpvote3
      )
    );

    const upvote1 = await addUpvoteToComment(seedCommentUpvote1);
    const upvote2 = await addUpvoteToComment(seedCommentUpvote2);
    const upvote3 = await addUpvoteToComment(seedCommentUpvote3);
    await addUpvoteToComment(seedCommentUpvote4);
    await addUpvoteToComment(seedCommentUpvote7);
    await addUpvoteToComment(seedCommentUpvote8);
    await addUpvoteToComment(seedCommentUpvote9);
    await addUpvoteToComment(seedCommentUpvote10);

    console.log(
      chalk.yellowBright("SEEDED COMMENT UPVOTES: ", upvote1, upvote2, upvote3)
    );
    console.log(chalk.green("FINISHED CREATING COMMENT UPVOTES!"));
  } catch (error) {
    console.error(chalk.red("ERROR SEEDING COMMENT UPVOTES", error));
    //throw error;ror;
  }
};

const createInitialMessages = async () => {
  console.log(chalk.green("CREATING INITIAL MESSAGES..."));

  try {
    const seedMessage1 = {
      sendingUserId: 1,
      recipientUserId: 2,
      time: "2022-10-25 11:06:00+00:00",
      text: "Testing 123",
    };

    const seedMessage2 = {
      sendingUserId: 2,
      recipientUserId: 1,
      time: "2022-10-25 11:08:00+00:00",
      text: "Received!",
    };

    const seedMessage3 = {
      sendingUserId: 3,
      recipientUserId: 1,
      time: "2022-10-25 11:08:00+00:00",
      text: "Please hire me!",
    };

    const seedMessage4 = {
      sendingUserId: 2,
      recipientUserId: 1,
      time: "2022-10-25 11:08:00+00:00",
      text: "Sandra says hi!",
    };

    const seedMessage5 = {
      sendingUserId: 3,
      recipientUserId: 4,
      time: new Date(),
      text: "I found this answer by looking in %USERPROFILE%AppDataLocal\rancher-desktoplogswsl-exec.log which revealed: WSL 2 requires an update to its kernel component.",
    };

    const seedMessage13 = {
      sendingUserId: 4,
      recipientUserId: 1,
      time: new Date(),
      text: "Subbed to see more of this series, good job so far man",
    };

    console.log(
      chalk.blueBright(
        "SEEDING MESSAGES...",
        seedMessage1,
        seedMessage2,
        seedMessage3
      )
    );

    const message1 = await createMessage(seedMessage1);
    const message2 = await createMessage(seedMessage2);
    const message3 = await createMessage(seedMessage3);
    const message4 = await createMessage(seedMessage4);
    const message5 = await createMessage(seedMessage5);
    await createMessage(seedMessage13);

    console.log(
      chalk.yellowBright(
        "SEEDED MESSAGES",
        message1,
        message2,
        message3,
        message4,
        message5
      )
    );
    console.log(chalk.green("FINISHED CREATING MESSAGES!"));
  } catch (error) {
    console.error(chalk.red("ERROR SEEDING MESSAGES", error));
    //throw error;ror;
  }
};

const createInitialFriendsList = async () => {
  console.log(chalk.green("CREATING INITIAL FREINDSLIST..."));

  try {
    const friendsList1 = await addFriends(1, 2);
    const friendsList2 = await addFriends(1, 3);
    await addFriends(4, 3);
    await addFriends(4, 2);
    await addFriends(4, 1);

    console.log(
      chalk.yellowBright("SEEDED FRIENDSLIST", friendsList1, friendsList2)
    );

    console.log(chalk.green("FINISHED CREATING FRIENDSLIST!"));
  } catch (error) {
    console.error(chalk.red("ERROR SEEDING FRIENDSLIST", error));
    //throw error;ror;
  }
};

const rebuildDB = async () => {
  try {
    client.connect();

    await dropTables();
    await createTables();
    await createInitialUsers();
    await createInitialPosts();
    await createInitialComments();
    await createInitialCommentUpvotes();
    await createInitialMessages();
    await createInitialFriendsList();
    await requestFriend(3, 2);
  } catch (error) {
    console.error(chalk.red("error rebuilding the db!", error));
    //throw error;ror;
  }
};

module.exports = {
  createInitialUsers,
  createInitialPosts,
  createInitialComments,
  createInitialCommentUpvotes,
  createInitialMessages,
  createInitialFriendsList,
  rebuildDB,
  createTables,
  dropTables,
};
