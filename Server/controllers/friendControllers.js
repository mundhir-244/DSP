const Friend = require('../models/friends')
const User = require('../models/users')

// Add Friend Endpoint
const addFriend = async (req, res) => {
    const { friendsUserName, userId } = req.body

    try {
        // Find the friend by userName and checking if the userName exists
        const friendUserDoc = await User.findOne({ userName: friendsUserName })
        if (!friendUserDoc) {
            return res.json({
                error: `User with username ${friendsUserName} does not exist`,
            })
        }

        // Check if the user is trying to add themselves
        if (friendUserDoc._id.toString() == userId) {  
            return res.json({
                error: 'You cannot add yourself',
            })
        }
        
        
        const usersFriendDoc = await Friend.findOne({ userId: userId })
        const friendsFriendDoc = await Friend.findOne({ userId: friendUserDoc._id.toString() })

        if (usersFriendDoc && friendsFriendDoc) {
            // Check if the friend is already a friend on the users friends list
            const isFriend = usersFriendDoc.friends.some(
                (f) => f.friend == friendUserDoc._id
            )

            if (isFriend) {
                return res.json({
                    error: 'User is already a friend',
                })
            }

            // Check if the user has already sent a friend request to the friend
            const isAlreadyAdded = friendsFriendDoc.friends.some(
                (f) => f.userId == userId
            )

            if (isAlreadyAdded) {
                return res.json({
                    error: 'User has already been added',
                })
            }

            // Add the friend request to the document of the friend
            friendsFriendDoc.friends.push({
                userId: userId,
                status: 'pending'
            })

            await friendsFriendDoc.save();
        }
        else if (usersFriendDoc && !friendsFriendDoc) {
            // Creates a new friend document for the friend as it does not exist
            if (!friendUserDoc) {
                await Friend.create({
                    _id: friendUserDoc._id.toString(),
                    userId: friendUserDoc._id.toString(),
                    friends: [{
                        userId: userId,
                        status: 'pending'
                    }]
                })
            }
        }
        else {
            // Create a new friend document for the friend and user if it does not exist
            if (!friendsFriendDoc) {
                await Friend.create({
                    _id: friendUserDoc._id.toString(),
                    userId: friendUserDoc._id.toString(),
                    friends: [{
                        userId: userId,
                        status: 'pending'
                    }]
                })
            } else {
                friendsFriendDoc.friends.push({
                    userId: userId,
                    status: 'pending'
                });

                await friendsFriendDoc.save();
            }

            await Friend.create({
                _id: userId,
                userId: userId
            })
        }

        return res.json({
            message: 'Friend request sent successfully',
        })
    } catch (error) {
        console.error(error)
        return res.json({
            error: 'Server error, please try again later',
        })
    }
}

// View Friend Requests Endpoint
const getFriendRequests = async (req, res) => {
    const { userId } = req.body

    try {
        // Find the friend's document for the given userId
        const usersFriendDoc = await Friend.findOne({ userId: userId })

        if (usersFriendDoc != null) {
            const friendRequestsDoc = (usersFriendDoc.friends).filter(request => request.status == 'pending')
            let formattedFriendRequests = []
    
            for (const friendRequest of friendRequestsDoc) {
                const userDoc = await User.findOne({ _id: friendRequest.userId });
                if (userDoc) {
                    formattedFriendRequests.push({ userName: userDoc.userName, userId: userDoc._id });
                }
            }
            return res.json(formattedFriendRequests)
        }
        
    } catch (error) {
        console.error(error)
        return res.json({ error: 'Server error, please try again later' })
    }
}

// Accept friend requests endpoint
const acceptFriendRequest = async (req, res) => {
    const { requestUserId, userId } = req.body;

    try {
        // Accept friend request in current user's Friend list
        await Friend.updateOne(
            { _id: userId, "friends.userId": requestUserId },
            { $set: { "friends.$.status": "accepted" } }
        );

        // Update requesterDoc’s Friend list
        const requesterDoc = await Friend.findOne({ userId: requestUserId });
        const newFriendEntry = { userId: userId, status: 'accepted' };
        requesterDoc.friends.push(newFriendEntry);
        await requesterDoc.save();

        // Get usernames and stream IDs
        const [thisUser, otherUser] = await Promise.all([
            User.findById(userId, 'userName'),
            User.findById(requestUserId, 'userName'),
        ]);

        const streamUserId1 = thisUser._id.toString();
        const streamUserId2 = otherUser._id.toString();
        const channelId = [streamUserId1, streamUserId2].sort().join('--');

        // Initialize Stream client
        const { StreamChat } = require('stream-chat');
        const serverClient = StreamChat.getInstance(
            process.env.STREAM_API_KEY,
            process.env.STREAM_API_SECRET
        );

        // Create Stream channel
        const channel = serverClient.channel('messaging', channelId, {
            members: [streamUserId1, streamUserId2],
            created_by_id: streamUserId2,
        });

        await channel.create();

        return res.json({ message: 'Friend request accepted' });

    } catch (error) {
        console.error('Stream error, rolling back MongoDB changes:', error.message);

        // Rollback DB changes
        try {
            await Friend.updateOne(
                { _id: userId },
                { $set: { "friends.$[elem].status": "pending" } },
                {
                    arrayFilters: [{ "elem.userId": requestUserId }]
                }
            );

            await Friend.updateOne(
                { userId: requestUserId },
                { $pull: { friends: { userId: userId } } }
            );
        } catch (rollbackError) {
            console.error('Rollback failed:', rollbackError.message);
        }

        return res.status(500).json({
            error: 'Error creating Stream channel. Changes rolled back.',
        });
    }
}


module.exports = {
    addFriend,
    getFriendRequests,
    acceptFriendRequest
}
