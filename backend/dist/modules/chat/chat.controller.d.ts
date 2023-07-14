import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
export declare class ChatController implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    private chatService;
    constructor(chatService: ChatService);
    server: Server;
    afterInit(): void;
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    createRoom(client: Socket): {
        roomId: string;
    };
    joinRoom(client: Socket, roomId: string): {
        success: boolean;
    };
    leaveRoom(client: Socket, roomId: string): {
        success: boolean;
    };
    sendMessage(client: Socket, { roomId, message }: {
        roomId: string;
        message: string;
    }): {
        success: boolean;
    };
    connectedClients(client: Socket, roomId: string): number;
    private getAllConnectedClients;
}
