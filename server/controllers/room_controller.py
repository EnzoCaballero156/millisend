from flask import Blueprint, jsonify, request, session, send_file

from repositories.room.room_repository import RoomRepository
from repositories.room_member.room_member_repository import RoomMemberRepository
from services.room_service import RoomService
from services.room_member_service import RoomMemberService
from services.qr_service import QRService

room_bp = Blueprint("room_bp", __name__)

room_repository = RoomRepository()
room_member_repository = RoomMemberRepository()
room_service = RoomService(room_repository)
room_member_service = RoomMemberService(room_member_repository, room_repository)
qr_service = QRService()

@room_bp.get("/")
def get_room_data():
    username = session.get("username")
    code = session.get("room")

    if not username or not code:
        return jsonify({"error": "No autorizado."}), 401

    room = room_service.find_by_code(code)

    if room is None:
        return jsonify({"error": "La sala no existe."}), 404

    room_members = [member.username for member in room.members]

    return jsonify({
        "message": "Te uniste a la sala.", 
        "username": username,
        "room": code, 
        "roomName": room.name,
        "isHost": username == room.host,
        "host": room.host,
        "members": room_members,
        "expiresAt": room.expiresAt
    })

@room_bp.get("/<id>/exists")
def room_existence(id):
    room = room_service.find_by_id(id)
    if room is None:
        return jsonify({"error": "La sala no existe."}), 404

    return jsonify({
        "name": room.name, 
        "code": room.code, 
        "host": room.host
    })

@room_bp.post("/")
def join():
    data = request.get_json()
    username = data.get("username")
    code = data.get("code")

    if not username:
        return jsonify({"error": "Ingrese un nombre/apodo."}), 401

    if not code:
        return jsonify({"error": "Ingrese un código de sala."}), 401

    room = room_service.find_by_code(code)

    if room is None:
        return jsonify({"error": "La sala no existe."}), 404

    user_exists = room_member_service.find_by_username_and_room_code(username, room.id) is not None

    if user_exists:
        return jsonify({"error": "Ya existe un miembro con el mismo nombre de usuario."}), 401

    room_members = [member.username for member in room.members]

    session["room"] = code
    session["username"] = username
    
    return jsonify({
        "message": "Te uniste a la sala.", 
        "room": code, 
        "roomName": room.name,
        "isHost": False,
        "host": room.host,
        "members": room_members,
        "expiresAt": room.expiresAt
    })

@room_bp.post("/leave")
def leave():
    session.pop("room")
    session.pop("username")
    return jsonify({"message": "Saliste de la sala."})

@room_bp.post("/create")
def create_room():
    data = request.get_json()
    username = data.get("username")
    room_name = data.get("roomName")

    if not username:
        return jsonify({"error": "Ingrese un nombre/apodo."}), 401
    
    if not room_name:
        return jsonify({"error": "Ingrese un nombre de sala."}), 401

    new_room = room_service.create(room_name, username)

    session["room"] = new_room.code
    session["username"] = username

    return jsonify({
        "message": "Sala creada.", 
        "room": new_room.code, 
        "roomName": new_room.name,
        "isHost": True,
        "host": username,
        "expiresAt": new_room.expiresAt
    })

@room_bp.get("/files/<room_code>")
def show_files(room_code):
    room = room_service.find_by_code(room_code)
    if room is None:
        return jsonify({"error": "Sala no encontrada."}), 404

    return jsonify({
        "files": [
            {
                "name": file.name,
                "url": file.url,
                "type": file.type,
                "size": file.size
            } for file in room.files
        ]
    })

@room_bp.get('/qr')
def get_qr():
    code = session.get("room")
    if not code:
        return jsonify({"error": "No autorizado."}), 401
    
    room = room_service.find_by_code(code)
    if room is None:
        return jsonify({"error": "La sala no existe."}), 404

    url = qr_service.generate_url(room)
    buffer = qr_service.qr_to_bytes(url)

    return send_file(
        buffer,
        mimetype="image/png",
        as_attachment=False,
        download_name='qr.png'
    )

@room_bp.get('/invitation')
def get_invitation_url():
    code = session.get("room")
    if not code:
        return jsonify({"error": "No autorizado."}), 401
    
    room = room_service.find_by_code(code)
    if room is None:
        return jsonify({"error": "La sala no existe."}), 404

    return jsonify({"url": qr_service.generate_url(room)})
