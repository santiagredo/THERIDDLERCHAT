import { Server } from "socket.io";
export declare class ChatService {
    server: Server;
    private rooms;
    createRoom(clientId: string): {
        roomId: string;
    };
    private generateRoomId;
    joinRoom(clientId: string, roomId: string): {
        success: boolean;
    };
    leaveRoom(clientId: string, roomId: string): {
        success: boolean;
    };
    sendMessage(clientId: string, roomId: string, message: string): {
        success: boolean;
    };
    connectedClients(roomId: string): number;
    findRoomByClientId(clientId: string): string;
    private filterUnassignedRooms;
}
