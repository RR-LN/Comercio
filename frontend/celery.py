from __future__ import absolute_import, unicode_literals

import os
from ecommerce_proj.frontend.celery import Celery

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecommerce_proj.settings')

app = Celery('ecommerce_proj')

app.config_from_object('django.conf:settings', namespace='CELERY')

# Load task modules from all registered Django apps
app.autodiscover_tasks(lambda: [n.name for n in os.scandir('.') if n.is_dir() and os.path.exists(os.path.join(n, 'tasks.py'))])

# Set the default broker URL and result backend
app.conf.broker_url = 'amqp://guest:guest@localhost:5672//'  # Update with your broker URL
app.conf.result_backend = 'rpc://'  # Update with your result backend

# Set the timezone to UTC (you can change this to your preferred timezone)
app.conf.timezone = 'UTC'

# Set the task serializer and result serializer
app.conf.task_serializer = 'json'
app.conf.result_serializer = 'json'

# Set the task accept content
app.conf.accept_content = ['json']

# Set the task result expires
app.conf.result_expires = 3600  # 1 hour

# Set the task time limit
app.conf.task_time_limit = 300  # 5 minutes