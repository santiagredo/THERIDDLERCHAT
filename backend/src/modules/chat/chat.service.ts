import { Injectable } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';

import { Server } from "socket.io";

interface Rooms {
    [roomId: string]: string[]
};

@Injectable()
@WebSocketGateway({
    cors: { origin: '*' },
})
export class ChatService {
    @WebSocketServer() server: Server;

    private rooms: Rooms = {};

    createRoom(clientId: string): {roomId: string} {
        const roomId = this.generateRoomId();
        
        const room: Rooms = {
            [String(roomId)]: []    
        };

        this.rooms = { ...this.rooms, ...room};

        return { roomId };
    };

    private generateRoomId(): string {
        return `RID${Math.random().toString(36).substring(2,9).toUpperCase()}`;
    };

    joinRoom(clientId: string, roomId: string): { success: boolean } {
        const roomExists = this.rooms[roomId];

        if (roomExists) {
            roomExists.push(clientId);
            return { success: true };
        };

        return { success: false };
    };

    leaveRoom(clientId: string, roomId: string): { success: boolean } {
        const roomExists = this.rooms[roomId];
        let obj = false;

        if (roomExists) {
            const userIndex = roomExists.indexOf(clientId);

            if (userIndex !== -1) {
                roomExists.splice(userIndex, 1);
                // return { success: true };
                obj = true;
            };

            // return { success: false };
        };

        // return { success: false };
        this.filterUnassignedRooms();

        return { success: obj };
    };

    sendMessage(clientId: string, roomId: string, message: string): { success: boolean } {
        const roomExists = this.rooms[roomId];
        const isClientAssigned = roomExists.includes(clientId);
        // console.log(roomId)

        if (roomExists && isClientAssigned) {
            this.server.to(roomId).emit(roomId, message);
            return { success: true };
        };

        return { success: false };
    };

    connectedClients(roomId: string): number {
        console.log(roomId)
        const roomExists = this.rooms[roomId];
        console.log(roomExists)
        
        return roomExists.length;
    };

    findRoomByClientId(clientId: string): string {
        for (const key in this.rooms) {
            const array = this.rooms[key];

            if (array.includes(clientId)) {
                return key;
            };
        };

        return "";
    };

    private filterUnassignedRooms() {
        console.log(this.rooms);
        for (const key in this.rooms) {
            const element = this.rooms[key];

            if (element.length === 0) {
                delete this.rooms[key];
            };
        };
    
        console.log(this.rooms);
    };
};