import { Controller } from '@nestjs/common';
import {
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';

interface Rooms {
    id: string;
    users: string[];
};

@Controller()
@WebSocketGateway({
    cors: { origin: '*' },
})
export class ChatController implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    constructor(private chatService: ChatService) {}

    @WebSocketServer() server: Server;

    afterInit() {
        console.log("Websocket started");
    };

    handleConnection(client: Socket) {
        console.log(`Client ${client.id} connected`);
        this.getAllConnectedClients();
    };

    handleDisconnect(client: Socket) {
        const roomId = this.chatService.findRoomByClientId(client.id);

        const message = `Client ${client.id} disconnected`;

        if (roomId) {
            this.leaveRoom(client, roomId);
        };

        console.log(message);
        this.getAllConnectedClients();
    };

    @SubscribeMessage("create_room")
    createRoom(client: Socket) {
        const { roomId } = this.chatService.createRoom(client.id);

        if (roomId) {
            console.log(`Client ${client.id} created room ${roomId}`);
        };

        return { roomId };
    };

    @SubscribeMessage("join_room")
    joinRoom(client: Socket, roomId: string) {
        const { success } = this.chatService.joinRoom(client.id, roomId);

        if (success) {
            const message = `Client ${client.id} joined`;

            client.join(roomId);
            this.sendMessage(client, {roomId, message});
            console.log(`Client ${client.id} joined room ${roomId}`);
        };

        return { success };
    };

    @SubscribeMessage("leave_room")
    leaveRoom(client: Socket, roomId: string) {
        const message = `Client ${client.id} left room ${roomId}`;
        this.sendMessage(client, {roomId, message});
        
        const { success } = this.chatService.leaveRoom(client.id, roomId);

        if (success) {
            client.leave(roomId);
            console.log(message);
        };

        return { success };
    };

    @SubscribeMessage("send_message")
    sendMessage(client: Socket, {roomId, message}: {roomId: string, message: string}) {
        if (roomId) {

            const { success } = this.chatService.sendMessage(client.id, roomId, message);
    
            if (success) {
                console.log(`Message: ${message} sent by client ID: ${client.id} in room ID: ${roomId}`);
            } else {
                console.log(`Client ${client.id} is not in a room, or room ${roomId} no longer exists`);
            };

            return { success };
        };    

        return { success: false };
    };

    @SubscribeMessage("connected_clients")
    connectedClients(client: Socket, roomId: string) {
        console.log(roomId)
        const total = this.chatService.connectedClients(roomId);

        return total;
    };


    private getAllConnectedClients() {
        const connectedClients = this.server.sockets.sockets;

        connectedClients.forEach((ele) => {
            console.log(`Online client: ${ele.id}`);
        });

        console.log(`Total clients connected: ${connectedClients.size}`);
    };
};