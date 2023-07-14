"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatService = void 0;
const common_1 = require("@nestjs/common");
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
;
let ChatService = exports.ChatService = class ChatService {
    constructor() {
        this.rooms = {};
    }
    createRoom(clientId) {
        const roomId = this.generateRoomId();
        const room = {
            [String(roomId)]: []
        };
        this.rooms = { ...this.rooms, ...room };
        return { roomId };
    }
    ;
    generateRoomId() {
        return `RID${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
    }
    ;
    joinRoom(clientId, roomId) {
        const roomExists = this.rooms[roomId];
        if (roomExists) {
            roomExists.push(clientId);
            return { success: true };
        }
        ;
        return { success: false };
    }
    ;
    leaveRoom(clientId, roomId) {
        const roomExists = this.rooms[roomId];
        let obj = false;
        if (roomExists) {
            const userIndex = roomExists.indexOf(clientId);
            if (userIndex !== -1) {
                roomExists.splice(userIndex, 1);
                obj = true;
            }
            ;
        }
        ;
        this.filterUnassignedRooms();
        return { success: obj };
    }
    ;
    sendMessage(clientId, roomId, message) {
        const roomExists = this.rooms[roomId];
        const isClientAssigned = roomExists.includes(clientId);
        if (roomExists && isClientAssigned) {
            this.server.to(roomId).emit(roomId, message);
            return { success: true };
        }
        ;
        return { success: false };
    }
    ;
    connectedClients(roomId) {
        console.log(roomId);
        const roomExists = this.rooms[roomId];
        console.log(roomExists);
        return roomExists.length;
    }
    ;
    findRoomByClientId(clientId) {
        for (const key in this.rooms) {
            const array = this.rooms[key];
            if (array.includes(clientId)) {
                return key;
            }
            ;
        }
        ;
        return "";
    }
    ;
    filterUnassignedRooms() {
        console.log(this.rooms);
        for (const key in this.rooms) {
            const element = this.rooms[key];
            if (element.length === 0) {
                delete this.rooms[key];
            }
            ;
        }
        ;
        console.log(this.rooms);
    }
    ;
};
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], ChatService.prototype, "server", void 0);
exports.ChatService = ChatService = __decorate([
    (0, common_1.Injectable)(),
    (0, websockets_1.WebSocketGateway)({
        cors: { origin: '*' },
    })
], ChatService);
;
//# sourceMappingURL=chat.service.js.map