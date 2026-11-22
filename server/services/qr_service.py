import qrcode
from dotenv import load_dotenv
import io
import os

load_dotenv()

class QRService:
    def generate_url(self, room):
        return f'{os.environ.get("WAIT_URL")}{room.id}'

    def qr_to_bytes(self, url):
        qr = qrcode.make(url)
        buffer = io.BytesIO()
        qr.save(buffer, format="PNG")
        buffer.seek(0)

        return buffer