import uvicorn
from renus.app import App
import routes.index

# uncomment if you want use Crypto
#from extension.codenus.user.crypt import Crypto
#
# JsonResponse.cryptor=Crypto
# Request.cryptor=Crypto

workers = 8

app = App()

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1",
                port=4000,server_header=False,workers=workers,
                reload=True, log_level="info",
                headers=[
                    ("X-Frame-Options", 'DENY'),
                    ("Access-Control-Allow-Headers", '*'),
                    ("Access-Control-Allow-Origin", '*')
                ])
