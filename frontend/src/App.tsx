import React from "react";
import { io } from "socket.io-client";

const socketAddress = "http://192.168.0.3:3000";
// const socketAddress = "http://localhost:3000";

interface Room {
    roomId: string;
};

interface JoinedRoom {
    success: boolean
};

interface Requests {
    [key: string]: {
        command: string;
        helpMessage: string
    };
};

const requests: Requests = {
    join: {command: "/JOIN", helpMessage: `ROOM_ID ===> JOINS A ROOM WITH THE GIVEN ID`},
    create: {command: "/CREATE", helpMessage: `===> CREATES AND JOINS A ROOM`},
    leave: {command: "/LEAVE", helpMessage: `===> LEAVES ASSIGNED ROOM`},
    id: {command: "/ID", helpMessage: `===> SHOWS ASSIGNED ROOM ID`},
    sid: {command: "/SID", helpMessage: `===> SHOWS ASSIGNED SOCKET ID`},
    clean: {command: "/CLEAN", helpMessage: `===> REMOVES ALL PREVIOUS MESSAGES`},
    copy: {command: "/COPY", helpMessage: `===> COPIES THE ROOM ID TO CLIPBOARD`},
    count: {command: "/COUNT", helpMessage: `===> SHOWS TOTAL CLIENTS CONNECTED TO ROOM`},
    help: {command: "/HELP", helpMessage: `===> DISPLAYS AVAILABLE COMMANDS`}
};

function App() {
    const [socket, setSocket] = React.useState<any>();

    const [input, setInput] = React.useState("");
    const [output, setOutput] = React.useState(["<?>", "WELCOME TO THE RIDDLER'S CHAT", "TYPE /HELP AT ANY MOMENT TO SEE AVAILABLE COMMANDS"]);

    const [roomId, setRoomId] = React.useState("");
    const [isNewRoom, setIsNewRoom] = React.useState(false);

    React.useEffect(() => {
        const newSocket = io(socketAddress);
        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, []);

    React.useEffect(() => {
        if (roomId.length > 0 && isNewRoom) {
            handleJoinRoom(roomId, true);
            setIsNewRoom(false);
        };
    }, [roomId]);

    React.useEffect(() => {
        if (socket) {
            const handleMessage = (ele: string) => {
                const message = ele;
                setOutput((prevOutput) => [...prevOutput, message]);
            };

            socket.on(roomId, handleMessage);

            return () => {
                socket.off(roomId, handleMessage);
            };
        };
    }, [socket, roomId]);

    const handleCreateRoom = async () => {
        setOutput(output => [...output, input]);

        if (roomId.length > 0) {
            setOutput([...output, input, `ALREADY ASSIGNED TO A ROOM`, `USE /LEAVE TO LEAVE ASSIGNED ROOM AND TRY AGAIN`]);
        } else {
            socket.emit("create_room", (response: Room) => {
                const RID = response.roomId;
                setRoomId(RID);
            });
        };
    };

    const handleJoinRoom = (room: string, createdAndJoined: boolean = false) => {
        if (!room) {return setOutput([...output, `ROOM ID INVALID`, `PLEASE ENTER A VALID ROOM ID`])};

        if (roomId.length > 0 && room !== roomId) {
            setOutput([...output, input, `ALREADY ASSIGNED TO A ROOM`, `USE /LEAVE TO LEAVE ASSIGNED ROOM AND TRY AGAIN`]);
        } else if (room === roomId && !createdAndJoined) {
            setOutput([...output, input, `ALREADY JOINED ROOM`]);
        } else {
            const message = createdAndJoined === true ? `CREATED AND JOINED ROOM ${room}` : `JOINED ROOM ${room}`;

            socket.emit("join_room", room, (response: JoinedRoom) => {
                // console.log(response);
                if (response.success) {
                    setRoomId(room);
                    setOutput([input, message]);
                } else {
                    setOutput([...output, input, `ROOM ID INVALID`, `PLEASE ENTER A VALID ROOM ID`]);
                };
            });
        };

        setInput("");
    };

    const handleLeaveRoom = () => {
        const validRoomId = `LEFT ROOM ${roomId}`;
        const invalidRoomId = `NOT ASSIGNED TO A ROOM`;

        if (!roomId || roomId.length === 0) {
            setOutput([...output, input, invalidRoomId]);
        } else {
            socket.emit("leave_room", roomId);
            setRoomId("");
            setOutput([input, validRoomId]);            
        };
        setInput("");
    };

    const handleIdRequest = () => {
        const message = roomId.length > 0 ? `ASSIGNED TO ROOM ${roomId}` : "NOT ASSIGNED TO A ROOM";
        setOutput([...output, input, message]);
        setInput("");
    };

    const handleSocketIdRequest = () => {
        const message = `SOCKET ID ${socket.id}`;
        setOutput([...output, input, message]);
        setInput("");
    };

    const handleCleanRequest = () => {
        setOutput([]);
        setInput(""); 
    };

    const handleCopyRoomIdRequest = () => {
        if (!roomId || roomId.length === 0) {
            setOutput([...output, input, "NOT ASSIGNED TO A ROOM", "NOTHING TO COPY"]);            
        } else {
            navigator.clipboard.writeText(roomId);
            setOutput([...output, input, `ROOM ID ${roomId} COPIED TO CLIPBOARD`]);
        };

        setInput("");
    };

    const handleHelpRequest = () => {
        const message = [
            `AVAILABLE COMMANDS:`
        ];

        for (const key in requests) {
            const innerObject = requests[key];
            message.push(`${innerObject.command} ${innerObject.helpMessage}`);
        };

        setOutput([...output, input, ...message]);
        setInput("");
    };

    const handleCountRequest = () => {
        setOutput(output => [...output, input]);

        if (!roomId) {
            setOutput(output => [...output, "NOT ASSIGNED TO A ROOM"]);
        } else {
            socket.emit("connected_clients", roomId, (response: number) => {
                setOutput(output => [...output, `TOTAL CLIENTS CONNECTED: ${response}`]);
            });
        };

        setInput("");
    };

    const handleSendMessage = (message: string) => {
        if (!roomId) {
            setOutput(output => [...output, message]);    
        } else {
            socket.emit("send_message", { roomId, message });
        };
        setInput("");
    };

    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInput(e.target.value);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();
            
            const command = input.split(" ")[0].toUpperCase();
        
            switch (command) {
                case requests.create.command:
                    setIsNewRoom(true);
                    handleCreateRoom();
                    break;
                case requests.join.command:
                    const RID = input.split(" ")[1] ? input.split(" ")[1].toUpperCase() : undefined;

                    if (!RID) {
                        setOutput([...output, input, `MISSING ROOM ID TO JOIN A ROOM`]);
                        setInput("");
                    } else {
                        handleJoinRoom(RID, false);
                    };
                    break;
                case requests.leave.command:
                    handleLeaveRoom();
                    break;
                case requests.sid.command:
                    handleSocketIdRequest();
                    break;
                case requests.id.command:
                    handleIdRequest();
                    break;
                case requests.clean.command:
                    handleCleanRequest();
                    break;
                case requests.copy.command:
                    handleCopyRoomIdRequest();
                    break;
                case requests.help.command:
                    handleHelpRequest();
                    break;
                case requests.count.command:
                    handleCountRequest();
                    break;
                default:
                    handleSendMessage(input);
                    break;
            }
        };
    };

    return (
        <main className="w-screen p-2">
            <div className="w-5/6 m-auto">
                {output.map((message, index) => (
                    <div key={index} className="text-green-600 font-semibold tracking-widest">
                        {`>  ${message.toUpperCase()}`}
                    </div>
                ), 0)}

                <form className="flex">
                    <span className="text-green-600 font-semibold tracking-widest">{">"}</span>&nbsp;

                    <input
                        className="w-11/12 p-1 border border-t-0 border-r-0 border-l-0 border-green-600 bg-black text-green-600 font-semibold tracking-widest"
                        type="text"
                        value={input}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                    />
                </form>
            </div>
        </main>
    );
}

export default App;
