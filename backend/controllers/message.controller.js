import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import { getReceiverSocketId,io} from "../socket/socket.js";

export const sendMessage = async(req,res) => {
    try {
        const {message} = req.body
        const {id: receiverId} = req.params
        const senderId = req.user._id

        let conversation = await Conversation.findOne({
            participants: {$all : [senderId,receiverId]}
        })

        if(!conversation){
           conversation = await Conversation.create({
            participants: [senderId,receiverId]
           })
        }

        const newMessage = new Message({
            senderId,
            receiverId,
            message
        })

        if(newMessage){
            conversation.messages.push(newMessage._id)
        }

        // this runs in parallel
        await Promise.all([conversation.save(),newMessage.save()])

        res.status(201).json(newMessage)

        // Emit message to the receiver via socket
        const receiverSocketId = getReceiverSocketId(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", newMessage);
        }


    } catch (error) {
        console.log("error in sendMessage controller",error.message)
        return res.status(500).json({error:"internal server error"})
    }
}

export const getMessage = async(req,res) => {
    try {
        const {id:userTochatId} = req.params
        const senderId = req.user._id

        const conversation = await Conversation.findOne({
            participants:{$all:[senderId,userTochatId]}
        }).populate("messages")//populate gives the content of message not its id 

        if(!conversation){
            return res.status(200).json([])
        }
        
        const messages = conversation.messages

        res.status(200).json(messages)


    } catch (error) {
        console.log("error in getMessage controller",error.message)
        return res.status(500).json({error:"internal server error"})
    }
}