import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import api from "../../services/api"
import { useSession } from "../../context/SessionContext"
import Logo from "../../components/Logo"
import "../Home/Home.css"
import "./Wait.css"

const Wait = ({ onRoomLoaded, onLoginClick, onRegisterClick, onLogoutClick }) => {
    const { user } = useSession()

    const [joinUsername, setJoinUsername] = useState("")
    const [roomData, setRoomData] = useState(null)
    const [errorMsg, setErrorMsg] = useState("")
    const [submitting, setSubmitting] = useState(false)

    const navigate = useNavigate()
    const { id } = useParams()

    useEffect(() => {
        if (!id) return;
        roomExists(id);
    }, [id])

    const roomExists = async (roomId) => {
        try {
            const res = await api.get(`/api/room/${roomId}/exists`)
            if (res.data) setRoomData(res.data)
        } catch (err) {
            console.error(err)
            window.location.href = '/'
        }
    }

    const handleJoinRoom = async (e) => {
        e.preventDefault();
        if (!roomData) return;
        setErrorMsg("")
        setSubmitting(true)
        try {
            await api.post('/api/room/', {
                username: joinUsername.trim(),
                code: roomData.code
            });
            await onRoomLoaded();
            navigate('/room')
        } catch (err) {
            console.error(err)
            setErrorMsg(err.response?.data?.error || "No se pudo entrar a la sala.")
            setSubmitting(false)
        }
    };

    return (
        <div className="home-page wait-page">
            <header className="home-header">
                <Logo />
                <div className="header-actions">
                    {user ? (<>
                        <p>{user.email}</p>
                        <button type="button" className="btn-outline" onClick={onLogoutClick}>
                            Cerrar sesión
                        </button>
                    </>) : (<>
                        <button type="button" className="btn-outline" onClick={onLoginClick}>
                            Iniciar sesión
                        </button>
                        <button type="button" className="btn-outline" onClick={onRegisterClick}>
                            Crear cuenta
                        </button>
                    </>)}
                </div>
            </header>

            <main className="wait-main">
                {roomData ? (<>
                    <section className="wait-info">
                        <h2 className="wait-lead">Vas a unirte a la siguiente sala:</h2>
                        <h1 className="wait-room-name">{roomData.name}</h1>
                        <p className="wait-host">
                            <strong>Anfitrión:</strong> <span>{roomData.host}</span>
                        </p>
                    </section>

                    <section className="card-box wait-card">
                        <h2>¡Únete ahora!</h2>
                        <p className="card-desc">Ingresa tu nombre o apodo para acceder.</p>

                        {errorMsg && <div className="error-toast">{errorMsg}</div>}

                        <form onSubmit={handleJoinRoom}>
                            <label className="input-label" htmlFor="wait-username">Tu nombre o apodo</label>
                            <input
                                id="wait-username"
                                type="text"
                                className="text-input"
                                placeholder="¿Cómo te identificarán?"
                                autoComplete="nickname"
                                autoFocus
                                value={joinUsername}
                                onChange={(e) => setJoinUsername(e.target.value)}
                            />
                            <button
                                type="submit"
                                className="btn-primary"
                                disabled={submitting || joinUsername.trim().length === 0}
                            >
                                {submitting ? "Uniéndose..." : "Unirse a sala"}
                            </button>
                        </form>
                    </section>
                </>) : (
                    <p className="wait-loading">Cargando sala...</p>
                )}
            </main>
        </div>
    )
}

export default Wait