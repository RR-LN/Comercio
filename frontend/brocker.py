from celery import Celery

app = Celery('tasks', broker='redis://localhost:6379/0', backend='redis://localhost:6379/0')

@app.task
def add(x, y):
    return x + y

# Acessando o URL do broker
print(app.conf.broker_url)  # imprime: redis://localhost:6379/0

# Acessando o resultado do backend
result = add.delay(4, 4)
print(result.backend)  # imprime: redis://localhost:6379/0
print(result.result)  # imprime: 8
