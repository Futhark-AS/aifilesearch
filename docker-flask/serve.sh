# serve.sh
#!/bin/bash
# run with gunicorn (http://docs.gunicorn.org/en/stable/run.html#gunicorn)
gunicorn --chdir app  -b :2468 flask-api:app
