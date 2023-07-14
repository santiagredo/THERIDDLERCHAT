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
exports.ChatController = void 0;
const common_1 = require("@nestjs/common");
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const chat_service_1 = require("./chat.service");
;
let ChatController = exports.ChatController = class ChatController {
    constructor(chatService) {
        this.chatService = chatService;
    }
    afterInit() {
        console.log("Websocket started");
    }
    ;
    handleConnection(client) {
        console.log(`Client ${client.id} connected`);
        this.getAllConnectedClients();
    }
    ;
    handleDisconnect(client) {
        const roomId = this.chatService.findRoomByClientId(client.id);
        const message = `Client ${client.id} disconnected`;
        if (roomId) {
            this.leaveRoom(client, roomId);
        }
        ;
        console.log(message);
        this.getAllConnectedClients();
    }
    ;
    createRoom(client) {
        const { roomId } = this.chatService.createRoom(client.id);
        if (roomId) {
            console.log(`Client ${client.id} created room ${roomId}`);
        }
        ;
        return { roomId };
    }
    ;
    joinRoom(client, roomId) {
        const { success } = this.chatService.joinRoom(client.id, roomId);
        if (success) {
            const message = `Client ${client.id} joined`;
            client.join(roomId);
            this.sendMessage(client, { roomId, message });
            console.log(`Client ${client.id} joined room ${roomId}`);
        }
        ;
        return { success };
    }
    ;
    leaveRoom(client, roomId) {
        const message = `Client ${client.id} left room ${roomId}`;
        this.sendMessage(client, { roomId, message });
        const { success } = this.chatService.leaveRoom(client.id, roomId);
        if (success) {
            client.leave(roomId);
            console.log(message);
        }
        ;
        return { success };
    }
    ;
    sendMessage(client, { roomId, message }) {
        if (roomId) {
            const { success } = this.chatService.sendMessage(client.id, roomId, message);
            if (success) {
                console.log(`Message: ${message} sent by client ID: ${client.id} in room ID: ${roomId}`);
            }
            else {
                console.log(`Client ${client.id} is not in a room, or room ${roomId} no longer exists`);
            }
            ;
            return { success };
        }
        ;
        return { success: false };
    }
    ;
    connectedClients(client, roomId) {
        console.log(roomId);
        const total = this.chatService.connectedClients(roomId);
        return total;
    }
    ;
    getAllConnectedClients() {
        const connectedClients = this.server.sockets.sockets;
        connectedClients.forEach((ele) => {
            console.log(`Online client: ${ele.id}`);
        });
        console.log(`Total clients connected: ${connectedClients.size}`);
    }
    ;
};
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], ChatController.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)("create_room"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], ChatController.prototype, "createRoom", null);
__decorate([
    (0, websockets_1.SubscribeMessage)("join_room"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, String]),
    __metadata("design:returntype", void 0)
], ChatController.prototype, "joinRoom", null);
__decorate([
    (0, websockets_1.SubscribeMessage)("leave_room"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, String]),
    __metadata("design:returntype", void 0)
], ChatController.prototype, "leaveRoom", null);
__decorate([
    (0, websockets_1.SubscribeMessage)("send_message"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], ChatController.prototype, "sendMessage", null);
__decorate([
    (0, websockets_1.SubscribeMessage)("connected_clients"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, String]),
    __metadata("design:returntype", void 0)
], ChatController.prototype, "connectedClients", null);
exports.ChatController = ChatController = __decorate([
    (0, common_1.Controller)(),
    (0, websockets_1.WebSocketGateway)({
        cors: { origin: '*' },
    }),
    __metadata("design:paramtypes", [chat_service_1.ChatService])
], ChatController);
;
//# sourceMappingURL=chat.controller.js.map