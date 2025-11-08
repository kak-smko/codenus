import uvicorn,os
import multiprocessing
from renus.app import App
import routes.index

workers = multiprocessing.cpu_count() * 2 + 1

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
